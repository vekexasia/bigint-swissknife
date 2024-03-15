export interface IConverter {
  /**
   * Converts number into Uint8Array using BigEndian
   * @param num - number to convert
   * @param bytes - number of bytes to use
   * @returns Uint8Array
   */
  bigEndianToNewArray: (num: bigint, bytes: number) => Uint8Array

  /**
   * Converts number into Uint8Array using BigEndian
   * @param num - the number to convert
   * @param dest - the destination buffer
   * @see {@link bigEndianToNewArray} - similar to bigEndianToNewArray, but writes to the destination buffer instead
   * of returning a new one
   * @throws - it may throw if the buffer is too small
   */
  bigEndianToArray: (num: bigint, dest: Uint8Array) => void

  /**
   * Converts number into Uint8Array using LittleEndian
   * @param num - the number to convert
   * @param bytes - number of bytes to use
   */
  littleEndianToNewArray: (num: bigint, bytes: number) => Uint8Array

  /**
   * Converts number into Uint8Array using LittleEndian
   * @param num - the number to convert
   * @param dest - the destination buffer
   * @see {@link littleEndianToNewArray} - similar to littleEndianToNewArray, but writes to the destination buffer instead
   */
  littleEndianToArray: (num: bigint, dest: Uint8Array) => void

  /**
   * Converts Uint8Array into number using LittleEndian
   * @param num - Uint8Array to convert
   * @returns number
   */
  arrayToLittleEndian: (num: Uint8Array) => bigint

  /**
   * Converts Uint8Array into number using BigEndian
   * @param num - Uint8Array to convert
   * @returns number
   */
  arrayToBigEndian: (buf: Uint8Array) => bigint
}
