import { type BigIntable } from './types.js'

export const BigIntMath = {
  abs (value: BigIntable): bigint {
    const v = BigInt(value)
    return v < 0n ? -v : v
  },

  sign (value: BigIntable): -1 | 0 | 1 {
    const v = BigInt(value)
    return v === 0n ? 0 : v < 0n ? -1 : 1
  },

  max (...args: BigIntable[]): bigint {
    return args.reduce<bigint>((max, val) => (BigInt(val) > max ? BigInt(val) : max), BigInt(args[0]))
  },

  min (...args: BigIntable[]): bigint {
    return args.reduce<bigint>((min, val) => (BigInt(val) < min ? BigInt(val) : min), BigInt(args[0]))
  },

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

  moduloAdd (addends: BigIntable[], modulus: BigIntable): bigint {
    const m = BigInt(modulus)
    return addends.reduce<bigint>((acc, val) => (acc + BigInt(val)) % m, 0n)
  },

  rand (max: bigint): bigint {
    const isBrowser = Object.getPrototypeOf(
      Object.getPrototypeOf(globalThis)
    ) !== Object.prototype
    if (isBrowser) {
      const arr = new Uint8Array(8)
      crypto.getRandomValues(arr)
      return BigInt(arr.readBigInt64BE(0)) % max
    }
    crypto.randomBytes(8).readBigInt64BE(0)
    return 0n
  }
}

Math.random()
