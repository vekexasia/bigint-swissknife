/**
 * @vekexasia/bigint-buffer2
 *
 * Fast BigInt/Buffer conversion with Rust native bindings and JS fallback.
 *
 * @packageDocumentation
 */

import type { BigIntBuffer2, BigIntBuffer2Extended, Implementation } from './types.js';
import { fallback } from './fallback.js';

export type { BigIntBuffer2, BigIntBuffer2Extended, Implementation };

// IS_BROWSER is replaced at build time by the preprocessor
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

// Auto-initialize for Node.js (fire and forget, users can await initNative if needed)
if (!isBrowser) {
  initNative();
}

/**
 * Get the current implementation type.
 *
 * @returns 'native' for Rust native bindings, 'js' for JavaScript fallback
 *
 * @example
 * ```typescript
 * import { getImplementation } from '@vekexasia/bigint-buffer2';
 *
 * console.log(getImplementation()); // 'native' or 'js'
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
 * Note: 'native' only works in Node.js.
 *
 * @param impl - Implementation to use: 'js' or 'native'
 * @returns Promise that resolves when the implementation is ready
 *
 * @example
 * ```typescript
 * // Force JS fallback
 * await setImplementation('js');
 *
 * // Force native (Node.js only)
 * await setImplementation('native');
 * ```
 */
export async function setImplementation(impl: Implementation): Promise<void> {
  if (impl === 'js') {
    _impl = fallback;
    _implType = 'js';
  } else if (impl === 'native') {
    if (!isBrowser) {
      const native = await import('./native/index.js');
      const isAvailable = await native.isNativeAvailable();
      if (isAvailable) {
        _impl = await native.getNative();
        _implType = 'native';
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
  getImplementation,
  setImplementation,
};
