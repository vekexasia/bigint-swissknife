/**
 * @vekexasia/bigint-buffer2
 *
 * Fast BigInt/Buffer conversion with Rust native bindings and JS fallback.
 *
 * @packageDocumentation
 */

import type { BigIntBuffer2, BigIntBuffer2Extended, Implementation } from './types.js';
import { fallback } from './fallback.js';
// This import is aliased to native-stub.ts in browser builds via esbuild config
import * as nativeLoader from './native/index.js';

export type { BigIntBuffer2, BigIntBuffer2Extended, Implementation };

// IS_BROWSER is replaced at build time by the preprocessor
const isBrowser = IS_BROWSER;

let _impl: BigIntBuffer2Extended = fallback;
let _implType: Implementation = 'js';

// Auto-initialize for Node.js (synchronous, native is ready immediately)
if (!isBrowser && nativeLoader.isNativeAvailable()) {
  _impl = nativeLoader.getNativeSync();
  _implType = 'native';
}

/**
 * Initialize native bindings for Node.js environments.
 *
 * @deprecated Since 1.1.0 - Native bindings are now initialized automatically and synchronously on module import.
 * This function is kept for backwards compatibility and will be removed in a future major version.
 * You no longer need to call this function.
 *
 * @returns Promise that resolves immediately (native bindings are already loaded)
 */
export async function initNative(): Promise<void> {
  // No-op: native is already initialized synchronously
  return Promise.resolve();
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
    if (!isBrowser && nativeLoader.isNativeAvailable()) {
      _impl = nativeLoader.getNativeSync();
      _implType = 'native';
    } else {
      throw new Error('Native implementation not available');
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
 * Convert a big-endian buffer to signed BigInt using two's complement.
 *
 * @param buffer - Big-endian byte buffer
 * @returns BigInt value (can be negative)
 *
 * @example
 * ```typescript
 * const buffer = new Uint8Array([0xff, 0xff]); // -1 in 2 bytes
 * const num = toBigIntBESigned(buffer); // -1n
 * ```
 */
export function toBigIntBESigned(buffer: Buffer | Uint8Array): bigint {
  return _impl.toBigIntBESigned(buffer);
}

/**
 * Convert a little-endian buffer to signed BigInt using two's complement.
 *
 * @param buffer - Little-endian byte buffer
 * @returns BigInt value (can be negative)
 *
 * @example
 * ```typescript
 * const buffer = new Uint8Array([0xff, 0xff]); // -1 in 2 bytes
 * const num = toBigIntLESigned(buffer); // -1n
 * ```
 */
export function toBigIntLESigned(buffer: Buffer | Uint8Array): bigint {
  return _impl.toBigIntLESigned(buffer);
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
  toBigIntBESigned,
  toBigIntLESigned,
  toBufferBE,
  toBufferLE,
  toBufferBEInto,
  toBufferLEInto,
  initNative,
  getImplementation,
  setImplementation,
};
