/**
 * Native Node.js binding loader.
 *
 * This module attempts to load the Rust native bindings via napi-rs.
 * If loading fails, it provides the fallback implementation.
 */

import type { BigIntBuffer2Extended } from '../types.js';
import { fallback } from '../fallback.js';

/**
 * Native binding interface matching the napi-rs exports.
 * Note: napi-rs uses camelCase with lowercase 'i' in Bigint.
 * Runtime accepts both Buffer and Uint8Array via &[u8] slices.
 */
interface NativeBinding {
  toBigintBe(buffer: Buffer): bigint;
  toBigintLe(buffer: Buffer): bigint;
  // Fast versions using &[u8] slice (avoids Uint8Array overhead)
  toBufferBeFast(num: bigint, buffer: Buffer): void;
  toBufferLeFast(num: bigint, buffer: Buffer): void;
}

let nativeBinding: BigIntBuffer2Extended | null = null;
let loadingPromise: Promise<BigIntBuffer2Extended | null> | null = null;

/**
 * Get the platform-specific native module name.
 */
function getNativeModuleName(): string {
  const platform = process.platform;
  const arch = process.arch;

  // Map to napi-rs naming convention
  const platformMap: Record<string, string> = {
    'darwin-x64': 'darwin-x64',
    'darwin-arm64': 'darwin-arm64',
    'linux-x64': 'linux-x64-gnu',
    'linux-arm64': 'linux-arm64-gnu',
    'win32-x64': 'win32-x64-msvc',
  };

  const key = `${platform}-${arch}`;
  return platformMap[key] || key;
}

/**
 * Create a wrapper around the raw native binding.
 * Note: With &[u8] slices in Rust, both Buffer and Uint8Array are accepted directly
 * without any conversion - zero-copy access.
 */
function createWrapper(binding: NativeBinding): BigIntBuffer2Extended {
  return {
    toBigIntBE: (buffer: Buffer | Uint8Array) => {
      // Rust accepts &[u8] directly - zero-copy for both Buffer and Uint8Array
      return binding.toBigintBe(buffer as Buffer);
    },
    toBigIntLE: (buffer: Buffer | Uint8Array) => {
      // Rust accepts &[u8] directly - zero-copy for both Buffer and Uint8Array
      return binding.toBigintLe(buffer as Buffer);
    },
    toBufferBE: (num: bigint, width: number) => {
      // Handle width <= 0 consistently with fallback (return empty buffer)
      if (width <= 0) {
        return Buffer.alloc(0);
      }
      // Allocate in JS, let Rust fill it via fast path
      const buffer = Buffer.allocUnsafe(width);
      binding.toBufferBeFast(num, buffer);
      return buffer;
    },
    toBufferLE: (num: bigint, width: number) => {
      // Handle width <= 0 consistently with fallback (return empty buffer)
      if (width <= 0) {
        return Buffer.alloc(0);
      }
      // Allocate in JS, let Rust fill it via fast path
      const buffer = Buffer.allocUnsafe(width);
      binding.toBufferLeFast(num, buffer);
      return buffer;
    },
    toBufferBEInto: (num: bigint, buffer: Buffer | Uint8Array) => {
      binding.toBufferBeFast(num, buffer as Buffer);
    },
    toBufferLEInto: (num: bigint, buffer: Buffer | Uint8Array) => {
      binding.toBufferLeFast(num, buffer as Buffer);
    },
  };
}

/**
 * Attempt to load native bindings.
 */
function loadNative(): Promise<BigIntBuffer2Extended | null> {
  // Return existing promise if already loading/loaded
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      // napi-rs generates platform-specific bindings
      const moduleName = getNativeModuleName();
      const nativeFile = `index.${moduleName}.node`;

      // Dynamically load the native module
      const { dirname, join } = await import('path');
      const { existsSync } = await import('fs');
      const { createRequire } = await import('module');

      // Create require function for loading .node files in ESM context
      const require = createRequire(import.meta.url);

      // Get the directory of this file
      let currentDir: string;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (typeof import.meta?.url === 'string') {
        const { fileURLToPath } = await import('url');
        currentDir = dirname(fileURLToPath(import.meta.url));
      } else if (typeof __dirname === 'string') {
        currentDir = __dirname;
      } else {
        currentDir = join(process.cwd(), 'dist');
      }

      // Try multiple paths to find the native module
      const pathsToTry = [
        join(currentDir, '..', nativeFile), // from dist/
        join(currentDir, '..', '..', nativeFile), // from src/native/
        join(process.cwd(), nativeFile), // from cwd
      ];

      for (const nativePath of pathsToTry) {
        if (existsSync(nativePath)) {
          const binding: NativeBinding = require(nativePath);
          nativeBinding = createWrapper(binding);
          return nativeBinding;
        }
      }

      return null;
    } catch (e) {
      // Native binding not available, will use fallback
      console.error('Native binding load error:', e);
      return null;
    }
  })();

  return loadingPromise;
}

/**
 * Get the native implementation or fallback.
 *
 * @returns Promise resolving to BigIntBuffer2Extended implementation
 */
export async function getNative(): Promise<BigIntBuffer2Extended> {
  const native = await loadNative();
  return native ?? fallback;
}

/**
 * Get the native implementation synchronously.
 * Throws if native bindings are not yet loaded.
 *
 * @returns BigIntBuffer2Extended native implementation
 * @throws Error if native bindings are not loaded
 */
export function getNativeSync(): BigIntBuffer2Extended {
  if (!nativeBinding) {
    throw new Error('Native bindings not loaded. Await initNative() first or use the main module exports.');
  }
  return nativeBinding;
}

/**
 * Check if native bindings are available.
 *
 * @returns true if native bindings are loaded
 */
export async function isNativeAvailable(): Promise<boolean> {
  await loadNative();
  return nativeBinding !== null;
}

/**
 * Check if native bindings are loaded (synchronous check).
 */
export function isNativeLoaded(): boolean {
  return nativeBinding !== null;
}

// Initialize loading immediately (fire and forget)
loadNative();

// Export synchronous API - throws if native not loaded, no fallback
export const toBigIntBE = (buffer: Buffer | Uint8Array): bigint =>
  getNativeSync().toBigIntBE(buffer);

export const toBigIntLE = (buffer: Buffer | Uint8Array): bigint =>
  getNativeSync().toBigIntLE(buffer);

export const toBufferBE = (num: bigint, width: number): Buffer | Uint8Array =>
  getNativeSync().toBufferBE(num, width);

export const toBufferLE = (num: bigint, width: number): Buffer | Uint8Array =>
  getNativeSync().toBufferLE(num, width);

export const toBufferBEInto = (num: bigint, buffer: Buffer | Uint8Array): void =>
  getNativeSync().toBufferBEInto(num, buffer);

export const toBufferLEInto = (num: bigint, buffer: Buffer | Uint8Array): void =>
  getNativeSync().toBufferLEInto(num, buffer);

// Export the loading promise for those who want to wait
export { loadingPromise };
