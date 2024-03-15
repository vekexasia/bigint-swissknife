export interface Bounds { min: bigint, max: bigint }

/**
 * A class that represents a signed or unsigned integer of a specific bit size.
 */
export class CheckedBigInt {
  readonly #bits: number
  public readonly value: bigint
  readonly boundaries: Bounds

  /**
   * Creates a new CheckedBigInt.
   * @param bits - bits size for this instance
   * @param value - initial value
   * @param signed - if true, the integer is signed, otherwise it is unsigned . If Bounds, it is used as boundaries.
   * @example
   * ```ts
   * const a = new CheckedBigInt(8, 1n, false) // u8
   * const b = new CheckedBigInt(8, 1n, true) // i8
   * const c = new CheckedBigInt(8, 1n, { min: 0n, max: 2n }) // u8 with custom boundaries
   * ```
   */
  constructor (bits: number, value: bigint, signed: boolean | Bounds) {
    if (bits <= 0) {
      throw new RangeError('CheckedBigInt: bits must be greater than 0')
    }
    this.#bits = bits
    this.value = value
    if (typeof (signed) === 'boolean') {
      if (signed) {
        if (bits < 2) {
          throw new RangeError('CheckedBigInt: signed bit size must be at least 2')
        }
        this.boundaries = {
          min: -(2n ** BigInt(this.#bits - 1)),
          max: (2n ** BigInt(this.#bits - 1)) - 1n
        }
      } else {
        this.boundaries = {
          min: 0n,
          max: (2n ** BigInt(this.#bits)) - 1n
        }
      }
    } else {
      this.boundaries = signed
    }
    if (this.value > this.boundaries.max) {
      throw new RangeError(`CheckedBigInt: value ${this.value} exceeds bit size ${this.#bits} - max ${this.boundaries.max}`)
    }
    if (this.value < this.boundaries.min) {
      throw new RangeError(`CheckedBigInt: value ${this.value} exceeds bit size ${this.#bits} - min ${this.boundaries.min}`)
    }
  }

  /**
   * Add another integer to this integer, checking for overflow.
   * @param other The integer to add.
   * @returns A new CheckedBigInt with the result of the addition.
   * @throws RangeError If the result of the addition would exceed the bit size.
   * @example
   * ```ts
   * const a = i8(1n).checkedAdd(1n) // 2
   * const b = i8(127n).checkedAdd(1n) // throws RangeError
   * ```
   */
  checkedAdd (other: bigint): CheckedBigInt {
    return new CheckedBigInt(this.#bits, this.value + other, this.boundaries)
  }

  /**
   * Subtract another integer from this integer, checking for overflow.
   * @param other The integer to subtract.
   * @returns A new CheckedBigInt with the result of the subtraction.
   * @throws RangeError If the result of the subtraction would exceed the bit size.
   */
  checkedSub (other: bigint): CheckedBigInt {
    return new CheckedBigInt(this.#bits, this.value - other, this.boundaries)
  }

  /**
   * Multiply this integer by another integer, checking for overflow.
   * @param other The integer to multiply by.
   * @returns A new CheckedBigInt with the result of the multiplication.
   * @throws RangeError If the result of the multiplication would exceed the bit size.
   */
  checkedMul (other: bigint): CheckedBigInt {
    return new CheckedBigInt(this.#bits, this.value * other, this.boundaries)
  }

  /**
   * Divide this integer by another integer, checking for overflow.
   * @param other The integer to divide by.
   * @returns A new CheckedBigInt with the result of the division.
   * @throws RangeError If the result of the division would exceed the bit size.
   * @throws RangeError If the divisor is zero.
   */
  checkedDiv (other: bigint): CheckedBigInt {
    if (other === 0n) {
      throw new RangeError('CheckedBigInt: division by zero')
    }
    if (this.boundaries.min !== 0n && this.value === this.boundaries.min && other === -1n) {
      throw new RangeError('CheckedBigInt: division overflow')
    }
    return new CheckedBigInt(this.#bits, this.value / other, this.boundaries)
  }

  /**
   * Remainder of the division of this integer by another integer, checking for overflow.
   * @param other The integer to divide by.
   * @returns A new CheckedBigInt with the result of the remainder.
   * @throws RangeError If the result of the remainder would exceed the bit size.
   * @throws RangeError If the divisor is zero.
   */
  checkedRem (other: bigint): CheckedBigInt {
    if (other === 0n) {
      throw new RangeError('CheckedBigInt: division by zero')
    }
    if (this.boundaries.min !== 0n && this.value === this.boundaries.min && other === -1n) {
      throw new RangeError('CheckedBigInt: division overflow')
    }
    return new CheckedBigInt(this.#bits, this.value % other, this.boundaries)
  }

  /**
   * Power this integer to another integer, checking for overflow.
   * @param exponent The integer to power by.
   * @returns A new CheckedBigInt with the result of the power.
   * @throws RangeError If the result of the power would exceed the bit size.
   */
  checkedPow (exponent: bigint): CheckedBigInt {
    return new CheckedBigInt(this.#bits, this.value ** exponent, this.boundaries)
  }

  /**
   * Bitwise shift left this integer by another integer, checking for overflow.
   * @param bits The integer to shift by.
   * @returns A new CheckedBigInt with the result of the shift.
   * @throws RangeError If the number of bits is negative.
   * @throws RangeError If the resulting number would exceed the bit size.
   */
  checkedShl (bits: number | bigint): CheckedBigInt {
    if (bits < 0n) {
      throw new RangeError('CheckedBigInt: shift count must be non-negative')
    }
    return new CheckedBigInt(this.#bits, this.value << BigInt(bits), this.boundaries)
  }

  /**
   * Bitwise shift right this integer by another integer, checking for overflow.
   * @param bits The integer to shift by.
   * @returns A new CheckedBigInt with the result of the shift.
   * @throws RangeError If the number of bits is negative.
   * @throws RangeError If bits is greater than the bit size.
   */
  checkedShr (bits: number | bigint): CheckedBigInt {
    if (bits < 0n) {
      throw new RangeError('CheckedBigInt: shift count must be non-negative')
    }
    if (bits > this.#bits) {
      throw new RangeError('CheckedBigInt: shift count must be less than bit size')
    }
    return new CheckedBigInt(this.#bits, this.value >> BigInt(bits), this.boundaries)
  }
}
