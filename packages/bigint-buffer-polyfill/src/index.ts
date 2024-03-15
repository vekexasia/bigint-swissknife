import {
  converter
} from '@vekexasia/bigint-uint8array'
// impl start
Buffer.prototype.writeBigIntBE = function (value: bigint, width: number, offset = 0) {
  converter.signed.be.toArray(value, (this as Buffer).subarray(offset, width + offset))
  return width
}
Buffer.prototype.writeBigIntLE = function (value: bigint, width: number, offset = 0) {
  converter.signed.le.toArray(value, (this as Buffer).subarray(offset, width + offset))
  return width
}
Buffer.prototype.readBigIntBE = function (width: number, offset = 0): bigint {
  return converter.signed.be.toBigInt(
    (this as Buffer).subarray(offset, offset + width))
}
Buffer.prototype.readBigIntLE = function (width: number, offset = 0): bigint {
  return converter.signed.le.toBigInt(
    (this as Buffer).subarray(offset, offset + width))
}
Buffer.prototype.writeBigUIntBE = function (value: bigint, width: number, offset = 0) {
  converter.unsigned.be.toArray(value, (this as Buffer).subarray(offset, width + offset))
  return width
}
Buffer.prototype.writeBigUIntLE = function (value: bigint, width: number, offset = 0) {
  converter.unsigned.le.toArray(value, (this as Buffer).subarray(offset, width + offset))
  return width
}
Buffer.prototype.readBigUIntBE = function (width: number, offset = 0): bigint {
  return converter.unsigned.be.toBigInt(
    (this as Buffer).subarray(offset, offset + width)
  )
}
Buffer.prototype.readBigUIntLE = function (width: number, offset = 0): bigint {
  return converter.unsigned.le.toBigInt(
    (this as Buffer).subarray(offset, offset + width))
}

// declaration for polyfill
declare global {
  interface Buffer {
    /**
     * Write a signed BigInt to a buffer in Big Endian format
     * @param value - the value to write
     * @param width - the number of bytes to write
     * @param offset - the offset to write at
     * @returns the number of bytes written
     */
    writeBigIntBE: (value: bigint, width: number, offset?: number) => number
    /**
     * Write a signed BigInt to a buffer in Little Endian format
     * @param value - the value to write
     * @param width - the number of bytes to write
     * @param offset - the offset to write at
     * @returns the number of bytes written
     */
    writeBigIntLE: (value: bigint, width: number, offset?: number) => number
    /**
     * Read a signed BigInt from a buffer in Big Endian format
     * @param width - the number of bytes to read
     * @param offset - the offset to read from
     * @returns the value read
     */
    readBigIntBE: (width: number, offset?: number) => bigint
    /**
     * Read a signed BigInt from a buffer in Little Endian format
     * @param width - the number of bytes to read
     * @param offset - the offset to read from
     * @returns the value read
     */
    readBigIntLE: (width: number, offset?: number) => bigint

    /**
     * Write an unsigned BigInt to a buffer in Big Endian format
     * @param value - the value to write
     * @param width - the number of bytes to write
     * @param offset - the offset to write at
     * @returns the number of bytes written
     */
    writeBigUIntBE: (value: bigint, width: number, offset?: number) => number
    /**
     * Write an unsigned BigInt to a buffer in Little Endian format
     * @param value - the value to write
     * @param width - the number of bytes to write
     * @param offset - the offset to write at
     * @returns the number of bytes written
     */
    writeBigUIntLE: (value: bigint, width: number, offset?: number) => number
    /**
     * Read an unsigned BigInt from a buffer in Big Endian format
     * @param width - the number of bytes to read
     * @param offset - the offset to read from
     * @returns the value read
     */
    readBigUIntBE: (width: number, offset?: number) => bigint
    /**
     * Read an unsigned BigInt from a buffer in Little Endian format
     * @param width - the number of bytes to read
     * @param offset - the offset to read from
     * @returns the value read
     */
    readBigUIntLE: (width: number, offset?: number) => bigint
  }
}
