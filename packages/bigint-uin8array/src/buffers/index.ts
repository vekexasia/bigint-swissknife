import {
  converter
} from '../index'
// impl start
Buffer.prototype.writeBigIntBE = function (value: bigint, width: number, offset = 0) {
  return (converter.signed.be.toUint8Array(value, width) as Buffer).copy((this as Buffer), offset)
}
Buffer.prototype.writeBigIntLE = function (value: bigint, width: number, offset = 0) {
  return (converter.signed.le.toUint8Array(value, width) as Buffer).copy((this as Buffer), offset)
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
  return (converter.unsigned.be.toUint8Array(value, width) as Buffer).copy((this as Buffer), offset)
}
Buffer.prototype.writeBigUIntLE = function (value: bigint, width: number, offset = 0) {
  return (converter.unsigned.le.toUint8Array(value, width) as Buffer).copy((this as Buffer), offset)
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
    writeBigIntBE: (value: bigint, width: number, offset?: number) => number
    writeBigIntLE: (value: bigint, width: number, offset?: number) => number
    readBigIntBE: (width: number, offset?: number) => bigint
    readBigIntLE: (width: number, offset?: number) => bigint
    // uint
    writeBigUIntBE: (value: bigint, width: number, offset?: number) => number
    writeBigUIntLE: (value: bigint, width: number, offset?: number) => number
    readBigUIntBE: (width: number, offset?: number) => bigint
    readBigUIntLE: (width: number, offset?: number) => bigint
  }
}
