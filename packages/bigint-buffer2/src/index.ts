/**
 * @vekexasia/bigint-buffer2
 *
 * Fast BigInt/Buffer conversion with Rust native bindings, WASM, and JS fallback.
 *
 * @packageDocumentation
 */

import type { BigIntBuffer2, BigIntBuffer2Extended, Implementation } from './types.js';
import { fallback } from './fallback.js';

export type { BigIntBuffer2, BigIntBuffer2Extended, Implementation };

// IS_BROWSER is replaced at build time by the preprocessor
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
const isBrowser = IS_BROWSER;

let _impl: BigIntBuffer2Extended = fallback;
let _implType: Implementation = 'js';
let _initPromise: Promise<void> | null = null;

/**
 * Initialize native bindings for Node.js environments.
 *
 * This is called automatically when the module loads, but you can
 * await this to ensure native bindings are ready before use.
 *
 * @returns Promise that resolves when native bindings are loaded
 */
export async function initNative(): Promise<void> {
  if (isBrowser) return;

  if (_initPromise) {
    return _initPromise;
  }

  _initPromise = (async () => {
    try {
      const native = await import('./native/index.js');
      const isAvailable = await native.isNativeAvailable();
      if (isAvailable) {
        _impl = await native.getNative();
        _implType = 'native';
      }
    } catch {
      // Native not available, stay with fallback
    }
  })();

  return _initPromise;
}

/**
 * Initialize WASM implementation for browser environments.
 *
 * Call this early in your application for best performance.
 * If not called, the JS fallback will be used.
 *
 * @returns Promise that resolves when WASM is loaded
 *
 * @example
 * ```typescript
 * import { initWasm, toBigIntBE } from '@vekexasia/bigint-buffer2';
 *
 * // Initialize WASM (do this once at startup)
 * await initWasm();
 *
 * // Now use the API with WASM acceleration
 * const result = toBigIntBE(buffer);
 * ```
 */
export async function initWasm(): Promise<void> {
  if (!isBrowser) return;

  try {
    const wasm = await import('./wasm/index.js');
    _impl = await wasm.getWasm();
    _implType = wasm.isWasmAvailable() ? 'wasm' : 'js';
  } catch {
    // WASM not available, stay with fallback
  }
}

// Auto-initialize for Node.js (fire and forget, users can await initNative if needed)
if (!isBrowser) {
  initNative();
}

/**
 * Get the current implementation type.
 *
 * @returns 'native' for Rust native bindings, 'wasm' for WebAssembly, 'js' for JavaScript fallback
 *
 * @example
 * ```typescript
 * import { getImplementation } from '@vekexasia/bigint-buffer2';
 *
 * console.log(getImplementation()); // 'native', 'wasm', or 'js'
 * ```
 */
export function getImplementation(): Implementation {
  return _implType;
}

/**
 * Convert a big-endian buffer to BigInt.
 *
 * @param buffer - Big-endian byte buffer
 * @returns BigInt value
 *
 * @example
 * ```typescript
 * const buffer = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
 * const num = toBigIntBE(buffer); // 16909060n
 * ```
 */
export function toBigIntBE(buffer: Buffer | Uint8Array): bigint {
  return _impl.toBigIntBE(buffer);
}

/**
 * Convert a little-endian buffer to BigInt.
 *
 * @param buffer - Little-endian byte buffer
 * @returns BigInt value
 *
 * @example
 * ```typescript
 * const buffer = new Uint8Array([0x04, 0x03, 0x02, 0x01]);
 * const num = toBigIntLE(buffer); // 16909060n
 * ```
 */
export function toBigIntLE(buffer: Buffer | Uint8Array): bigint {
  return _impl.toBigIntLE(buffer);
}

/**
 * Convert BigInt to big-endian buffer with specified width.
 *
 * @param num - BigInt value to convert
 * @param width - Desired buffer width in bytes
 * @returns Big-endian buffer of exactly `width` bytes
 *
 * @example
 * ```typescript
 * const buf = toBufferBE(16909060n, 4);
 * // Uint8Array [0x01, 0x02, 0x03, 0x04]
 * ```
 */
export function toBufferBE(num: bigint, width: number): Buffer | Uint8Array {
  return _impl.toBufferBE(num, width);
}

/**
 * Convert BigInt to little-endian buffer with specified width.
 *
 * @param num - BigInt value to convert
 * @param width - Desired buffer width in bytes
 * @returns Little-endian buffer of exactly `width` bytes
 *
 * @example
 * ```typescript
 * const buf = toBufferLE(16909060n, 4);
 * // Uint8Array [0x04, 0x03, 0x02, 0x01]
 * ```
 */
export function toBufferLE(num: bigint, width: number): Buffer | Uint8Array {
  return _impl.toBufferLE(num, width);
}

/**
 * Convert BigInt to big-endian bytes, writing directly into a provided buffer.
 * This is an optimized version that avoids buffer allocation.
 * Only available when native bindings are loaded.
 *
 * @param num - BigInt value to convert
 * @param buffer - Pre-allocated buffer to write into (width is inferred from length)
 *
 * @example
 * ```typescript
 * const buf = Buffer.alloc(4);
 * toBufferBEInto(16909060n, buf);
 * // buf is now [0x01, 0x02, 0x03, 0x04]
 * ```
 */
export function toBufferBEInto(num: bigint, buffer: Buffer | Uint8Array): void {
  if (_impl.toBufferBEInto) {
    _impl.toBufferBEInto(num, buffer);
  } else {
    // Fallback: use allocating version and copy
    const result = _impl.toBufferBE(num, buffer.length);
    buffer.set(new Uint8Array(result));
  }
}

/**
 * Convert BigInt to little-endian bytes, writing directly into a provided buffer.
 * This is an optimized version that avoids buffer allocation.
 * Only available when native bindings are loaded.
 *
 * @param num - BigInt value to convert
 * @param buffer - Pre-allocated buffer to write into (width is inferred from length)
 */
export function toBufferLEInto(num: bigint, buffer: Buffer | Uint8Array): void {
  if (_impl.toBufferLEInto) {
    _impl.toBufferLEInto(num, buffer);
  } else {
    // Fallback: use allocating version and copy
    const result = _impl.toBufferLE(num, buffer.length);
    buffer.set(new Uint8Array(result));
  }
}

// Re-export fallback for direct access
export { fallback } from './fallback.js';

// Default export for convenience
export default {
  toBigIntBE,
  toBigIntLE,
  toBufferBE,
  toBufferLE,
  toBufferBEInto,
  toBufferLEInto,
  initNative,
  initWasm,
  getImplementation,
};
