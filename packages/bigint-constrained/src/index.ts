import { CheckedBigInt } from './CheckedBigInt.js'

export * from './CheckedBigInt.js'

export const checkedU8 = (value: bigint): CheckedBigInt => new CheckedBigInt(8, value, false)
export const checkedU16 = (value: bigint): CheckedBigInt => new CheckedBigInt(16, value, false)
export const checkedU32 = (value: bigint): CheckedBigInt => new CheckedBigInt(32, value, false)
export const checkedU64 = (value: bigint): CheckedBigInt => new CheckedBigInt(64, value, false)
export const checkedU128 = (value: bigint): CheckedBigInt => new CheckedBigInt(128, value, false)
export const checkedU256 = (value: bigint): CheckedBigInt => new CheckedBigInt(256, value, false)

export const checkedI8 = (value: bigint): CheckedBigInt => new CheckedBigInt(8, value, true)
export const checkedI16 = (value: bigint): CheckedBigInt => new CheckedBigInt(16, value, true)
export const checkedI32 = (value: bigint): CheckedBigInt => new CheckedBigInt(32, value, true)
export const checkedI64 = (value: bigint): CheckedBigInt => new CheckedBigInt(64, value, true)
export const checkedI128 = (value: bigint): CheckedBigInt => new CheckedBigInt(128, value, true)
export const checkedI256 = (value: bigint): CheckedBigInt => new CheckedBigInt(256, value, true)
