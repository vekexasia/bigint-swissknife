/**
 * Native Node.js binding loader.
 *
 * This module loads the Rust native bindings via napi-rs synchronously.
 * If loading fails, {@link getNativeSync} throws — this subpath does NOT provide a
 * fallback implementation. Use the main package entry point for automatic fallback
 * to the JS implementation.
 */

import type { BigIntBuffer2Extended } from '../types.js';

/**
 * Native-specific extended interface.
 * - `toBufferBE`/`toBufferLE` return Node.js `Buffer`
 * - `toBufferBEInto`/`toBufferLEInto` accept `Buffer` only
 */
export type NativeBigIntBuffer2Extended =
  Omit<BigIntBuffer2Extended<Buffer>, 'toBufferBE' | 'toBufferLE'> & {
    toBufferBE(num: bigint, width: number): Buffer;
    toBufferLE(num: bigint, width: number): Buffer;
  };

import { createSignedReader } from '../signed.js';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

/**
 * Native binding interface matching the napi-rs exports.
 * Note: napi-rs uses camelCase with lowercase 'i' in Bigint.
 * Rust accepts &[u8] slices which work with both Buffer and Uint8Array (zero-copy).
 */
interface NativeBinding {
  toBigintBe(buffer: Buffer | Uint8Array): bigint;
  toBigintLe(buffer: Buffer | Uint8Array): bigint;
  // Fast versions using &[u8] slice (avoids Uint8Array overhead)
  toBufferBeFast(num: bigint, buffer: Buffer | Uint8Array): void;
  toBufferLeFast(num: bigint, buffer: Buffer | Uint8Array): void;
}

let nativeBinding: NativeBigIntBuffer2Extended | null = null;
let loadAttempted = false;

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
function createWrapper(binding: NativeBinding): NativeBigIntBuffer2Extended {
  const toBigIntBE = (buffer: Buffer | Uint8Array) => {
    return binding.toBigintBe(buffer);
  };
  const toBigIntLE = (buffer: Buffer | Uint8Array) => {
    return binding.toBigintLe(buffer);
  };

  return {
    toBigIntBE,
    toBigIntLE,
    toBigIntBESigned: createSignedReader(toBigIntBE),
    toBigIntLESigned: createSignedReader(toBigIntLE),
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
    toBufferBEInto: (num: bigint, buffer: Buffer) => {
      binding.toBufferBeFast(num, buffer);
    },
    toBufferLEInto: (num: bigint, buffer: Buffer) => {
      binding.toBufferLeFast(num, buffer);
    },
  };
}

/**
 * Attempt to load native bindings synchronously.
 * @returns The native binding wrapper, or null if not available
 */
function loadNativeSync(): NativeBigIntBuffer2Extended | null {
  if (loadAttempted) {
    return nativeBinding;
  }
  loadAttempted = true;

  try {
    // napi-rs generates platform-specific bindings
    const moduleName = getNativeModuleName();
    const nativeFile = `index.${moduleName}.node`;

    // Get the directory of this file and create require function
    let currentDir: string;
    let esmRequire: NodeRequire;

    if (typeof import.meta?.url === 'string') {
      // ESM context
      currentDir = dirname(fileURLToPath(import.meta.url));
      esmRequire = createRequire(import.meta.url);
    } else if (typeof __dirname === 'string' && typeof require !== 'undefined') {
      // CJS context
      currentDir = __dirname;
      esmRequire = require;
    } else {
      // Fallback
      currentDir = join(process.cwd(), 'dist');
      esmRequire = createRequire(join(currentDir, 'index.js'));
    }

    // Try multiple paths to find the native module
    // Note: We intentionally do NOT search process.cwd() to avoid loading untrusted binaries
    const pathsToTry = [
      join(currentDir, '..', nativeFile), // from dist/
      join(currentDir, '..', '..', nativeFile), // from src/native/
    ];

    for (const nativePath of pathsToTry) {
      if (existsSync(nativePath)) {
        const binding: NativeBinding = esmRequire(nativePath);
        nativeBinding = createWrapper(binding);
        return nativeBinding;
      }
    }

    return null;
  } catch {
    // Native binding not available for this runtime/platform.
    return null;
  }
}

/**
 * Get the native implementation synchronously.
 * Throws if native bindings are unavailable — this subpath has no fallback.
 *
 * @returns NativeBigIntBuffer2Extended (native bindings, with Buffer-returning alloc methods and Buffer-only Into methods)
 * @throws if native bindings failed to load
 */
export function getNativeSync(): NativeBigIntBuffer2Extended {
  const native = loadNativeSync();
  if (!native) throw new Error('Native bindings not available');
  return native;
}

/**
 * Check if native bindings are available (synchronous).
 *
 * @returns true if native bindings are loaded
 */
export function isNativeAvailable(): boolean {
  loadNativeSync();
  return nativeBinding !== null;
}

/**
 * Check if native bindings are loaded.
 */
export function isNativeLoaded(): boolean {
  return nativeBinding !== null;
}

// Initialize loading immediately on module load
loadNativeSync();

// Export synchronous API
export const toBigIntBE = (buffer: Buffer | Uint8Array): bigint =>
  getNativeSync().toBigIntBE(buffer);

export const toBigIntLE = (buffer: Buffer | Uint8Array): bigint =>
  getNativeSync().toBigIntLE(buffer);

export const toBigIntBESigned = (buffer: Buffer | Uint8Array): bigint =>
  getNativeSync().toBigIntBESigned(buffer);

export const toBigIntLESigned = (buffer: Buffer | Uint8Array): bigint =>
  getNativeSync().toBigIntLESigned(buffer);

export const toBufferBE = (num: bigint, width: number): Buffer =>
  getNativeSync().toBufferBE(num, width);

export const toBufferLE = (num: bigint, width: number): Buffer =>
  getNativeSync().toBufferLE(num, width);

export const toBufferBEInto = (num: bigint, buffer: Buffer): void =>
  getNativeSync().toBufferBEInto(num, buffer);

export const toBufferLEInto = (num: bigint, buffer: Buffer): void =>
  getNativeSync().toBufferLEInto(num, buffer);

// Backwards compatibility exports (deprecated)
/**
 * @deprecated Use isNativeAvailable() instead. This now returns a resolved promise.
 */
export async function getNative(): Promise<NativeBigIntBuffer2Extended> {
  return getNativeSync();
}

/**
 * @deprecated No longer needed. Native bindings are loaded synchronously on module import.
 */
export const loadingPromise: Promise<NativeBigIntBuffer2Extended | null> = Promise.resolve(nativeBinding);
