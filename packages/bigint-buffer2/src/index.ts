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

// Threshold in bytes above which WASM is faster than JS
const WASM_THRESHOLD = 32;

let _impl: BigIntBuffer2Extended = fallback;
let _wasmImpl: BigIntBuffer2Extended | null = null;
let _implType: Implementation = 'js';
let _initPromise: Promise<void> | null = null;
let _useHybrid = false;

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
 * In browser, this enables hybrid mode: JS for small values (<32 bytes),
 * WASM for large values (>=32 bytes).
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
 * // Now use the API with automatic hybrid optimization
 * const result = toBigIntBE(buffer);
 * ```
 */
export async function initWasm(): Promise<void> {
  if (!isBrowser) return;

  try {
    const wasm = await import('./wasm/index.js');
    const wasmImpl = await wasm.getWasm();
    if (wasm.isWasmAvailable()) {
      _wasmImpl = wasmImpl;
      _useHybrid = true;
      _implType = 'wasm'; // Report as wasm since hybrid uses wasm for large values
    }
  } catch {
    // WASM not available, stay with JS fallback
  }
}

// Auto-initialize for Node.js (fire and forget, users can await initNative if needed)
if (!isBrowser) {
  initNative();
}

/**
 * Get the current implementation type.
 *
 * @returns 'native' for Rust native bindings, 'wasm' for WebAssembly/hybrid, 'js' for JavaScript fallback
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
 * Explicitly set which implementation to use.
 *
 * Use this to force a specific implementation regardless of environment.
 * Useful for benchmarking or when you know which implementation is best for your use case.
 *
 * Note: 'native' only works in Node.js, 'wasm' requires browser environment.
 *
 * @param impl - Implementation to use: 'js', 'wasm', or 'native'
 * @returns Promise that resolves when the implementation is ready
 *
 * @example
 * ```typescript
 * // Force JS fallback
 * await setImplementation('js');
 *
 * // Force WASM (disables hybrid, always uses WASM)
 * await setImplementation('wasm');
 * ```
 */
export async function setImplementation(impl: Implementation): Promise<void> {
  if (impl === 'js') {
    _impl = fallback;
    _implType = 'js';
    _useHybrid = false;
  } else if (impl === 'wasm') {
    if (isBrowser) {
      const wasm = await import('./wasm/index.js');
      const wasmImpl = await wasm.getWasm();
      if (wasm.isWasmAvailable()) {
        _impl = wasmImpl;
        _wasmImpl = wasmImpl;
        _implType = 'wasm';
        _useHybrid = false; // Pure WASM mode, no hybrid
      } else {
        throw new Error('WASM implementation not available');
      }
    } else {
      throw new Error('WASM implementation only available in browser environments');
    }
  } else if (impl === 'native') {
    if (!isBrowser) {
      const native = await import('./native/index.js');
      const isAvailable = await native.isNativeAvailable();
      if (isAvailable) {
        _impl = await native.getNative();
        _implType = 'native';
        _useHybrid = false;
      } else {
        throw new Error('Native implementation not available');
      }
    } else {
      throw new Error('Native implementation only available in Node.js environments');
    }
  } else {
    throw new Error(`Unknown implementation: ${impl}`);
  }
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
  if (_useHybrid && _wasmImpl && buffer.length >= WASM_THRESHOLD) {
    return _wasmImpl.toBigIntBE(buffer);
  }
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
  if (_useHybrid && _wasmImpl && buffer.length >= WASM_THRESHOLD) {
    return _wasmImpl.toBigIntLE(buffer);
  }
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
  if (_useHybrid && _wasmImpl && width >= WASM_THRESHOLD) {
    return _wasmImpl.toBufferBE(num, width);
  }
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
  if (_useHybrid && _wasmImpl && width >= WASM_THRESHOLD) {
    return _wasmImpl.toBufferLE(num, width);
  }
  return _impl.toBufferLE(num, width);
}

/**
 * Convert BigInt to big-endian bytes, writing directly into a provided buffer.
 * This is an optimized version that avoids buffer allocation.
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
  if (_useHybrid && _wasmImpl && buffer.length >= WASM_THRESHOLD) {
    _wasmImpl.toBufferBEInto(num, buffer);
    return;
  }
  _impl.toBufferBEInto(num, buffer);
}

/**
 * Convert BigInt to little-endian bytes, writing directly into a provided buffer.
 * This is an optimized version that avoids buffer allocation.
 *
 * @param num - BigInt value to convert
 * @param buffer - Pre-allocated buffer to write into (width is inferred from length)
 */
export function toBufferLEInto(num: bigint, buffer: Buffer | Uint8Array): void {
  if (_useHybrid && _wasmImpl && buffer.length >= WASM_THRESHOLD) {
    _wasmImpl.toBufferLEInto(num, buffer);
    return;
  }
  _impl.toBufferLEInto(num, buffer);
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
  setImplementation,
};
