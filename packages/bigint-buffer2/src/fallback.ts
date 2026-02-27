/**
 * Pure JavaScript fallback implementation.
 *
 * This implementation is used when native bindings are not available (e.g., browsers).
 * It's based on the browser.ts implementation from bigint-uint8array but with
 * fixes for known bigint-buffer issues (#40, #59, #12, #22).
 */

import type { BigIntBuffer2Extended } from './types.js';
import { createSignedReader } from './signed.js';

// Pre-computed hex lookup table for fast byte-to-hex conversion
const HEX_CHARS = '0123456789abcdef';
const HEX_TABLE: string[] = new Array(256);
for (let i = 0; i < 256; i++) {
  HEX_TABLE[i] = HEX_CHARS[i >> 4] + HEX_CHARS[i & 0xf];
}

/**
 * Convert a Uint8Array to hex string (big-endian order).
 */
const toHexBE = (buf: Uint8Array): string => {
  let hex = '';
  for (let i = 0; i < buf.length; i++) {
    hex += HEX_TABLE[buf[i]];
  }
  return hex;
};

/**
 * Convert a Uint8Array to hex string (little-endian order - reads from end).
 */
const toHexLE = (buf: Uint8Array): string => {
  let hex = '';
  for (let i = buf.length - 1; i >= 0; i--) {
    hex += HEX_TABLE[buf[i]];
  }
  return hex;
};

// Define unsigned functions first so they can be reused for signed versions
const _toBigIntBE = (buffer: Buffer | Uint8Array): bigint => {
  // Fix issue #40: handle empty buffer
  if (buffer.length === 0) {
    return 0n;
  }
  const hex = toHexBE(buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer));
  // Handle all-zero case
  if (hex.length === 0 || /^0+$/.test(hex)) {
    return 0n;
  }
  return BigInt('0x' + hex);
};

const _toBigIntLE = (buffer: Buffer | Uint8Array): bigint => {
  // Fix issue #40: handle empty buffer
  if (buffer.length === 0) {
    return 0n;
  }
  // Convert LE to BE by reading bytes in reverse order (no array allocation)
  const hex = toHexLE(buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer));
  // Handle all-zero case
  if (hex.length === 0 || /^0+$/.test(hex)) {
    return 0n;
  }
  return BigInt('0x' + hex);
};

// Create signed versions using shared utility
const _toBigIntBESigned = createSignedReader(_toBigIntBE);
const _toBigIntLESigned = createSignedReader(_toBigIntLE);

/**
 * Pure JavaScript implementation of BigInt/buffer conversion.
 */
export const fallback: BigIntBuffer2Extended = {
  toBigIntBE: _toBigIntBE,
  toBigIntLE: _toBigIntLE,
  toBigIntBESigned: _toBigIntBESigned,
  toBigIntLESigned: _toBigIntLESigned,

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
    buffer.set(result as Uint8Array);
  },

  /**
   * Convert BigInt to little-endian bytes, writing directly into a provided buffer.
   */
  toBufferLEInto(num: bigint, buffer: Buffer | Uint8Array): void {
    const result = fallback.toBufferLE(num, buffer.length);
    buffer.set(result as Uint8Array);
  },
};

// Export individual functions for direct import
export const { toBigIntBE, toBigIntLE, toBigIntBESigned, toBigIntLESigned, toBufferBE, toBufferLE, toBufferBEInto, toBufferLEInto } = fallback;
