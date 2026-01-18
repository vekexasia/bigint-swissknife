export interface Bounds { min: bigint, max: bigint }

/**
 * A class that represents a signed or unsigned integer of a specific bit size.
 */
export class CheckedBigInt {
  public readonly value: bigint
  readonly boundaries: Bounds

  /**
   * Creates a new CheckedBigInt. with custom boundaries
   * @param value - initial value
   * @param bounds - the set boundaries for the instance
   * @example
   * ```typescript
   * const a = new CheckedBigInt(1n, {min: 1n, max: 10n})
   * ```
   */
  constructor(value:bigint, bounds: Bounds);
  /**
   * Creates a new CheckedBigInt. with a specific bit size and signedness
   * @param value - initial value
   * @param bits - the bit size of the integer
   * @param signed - whether the integer is signed or not
   * @example
   * ```typescript
   * const a = new CheckedBigInt(1n /* value *\/, 8 /*bits*\/, false/*unsigned*\/)
   * ```
   */
  constructor(value:bigint, bits: number, signed: boolean);

  constructor (value: bigint, info: number|Bounds, signed?: boolean ) {
    if (typeof (info ) === 'number') {
      const bits = info;
      if (bits <=0) {
        throw new RangeError('CheckedBigInt: bit size must be positive')
      }
      if (signed) {
        this.boundaries = {
          min: -(2n ** BigInt(bits - 1)),
          max: (2n ** BigInt(bits - 1)) - 1n
        }
      } else {
        this.boundaries = {
          min: 0n,
          max: (2n ** BigInt(bits)) - 1n
        }
      }
    } else {
      this.boundaries = info;
    }
    this.value = value

    if (this.value > this.boundaries.max) {
      throw new RangeError(`CheckedBigInt: value ${this.value} exceeds boundaries - > max ${this.boundaries.max}`)
    }
    if (this.value < this.boundaries.min) {
      throw new RangeError(`CheckedBigInt: value ${this.value} exceeds boundaries - < min ${this.boundaries.min}`)
    }
  }

  /**
   * Add another integer to this integer, checking for overflow.
   * @param other - The integer to add.
   * @returns A new CheckedBigInt with the result of the addition.
   * @throws RangeError If the result of the addition would exceed the bit size.
   * @example
   * ```typescript
   * const a = i8(1n).add(1n) // 2
   * const b = i8(127n).add(1n) // throws RangeError
   * ```
   */
  add (other: bigint): CheckedBigInt {
    return new CheckedBigInt(this.value + other, this.boundaries)
  }

  /**
   * Subtract another integer from this integer, checking for overflow.
   * @param other - The integer to subtract.
   * @returns A new CheckedBigInt with the result of the subtraction.
   * @throws RangeError If the result of the subtraction would exceed the bit size.
   */
  sub (other: bigint): CheckedBigInt {
    return new CheckedBigInt(this.value - other, this.boundaries)
  }

  /**
   * Multiply this integer by another integer, checking for overflow.
   * @param other - The integer to multiply by.
   * @returns A new CheckedBigInt with the result of the multiplication.
   * @throws RangeError If the result of the multiplication would exceed the bit size.
   */
  mul (other: bigint): CheckedBigInt {
    return new CheckedBigInt(this.value * other, this.boundaries)
  }

  /**
   * Divide this integer by another integer, checking for overflow.
   * @param other - The integer to divide by.
   * @returns A new CheckedBigInt with the result of the division.
   * @throws RangeError If the result of the division would exceed the bit size.
   * @throws RangeError If the divisor is zero.
   */
  div (other: bigint): CheckedBigInt {
    if (other === 0n) {
      throw new RangeError('CheckedBigInt: division by zero')
    }
    if (this.boundaries.min !== 0n && this.value === this.boundaries.min && other === -1n) {
      throw new RangeError('CheckedBigInt: division overflow')
    }
    return new CheckedBigInt(this.value / other, this.boundaries)
  }

  /**
   * Remainder of the division of this integer by another integer, checking for overflow.
   * @param other - The integer to divide by.
   * @returns A new CheckedBigInt with the result of the remainder.
   * @throws RangeError If the result of the remainder would exceed the bit size.
   * @throws RangeError If the divisor is zero.
   */
  rem (other: bigint): CheckedBigInt {
    if (other === 0n) {
      throw new RangeError('CheckedBigInt: division by zero')
    }
    if (this.boundaries.min !== 0n && this.value === this.boundaries.min && other === -1n) {
      throw new RangeError('CheckedBigInt: division overflow')
    }
    return new CheckedBigInt(this.value % other, this.boundaries)
  }

  /**
   * Power this integer to another integer, checking for overflow.
   * @param exponent - The integer to power by.
   * @returns A new CheckedBigInt with the result of the power.
   * @throws RangeError If the result of the power would exceed the bit size.
   */
  pow (exponent: bigint): CheckedBigInt {
    return new CheckedBigInt(this.value ** exponent, this.boundaries)
  }

  /**
   * Bitwise shift left this integer by another integer, checking for overflow.
   * @param bits - The integer to shift by.
   * @returns A new CheckedBigInt with the result of the shift.
   * @throws RangeError If the number of bits is negative.
   * @throws RangeError If the resulting number would exceed the bit size.
   */
  shl (bits: number | bigint): CheckedBigInt {
    if (bits < 0n) {
      throw new RangeError('CheckedBigInt: shift count must be non-negative')
    }
    return new CheckedBigInt(this.value << BigInt(bits), this.boundaries)
  }

  /**
   * Bitwise shift right this integer by another integer, checking for overflow.
   * @param bits - The integer to shift by.
   * @returns A new CheckedBigInt with the result of the shift.
   * @throws RangeError If the number of bits is negative.
   * @throws RangeError If bits is greater than the bit size.
   */
  shr (bits: number | bigint): CheckedBigInt {
    if (bits < 0n) {
      throw new RangeError('CheckedBigInt: shift count must be non-negative')
    }

    return new CheckedBigInt(this.value >> BigInt(bits), this.boundaries)
  }
}
