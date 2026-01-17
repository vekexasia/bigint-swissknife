/**
 * Core API interface matching bigint-buffer's function signatures.
 */
export interface BigIntBuffer2 {
  /**
   * Convert a big-endian buffer to BigInt.
   * @param buffer - Big-endian byte buffer
   * @returns BigInt value
   */
  toBigIntBE(buffer: Buffer | Uint8Array): bigint;

  /**
   * Convert a little-endian buffer to BigInt.
   * @param buffer - Little-endian byte buffer
   * @returns BigInt value
   */
  toBigIntLE(buffer: Buffer | Uint8Array): bigint;

  /**
   * Convert BigInt to big-endian buffer with specified width.
   * @param num - BigInt value to convert
   * @param width - Desired buffer width in bytes
   * @returns Big-endian buffer of exactly `width` bytes
   */
  toBufferBE(num: bigint, width: number): Buffer | Uint8Array;

  /**
   * Convert BigInt to little-endian buffer with specified width.
   * @param num - BigInt value to convert
   * @param width - Desired buffer width in bytes
   * @returns Little-endian buffer of exactly `width` bytes
   */
  toBufferLE(num: bigint, width: number): Buffer | Uint8Array;
}

/**
 * Extended API with zero-copy buffer operations.
 * These functions write directly into a provided buffer, avoiding allocation.
 */
export interface BigIntBuffer2Extended extends BigIntBuffer2 {
  /**
   * Convert BigInt to big-endian bytes, writing directly into a provided buffer.
   * @param num - BigInt value to convert
   * @param buffer - Pre-allocated buffer to write into (width is inferred from length)
   */
  toBufferBEInto(num: bigint, buffer: Buffer | Uint8Array): void;

  /**
   * Convert BigInt to little-endian bytes, writing directly into a provided buffer.
   * @param num - BigInt value to convert
   * @param buffer - Pre-allocated buffer to write into (width is inferred from length)
   */
  toBufferLEInto(num: bigint, buffer: Buffer | Uint8Array): void;
}

/**
 * Implementation type for identifying which backend is in use.
 */
export type Implementation = 'native' | 'js';
