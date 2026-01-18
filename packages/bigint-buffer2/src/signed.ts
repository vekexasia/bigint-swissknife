/**
 * Shared utility for signed BigInt conversion using two's complement.
 *
 * This module provides the core logic for interpreting unsigned buffer values
 * as signed integers. Used by both fallback and native implementations.
 */

/**
 * Convert an unsigned BigInt to signed using two's complement interpretation.
 *
 * @param unsigned - The unsigned BigInt value
 * @param byteLength - The number of bytes the value represents
 * @returns The signed BigInt value
 *
 * @example
 * ```typescript
 * toSigned(255n, 1);  // -1n (0xff as i8)
 * toSigned(127n, 1);  // 127n (0x7f as i8)
 * toSigned(128n, 1);  // -128n (0x80 as i8)
 * ```
 */
export function toSigned(unsigned: bigint, byteLength: number): bigint {
  if (byteLength === 0) {
    return 0n;
  }
  const mid = 1n << BigInt(byteLength * 8 - 1); // 2^(bits-1), e.g. 128 for 1 byte
  if (unsigned < mid) {
    return unsigned; // positive: high bit is 0
  }
  return unsigned - (mid << 1n); // negative: subtract 2^bits
}

/**
 * Create a signed toBigInt function from an unsigned one.
 *
 * @param toBigIntUnsigned - Function that converts buffer to unsigned BigInt
 * @returns Function that converts buffer to signed BigInt
 */
export function createSignedReader(
  toBigIntUnsigned: (buffer: Buffer | Uint8Array) => bigint
): (buffer: Buffer | Uint8Array) => bigint {
  return (buffer: Buffer | Uint8Array): bigint => {
    if (buffer.length === 0) {
      return 0n;
    }
    const unsigned = toBigIntUnsigned(buffer);
    return toSigned(unsigned, buffer.length);
  };
}
