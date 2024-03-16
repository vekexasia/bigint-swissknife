/**
 * UncheckedConverter is a set of functions that convert numbers to Uint8Array and vice versa.
 * Implementation should not directly check for overflows or underflows.
 *
 * This is a **low-level interface**, and it is not recommended to use it directly. Instead, use {@link BigIntConverter}.
 * One possible use case of an UncheckedConverter is for performance reasons, when you are sure that the input is within the boundaries.
 *
 */
export interface UncheckedConverter {
  /**
   * Converts number into Uint8Array in BigEndian format
   * @param num - number to convert
   * @param bytes - number of bytes to use
   * @returns Uint8Array
   */
  bigEndianToNewArray(num: bigint, bytes: number): Uint8Array

  /**
   * Converts number into Uint8Array in BigEndian format
   * @param num - the number to convert
   * @param dest - the destination buffer
   * @see {@link bigEndianToNewArray} - similar to bigEndianToNewArray, but writes to the destination buffer instead
   * of returning a new one
   * @throws - it may throw if the buffer is too small
   */
  bigEndianToArray(num: bigint, dest: Uint8Array): void

  /**
   * Converts number into Uint8Array in LittleEndian format
   * @param num - the number to convert
   * @param bytes - number of bytes to use
   */
  littleEndianToNewArray(num: bigint, bytes: number): Uint8Array

  /**
   * Converts number into Uint8Array in LittleEndian format
   * @param num - the number to convert
   * @param dest - the destination buffer
   * @see {@link littleEndianToNewArray} - similar, but writes to the destination buffer instead
   */
  littleEndianToArray(num: bigint, dest: Uint8Array): void

  /**
   * Converts Uint8Array into number in LittleEndian format
   * @param buf - Uint8Array to convert
   * @returns bigint
   */
  arrayToLittleEndian(buf: Uint8Array): bigint

  /**
   * Converts Uint8Array into number in BigEndian format
   * @param buf - Uint8Array to convert
   * @returns bigint
   */
  arrayToBigEndian(buf: Uint8Array): bigint
}
