/**
 * Adapter for @vekexasia/bigint-uint8array UncheckedConverter interface.
 *
 * This module provides an adapter that implements the UncheckedConverter interface,
 * allowing bigint-buffer2 to be used as a drop-in replacement for bigint-buffer
 * in the bigint-uint8array package.
 */

import { toBigIntBE, toBigIntLE, toBufferBE, toBufferLE } from './index.js';

/**
 * UncheckedConverter interface from @vekexasia/bigint-uint8array.
 *
 * This is a copy of the interface to avoid requiring bigint-uint8array as a dependency.
 */
export interface UncheckedConverter {
  bigEndianToNewArray(num: bigint, bytes: number): Uint8Array;
  bigEndianToArray(num: bigint, dest: Uint8Array): void;
  littleEndianToNewArray(num: bigint, bytes: number): Uint8Array;
  littleEndianToArray(num: bigint, dest: Uint8Array): void;
  arrayToLittleEndian(buf: Uint8Array): bigint;
  arrayToBigEndian(buf: Uint8Array): bigint;
}

/**
 * UncheckedConverter adapter for bigint-buffer2.
 *
 * This adapter allows bigint-buffer2 to be used as a drop-in replacement
 * for bigint-buffer in the bigint-uint8array package.
 *
 * @example
 * ```typescript
 * // In bigint-uint8array's native.ts:
 * import { uncheckedConverter } from '@vekexasia/bigint-buffer2/adapter';
 *
 * // Use as the converter implementation
 * export { uncheckedConverter };
 * ```
 */
export const uncheckedConverter: UncheckedConverter = {
  /**
   * Convert BigInt to new Uint8Array in big-endian format.
   */
  bigEndianToNewArray(num: bigint, bytes: number): Uint8Array {
    const result = toBufferBE(num, bytes);
    return result instanceof Uint8Array ? result : new Uint8Array(result);
  },

  /**
   * Convert BigInt to existing Uint8Array in big-endian format.
   */
  bigEndianToArray(num: bigint, dest: Uint8Array): void {
    const src = toBufferBE(num, dest.length);
    dest.set(src instanceof Uint8Array ? src : new Uint8Array(src));
  },

  /**
   * Convert BigInt to new Uint8Array in little-endian format.
   */
  littleEndianToNewArray(num: bigint, bytes: number): Uint8Array {
    const result = toBufferLE(num, bytes);
    return result instanceof Uint8Array ? result : new Uint8Array(result);
  },

  /**
   * Convert BigInt to existing Uint8Array in little-endian format.
   */
  littleEndianToArray(num: bigint, dest: Uint8Array): void {
    const src = toBufferLE(num, dest.length);
    dest.set(src instanceof Uint8Array ? src : new Uint8Array(src));
  },

  /**
   * Convert Uint8Array to BigInt in little-endian format.
   */
  arrayToLittleEndian(buf: Uint8Array): bigint {
    return toBigIntLE(buf);
  },

  /**
   * Convert Uint8Array to BigInt in big-endian format.
   */
  arrayToBigEndian(buf: Uint8Array): bigint {
    return toBigIntBE(buf);
  },
};
