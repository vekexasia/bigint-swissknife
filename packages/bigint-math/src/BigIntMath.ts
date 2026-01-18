import { type BigIntable } from './types.js'
import { fillRandom } from './fillRandom.js'
import {
  converter
} from '@vekexasia/bigint-uint8array'

/**
 * A collection of functions to perform mathematical operations on BigInts
 */
export const BigIntMath = {
  /**
   * Returns the absolute value of a given number
   * @param value - The value to get the absolute value of
   * @returns The absolute value of the input
   * @example
   * ```typescript
   * BigIntMath.abs(-1n) // 1n
   * BigIntMath.abs(1n) // 1n
   * BigIntMath.abs(-1) // 1n
   * BigIntMath.abs("-1") // 1n
   * ```
   */
  abs (value: BigIntable): bigint {
    const v = BigInt(value)
    return v < 0n ? -v : v
  },

  /**
   * Returns the sign of a given number
   * @param value - The value to get the sign of
   * @returns -1 if the value is negative, 0 if the value is 0, 1 if the value is positive
   * @example
   * ```typescript
   * BigIntMath.sign(-1n) // -1
   * BigIntMath.sign(0n) // 0
   * BigIntMath.sign(1n) // 1
   * ```
   */
  sign (value: BigIntable): -1 | 0 | 1 {
    const v = BigInt(value)
    return v === 0n ? 0 : v < 0n ? -1 : 1
  },

  /**
   * Returns the maximum of a list of numbers
   * @param args - The numbers to get the maximum of
   * @returns The maximum of the input numbers **transformed to a BigInt**
   * @example
   * ```typescript
   * BigIntMath.max(1n, 2n, 3n) // 3n
   * BigIntMath.max(1, 2n, "3") // 3n
   * ```
   */
  max (...args: BigIntable[]): bigint {
    return args.reduce<bigint>((max, val) => (BigInt(val) > max ? BigInt(val) : max), BigInt(args[0]))
  },

  /**
   * Returns the minimum of a list of numbers
   * @param args - The numbers to get the minimum of
   * @returns The minimum of the input numbers **transformed to a BigInt**
   * @example
   * ```typescript
   * BigIntMath.min(1n, 2n, 3n) // 1n
   * BigIntMath.min(1, 2n, "3") // 1n
   * ```
   */
  min (...args: BigIntable[]): bigint {
    return args.reduce<bigint>((min, val) => (BigInt(val) < min ? BigInt(val) : min), BigInt(args[0]))
  },

  /**
   * Returns the number of bits required to represent a given number
   * @param bigint - The number to get the bit length of
   * @returns The number of bits required to represent the input number
   */
  bitLength (bigint: BigIntable): number {
    let v = BigInt(bigint)
    if (v < 0) {
      v = -v
    }
    if (v === 1n) { return 1 }
    let bits = 1
    do {
      bits++
    } while ((v >>= 1n) > 1n)
    return bits
  },

  /**
   * Returns the quotient and remainder of a division between two numbers
   * @param dividend - The number to divide
   * @param divisor - The number to divide by
   * @returns The quotient and remainder of the division
   */
  divide (dividend: BigIntable, divisor: BigIntable): { quotient: bigint, remainder: bigint } {
    const a = BigInt(dividend)
    const b = BigInt(divisor)
    return {
      quotient: a / b,
      remainder: a % b
    }
  },

  /**
   * Returns the quotient of a division between two numbers, rounded up
   * @param dividend - The number to divide
   * @param divisor - The number to divide by
   * @returns The quotient of the division, rounded up
   * @example
   * ```typescript
   * BigIntMath.ceilDivide(5n, 2n) // 3n
   * BigIntMath.ceilDivide(4n, 2n) // 2n
   * ```
   */
  ceilDivide (dividend: BigIntable, divisor: BigIntable): bigint {
    const { quotient, remainder } = BigIntMath.divide(dividend, divisor)
    return remainder === 0n ? quotient : quotient + 1n
  },

  /**
   * Returns the quotient of a division between two numbers, rounded to the nearest integer
   * @param dividend - The number to divide
   * @param divisor - The number to divide by
   * @returns The quotient of the division, rounded to the nearest integer
   * @example
   * ```typescript
   * BigIntMath.roundDivide(7n, 3n) // 2n
   * BigIntMath.roundDivide(7n, 2n) // 4n (3.5 rounded to the nearest integer)
   * ```
   */
  roundDivide (dividend: BigIntable, divisor: BigIntable): bigint {
    const { quotient, remainder } = BigIntMath.divide(dividend, divisor)
    return remainder * 2n >= BigInt(divisor) ? quotient + 1n : quotient
  },

  /**
   * Returns a random number between 0 and a given maximum
   * @param max - The maximum value of the random number
   * @returns A random number between 0 and the input maximum
   * @remarks
   * This function uses a cryptographically secure random number generator
   * In Node.js, it uses `crypto.randomBytes`
   * In browsers, it uses `crypto.getRandomValues`
   *
   * @example
   * ```typescript
   * BigIntMath.rand(10n) // A random number between 0 and 10
   * ```
   */
  rand (max: bigint): bigint {
    const bufLength = Math.ceil(BigIntMath.bitLength(max) / 8)
    const buffer = Uint8Array.from(new Array(bufLength).fill(0))
    fillRandom(buffer)
    return converter.unsigned.be.toBigInt(buffer) % max
  }
}
