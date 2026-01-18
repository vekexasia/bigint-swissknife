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
   * @throws RangeError If the exponent is negative.
   * @throws RangeError If the result of the power would exceed the bit size.
   */
  pow (exponent: bigint): CheckedBigInt {
    if (exponent < 0n) {
      throw new RangeError('CheckedBigInt: exponent must be non-negative')
    }
    return new CheckedBigInt(this.value ** exponent, this.boundaries)
  }

  /**
   * Modulo operation (always returns non-negative result for positive divisor).
   * Unlike rem(), mod() follows mathematical modulo semantics where the result
   * has the same sign as the divisor.
   * @param other - The integer to divide by.
   * @returns A new CheckedBigInt with the modulo result.
   * @throws RangeError If the divisor is zero.
   * @example
   * ```typescript
   * i8(-5n).mod(3n)  // 1n (mathematical modulo)
   * i8(-5n).rem(3n)  // -2n (remainder)
   * ```
   */
  mod (other: bigint): CheckedBigInt {
    if (other === 0n) {
      throw new RangeError('CheckedBigInt: division by zero')
    }
    const result = ((this.value % other) + other) % other
    return new CheckedBigInt(result, this.boundaries)
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

  /**
   * Bitwise AND operation.
   * @param other - The integer to AND with.
   * @returns A new CheckedBigInt with the result.
   */
  and (other: bigint): CheckedBigInt {
    return new CheckedBigInt(this.value & other, this.boundaries)
  }

  /**
   * Bitwise OR operation.
   * @param other - The integer to OR with.
   * @returns A new CheckedBigInt with the result.
   */
  or (other: bigint): CheckedBigInt {
    return new CheckedBigInt(this.value | other, this.boundaries)
  }

  /**
   * Bitwise XOR operation.
   * @param other - The integer to XOR with.
   * @returns A new CheckedBigInt with the result.
   */
  xor (other: bigint): CheckedBigInt {
    return new CheckedBigInt(this.value ^ other, this.boundaries)
  }

  /**
   * Bitwise NOT operation (two's complement).
   * @returns A new CheckedBigInt with the bitwise complement.
   */
  not (): CheckedBigInt {
    return new CheckedBigInt(~this.value, this.boundaries)
  }

  /**
   * Check equality with another value.
   * @param other - The value to compare with.
   * @returns true if equal, false otherwise.
   */
  eq (other: bigint): boolean {
    return this.value === other
  }

  /**
   * Check inequality with another value.
   * @param other - The value to compare with.
   * @returns true if not equal, false otherwise.
   */
  neq (other: bigint): boolean {
    return this.value !== other
  }

  /**
   * Check if this value is less than another.
   * @param other - The value to compare with.
   * @returns true if less than, false otherwise.
   */
  lt (other: bigint): boolean {
    return this.value < other
  }

  /**
   * Check if this value is less than or equal to another.
   * @param other - The value to compare with.
   * @returns true if less than or equal, false otherwise.
   */
  lte (other: bigint): boolean {
    return this.value <= other
  }

  /**
   * Check if this value is greater than another.
   * @param other - The value to compare with.
   * @returns true if greater than, false otherwise.
   */
  gt (other: bigint): boolean {
    return this.value > other
  }

  /**
   * Check if this value is greater than or equal to another.
   * @param other - The value to compare with.
   * @returns true if greater than or equal, false otherwise.
   */
  gte (other: bigint): boolean {
    return this.value >= other
  }

  /**
   * Returns the string representation of the value.
   * @param radix - Optional radix for the string representation (default: 10).
   * @returns The string representation of the value.
   */
  toString (radix?: number): string {
    return this.value.toString(radix)
  }

  /**
   * Returns the value for JSON serialization.
   * Note: BigInt values are converted to strings in JSON.
   * @returns The string representation of the value.
   */
  toJSON (): string {
    return this.value.toString()
  }

  /**
   * Returns the primitive value (for use with valueOf).
   * @returns The bigint value.
   */
  valueOf (): bigint {
    return this.value
  }
}
