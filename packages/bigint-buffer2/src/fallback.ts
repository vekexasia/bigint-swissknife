/**
 * Pure JavaScript fallback implementation.
 *
 * This implementation is used when native bindings or WASM are not available.
 * It's based on the browser.ts implementation from bigint-uint8array but with
 * fixes for known bigint-buffer issues (#40, #59, #12, #22).
 */

import type { BigIntBuffer2Extended } from './types.js';

/**
 * Convert a Uint8Array to hex string.
 */
const toHex = (buf: Uint8Array): string => {
  return Array.from(buf).map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Pure JavaScript implementation of BigInt/buffer conversion.
 */
export const fallback: BigIntBuffer2Extended = {
  /**
   * Convert a big-endian buffer to BigInt.
   */
  toBigIntBE(buffer: Buffer | Uint8Array): bigint {
    // Fix issue #40: handle empty buffer
    if (buffer.length === 0) {
      return 0n;
    }
    const hex = toHex(new Uint8Array(buffer));
    // Handle all-zero case
    if (/^0+$/.test(hex)) {
      return 0n;
    }
    return BigInt('0x' + hex);
  },

  /**
   * Convert a little-endian buffer to BigInt.
   */
  toBigIntLE(buffer: Buffer | Uint8Array): bigint {
    // Fix issue #40: handle empty buffer
    if (buffer.length === 0) {
      return 0n;
    }
    // Reverse a copy to convert from LE to BE
    const reversed = new Uint8Array(buffer).slice().reverse();
    const hex = toHex(reversed);
    // Handle all-zero case
    if (/^0+$/.test(hex)) {
      return 0n;
    }
    return BigInt('0x' + hex);
  },

  /**
   * Convert BigInt to big-endian buffer with specified width.
   */
  toBufferBE(num: bigint, width: number): Uint8Array {
    // Fix issue #40: handle width 0
    if (width <= 0) {
      return new Uint8Array(0);
    }

    // Handle negative numbers using two's complement
    let value = num;
    if (value < 0n) {
      // Two's complement: add 2^(width*8) to make it positive
      const maxVal = 1n << BigInt(width * 8);
      value = maxVal + value;
    }

    // Convert to hex, pad to required width
    let hex = value.toString(16);
    const requiredHexLength = width * 2;

    if (hex.length > requiredHexLength) {
      // Truncate from the left (remove high bytes) - fixes overflow issue #59
      hex = hex.slice(-requiredHexLength);
    } else {
      // Pad with zeros on the left
      hex = hex.padStart(requiredHexLength, '0');
    }

    // Convert hex to bytes
    const result = new Uint8Array(width);
    for (let i = 0; i < width; i++) {
      result[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    }

    return result;
  },

  /**
   * Convert BigInt to little-endian buffer with specified width.
   */
  toBufferLE(num: bigint, width: number): Uint8Array {
    // Fix issue #40: handle width 0
    if (width <= 0) {
      return new Uint8Array(0);
    }

    // Handle negative numbers using two's complement
    let value = num;
    if (value < 0n) {
      const maxVal = 1n << BigInt(width * 8);
      value = maxVal + value;
    }

    // Convert to hex, pad to required width
    let hex = value.toString(16);
    const requiredHexLength = width * 2;

    if (hex.length > requiredHexLength) {
      // Truncate from the left (remove high bytes)
      hex = hex.slice(-requiredHexLength);
    } else {
      hex = hex.padStart(requiredHexLength, '0');
    }

    // Convert hex to bytes in little-endian order (reverse)
    const result = new Uint8Array(width);
    for (let i = 0; i < width; i++) {
      // Read from the end of the hex string
      const hexIdx = requiredHexLength - 2 - i * 2;
      result[i] = parseInt(hex.substring(hexIdx, hexIdx + 2), 16);
    }

    return result;
  },

  /**
   * Convert BigInt to big-endian bytes, writing directly into a provided buffer.
   */
  toBufferBEInto(num: bigint, buffer: Buffer | Uint8Array): void {
    const result = fallback.toBufferBE(num, buffer.length);
    (buffer as Uint8Array).set(new Uint8Array(result));
  },

  /**
   * Convert BigInt to little-endian bytes, writing directly into a provided buffer.
   */
  toBufferLEInto(num: bigint, buffer: Buffer | Uint8Array): void {
    const result = fallback.toBufferLE(num, buffer.length);
    (buffer as Uint8Array).set(new Uint8Array(result));
  },
};

// Export individual functions for direct import
export const { toBigIntBE, toBigIntLE, toBufferBE, toBufferLE, toBufferBEInto, toBufferLEInto } = fallback;
