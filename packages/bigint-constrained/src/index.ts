import { CheckedBigInt } from './CheckedBigInt.js'

export * from './CheckedBigInt.js'

/**
 * Creates an u8 CheckedBigInt.
 * @param value - initial value
 * @throws RangeError - If the value exceeds the bit size.
 * @returns A new CheckedBigInt constrained to u8
 */
export const u8 = (value: bigint): CheckedBigInt => new CheckedBigInt(value,8, false)

/**
 * Creates an u16 CheckedBigInt.
 * @param value - initial value
 * @throws RangeError - If the value exceeds the bit size.
 * @returns A new CheckedBigInt constrained to u16
 */
export const u16 = (value: bigint): CheckedBigInt => new CheckedBigInt(value,16, false)

/**
 * Creates an u32 CheckedBigInt.
 * @param value - initial value
 * @throws RangeError - If the value exceeds the bit size.
 * @returns A new CheckedBigInt constrained to u32
 */
export const u32 = (value: bigint): CheckedBigInt => new CheckedBigInt(value,32, false)

/**
 * Creates an u64 CheckedBigInt.
 * @param value - initial value
 * @throws RangeError - If the value exceeds the bit size.
 * @returns A new CheckedBigInt constrained to u64
 */
export const u64 = (value: bigint): CheckedBigInt => new CheckedBigInt(value,64, false)

/**
 * Creates an u128 CheckedBigInt.
 * @param value - initial value
 * @throws RangeError - If the value exceeds the bit size.
 * @returns A new CheckedBigInt constrained to u128
 */
export const u128 = (value: bigint): CheckedBigInt => new CheckedBigInt(value,128, false)

/**
 * Creates an u256 CheckedBigInt.
 * @param value - initial value
 * @throws RangeError - If the value exceeds the bit size.
 * @returns A new CheckedBigInt constrained to u256
 */
export const u256 = (value: bigint): CheckedBigInt => new CheckedBigInt(value,256, false)

/**
 * Creates an i8 CheckedBigInt.
 * @param value - initial value
 * @throws RangeError - If the value exceeds the bit size.
 * @returns A new CheckedBigInt constrained to i8
 */
export const i8 = (value: bigint): CheckedBigInt => new CheckedBigInt(value,8, true)

/**
 * Creates an i16 CheckedBigInt.
 * @param value - initial value
 * @throws RangeError - If the value exceeds the bit size.
 * @returns A new CheckedBigInt constrained to i16
 */
export const i16 = (value: bigint): CheckedBigInt => new CheckedBigInt(value,16, true)

/**
 * Creates an i32 CheckedBigInt.
 * @param value - initial value
 * @throws RangeError - If the value exceeds the bit size.
 * @returns A new CheckedBigInt constrained to i32
 */
export const i32 = (value: bigint): CheckedBigInt => new CheckedBigInt(value,32, true)

/**
 * Creates an i64 CheckedBigInt.
 * @param value - initial value
 * @throws RangeError - If the value exceeds the bit size.
 * @returns A new CheckedBigInt constrained to i64
 */
export const i64 = (value: bigint): CheckedBigInt => new CheckedBigInt(value,64, true)

/**
 * Creates an i128 CheckedBigInt.
 * @param value - initial value
 * @throws RangeError - If the value exceeds the bit size.
 * @returns A new CheckedBigInt constrained to i128
 */
export const i128 = (value: bigint): CheckedBigInt => new CheckedBigInt(value,128, true)

/**
 * Creates an i256 CheckedBigInt.
 * @param value - initial value
 * @throws RangeError - If the value exceeds the bit size.
 * @returns A new CheckedBigInt constrained to i256
 */
export const i256 = (value: bigint): CheckedBigInt => new CheckedBigInt(value,256, true)
