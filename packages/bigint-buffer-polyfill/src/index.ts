import {
  converter
} from '@vekexasia/bigint-uint8array'

// Validation helper
function validateBounds (bufferLength: number, width: number, offset: number): void {
  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError(`width must be a positive integer, got ${width}`)
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw new RangeError(`offset must be a non-negative integer, got ${offset}`)
  }
  if (offset + width > bufferLength) {
    throw new RangeError(
      `Attempt to access memory outside buffer bounds: offset ${offset} + width ${width} > buffer length ${bufferLength}`
    )
  }
}

// impl start
Buffer.prototype.writeBigIntBE = function (value: bigint, width: number, offset = 0) {
  validateBounds(this.length, width, offset)
  converter.signed.be.toArray(value, (this as Buffer).subarray(offset, width + offset))
  return width
}
Buffer.prototype.writeBigIntLE = function (value: bigint, width: number, offset = 0) {
  validateBounds(this.length, width, offset)
  converter.signed.le.toArray(value, (this as Buffer).subarray(offset, width + offset))
  return width
}
Buffer.prototype.readBigIntBE = function (width: number, offset = 0): bigint {
  validateBounds(this.length, width, offset)
  return converter.signed.be.toBigInt(
    (this as Buffer).subarray(offset, offset + width))
}
Buffer.prototype.readBigIntLE = function (width: number, offset = 0): bigint {
  validateBounds(this.length, width, offset)
  return converter.signed.le.toBigInt(
    (this as Buffer).subarray(offset, offset + width))
}
Buffer.prototype.writeBigUIntBE = function (value: bigint, width: number, offset = 0) {
  validateBounds(this.length, width, offset)
  converter.unsigned.be.toArray(value, (this as Buffer).subarray(offset, width + offset))
  return width
}
Buffer.prototype.writeBigUIntLE = function (value: bigint, width: number, offset = 0) {
  validateBounds(this.length, width, offset)
  converter.unsigned.le.toArray(value, (this as Buffer).subarray(offset, width + offset))
  return width
}
Buffer.prototype.readBigUIntBE = function (width: number, offset = 0): bigint {
  validateBounds(this.length, width, offset)
  return converter.unsigned.be.toBigInt(
    (this as Buffer).subarray(offset, offset + width)
  )
}
Buffer.prototype.readBigUIntLE = function (width: number, offset = 0): bigint {
  validateBounds(this.length, width, offset)
  return converter.unsigned.le.toBigInt(
    (this as Buffer).subarray(offset, offset + width))
}

// declaration for polyfill
declare global {
  /**
   * Polyfill for BigInt support in Buffer
   * @example
   *
   * ```typescript
   * import '@vekexasia/bigint-buffer-polyfill';
   *
   * const buf = Buffer.alloc(16);
   * buf.writeBigIntBE(-42n, 8);
   * buf.writeBigUIntLE(69n, 8, 8);
   *
   * console.log(buf.readBigIntBE(8)); // -42n
   * console.log(buf.readBigUIntLE(8, 8)); // 69n
   * ```
   */
  interface Buffer {
    /**
     * Write a signed BigInt to a buffer in Big Endian format
     * @param value - the value to write
     * @param width - the number of bytes to write (must be positive integer)
     * @param offset - the offset to write at (must be non-negative integer)
     * @returns the number of bytes written
     * @throws RangeError if width is not a positive integer
     * @throws RangeError if offset is negative or not an integer
     * @throws RangeError if offset + width exceeds buffer length
     * @throws RangeError if value does not fit in the specified width
     */
    writeBigIntBE(value: bigint, width: number, offset?: number): number
    /**
     * Write a signed BigInt to a buffer in Little Endian format
     * @param value - the value to write
     * @param width - the number of bytes to write (must be positive integer)
     * @param offset - the offset to write at (must be non-negative integer)
     * @returns the number of bytes written
     * @throws RangeError if width is not a positive integer
     * @throws RangeError if offset is negative or not an integer
     * @throws RangeError if offset + width exceeds buffer length
     * @throws RangeError if value does not fit in the specified width
     */
    writeBigIntLE(value: bigint, width: number, offset?: number): number
    /**
     * Read a signed BigInt from a buffer in Big Endian format
     * @param width - the number of bytes to read (must be positive integer)
     * @param offset - the offset to read from (must be non-negative integer)
     * @returns the value read
     * @throws RangeError if width is not a positive integer
     * @throws RangeError if offset is negative or not an integer
     * @throws RangeError if offset + width exceeds buffer length
     */
    readBigIntBE(width: number, offset?: number): bigint
    /**
     * Read a signed BigInt from a buffer in Little Endian format
     * @param width - the number of bytes to read (must be positive integer)
     * @param offset - the offset to read from (must be non-negative integer)
     * @returns the value read
     * @throws RangeError if width is not a positive integer
     * @throws RangeError if offset is negative or not an integer
     * @throws RangeError if offset + width exceeds buffer length
     */
    readBigIntLE(width: number, offset?: number): bigint

    /**
     * Write an unsigned BigInt to a buffer in Big Endian format
     * @param value - the value to write
     * @param width - the number of bytes to write (must be positive integer)
     * @param offset - the offset to write at (must be non-negative integer)
     * @returns the number of bytes written
     * @throws RangeError if width is not a positive integer
     * @throws RangeError if offset is negative or not an integer
     * @throws RangeError if offset + width exceeds buffer length
     * @throws RangeError if value is negative or does not fit in the specified width
     */
    writeBigUIntBE(value: bigint, width: number, offset?: number): number
    /**
     * Write an unsigned BigInt to a buffer in Little Endian format
     * @param value - the value to write
     * @param width - the number of bytes to write (must be positive integer)
     * @param offset - the offset to write at (must be non-negative integer)
     * @returns the number of bytes written
     * @throws RangeError if width is not a positive integer
     * @throws RangeError if offset is negative or not an integer
     * @throws RangeError if offset + width exceeds buffer length
     * @throws RangeError if value is negative or does not fit in the specified width
     */
    writeBigUIntLE(value: bigint, width: number, offset?: number): number
    /**
     * Read an unsigned BigInt from a buffer in Big Endian format
     * @param width - the number of bytes to read (must be positive integer)
     * @param offset - the offset to read from (must be non-negative integer)
     * @returns the value read
     * @throws RangeError if width is not a positive integer
     * @throws RangeError if offset is negative or not an integer
     * @throws RangeError if offset + width exceeds buffer length
     */
    readBigUIntBE(width: number, offset?: number): bigint
    /**
     * Read an unsigned BigInt from a buffer in Little Endian format
     * @param width - the number of bytes to read (must be positive integer)
     * @param offset - the offset to read from (must be non-negative integer)
     * @returns the value read
     * @throws RangeError if width is not a positive integer
     * @throws RangeError if offset is negative or not an integer
     * @throws RangeError if offset + width exceeds buffer length
     */
    readBigUIntLE(width: number, offset?: number): bigint
  }
}
