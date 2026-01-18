import { describe, expect, it } from 'vitest'
import { BigIntMath } from '@/index.js'

describe('BigIntMath', () => {
  it('abs', () => {
    expect(BigIntMath.abs(-1n)).eq(1n)
    expect(BigIntMath.abs(1n)).eq(1n)
    expect(BigIntMath.abs(-1)).eq(1n)
    expect(BigIntMath.abs('-1')).eq(1n)
  })

  it('max', () => {
    expect(BigIntMath.max(-1, 1n, '2')).eq(2n)
    expect(BigIntMath.max(1, 2)).eq(2n)
    expect(BigIntMath.max('1', '2')).eq(2n)
  })

  it('max should throw on empty args', () => {
    expect(() => BigIntMath.max()).toThrow(RangeError)
  })

  it('min', () => {
    expect(BigIntMath.min(-1, 1n, '2')).eq(-1n)
    expect(BigIntMath.min(1, 2)).eq(1n)
    expect(BigIntMath.min('1', '2')).eq(1n)
  })

  it('min should throw on empty args', () => {
    expect(() => BigIntMath.min()).toThrow(RangeError)
  })

  it('rand', () => {
    const rand = BigIntMath.rand(10n)
    expect(rand).toBeGreaterThanOrEqual(0n)
    expect(rand).toBeLessThan(10n)

    for (let i = 1n; i < 65536n; i++) {
      const r = BigIntMath.rand(i)
      expect(r).toBeGreaterThanOrEqual(0n)
      expect(r).toBeLessThan(i)
    }
  })

  it('rand should throw on zero or negative max', () => {
    expect(() => BigIntMath.rand(0n)).toThrow(RangeError)
    expect(() => BigIntMath.rand(-1n)).toThrow(RangeError)
    expect(() => BigIntMath.rand(-100n)).toThrow(RangeError)
  })

  it('sign', () => {
    expect(BigIntMath.sign(-1n)).eq(-1)
    expect(BigIntMath.sign(0n)).eq(0)
    expect(BigIntMath.sign(1n)).eq(1)
  })

  it('bitLength', () => {
    expect(BigIntMath.bitLength(0n)).eq(1)
    expect(BigIntMath.bitLength(1n)).eq(1)
    expect(BigIntMath.bitLength(2n)).eq(2)
    expect(BigIntMath.bitLength(3n)).eq(2)
    expect(BigIntMath.bitLength(4n)).eq(3)
    expect(BigIntMath.bitLength(7n)).eq(3)
    expect(BigIntMath.bitLength(8n)).eq(4)
    expect(BigIntMath.bitLength(255n)).eq(8)
    expect(BigIntMath.bitLength(256n)).eq(9)
    expect(BigIntMath.bitLength(-1n)).eq(1)
    expect(BigIntMath.bitLength(-255n)).eq(8)
  })

  it('divide', () => {
    expect(BigIntMath.divide(10n, 3n)).toEqual({ quotient: 3n, remainder: 1n })
    expect(BigIntMath.divide(10, 3)).toEqual({ quotient: 3n, remainder: 1n })
    expect(BigIntMath.divide('10', '3')).toEqual({ quotient: 3n, remainder: 1n })
    expect(BigIntMath.divide(9n, 3n)).toEqual({ quotient: 3n, remainder: 0n })
    expect(BigIntMath.divide(-10n, 3n)).toEqual({ quotient: -3n, remainder: -1n })
  })

  it('divide should throw on division by zero', () => {
    expect(() => BigIntMath.divide(10n, 0n)).toThrow(RangeError)
    expect(() => BigIntMath.divide(10, 0)).toThrow(RangeError)
  })

  it('ceilDivide', () => {
    expect(BigIntMath.ceilDivide(5n, 2n)).eq(3n)
    expect(BigIntMath.ceilDivide(5, 2)).eq(3n)
    expect(BigIntMath.ceilDivide('5', '2')).eq(3n)
    expect(BigIntMath.ceilDivide(4n, 2n)).eq(2n)
  })

  it('ceilDivide should throw on division by zero', () => {
    expect(() => BigIntMath.ceilDivide(5n, 0n)).toThrow(RangeError)
  })

  it('roundDivide', () => {
    expect(BigIntMath.roundDivide(7n, 3n)).eq(2n)
    expect(BigIntMath.roundDivide(7, 3n)).eq(2n)
    expect(BigIntMath.roundDivide(7, '3')).eq(2n)
    // 3.5
    expect(BigIntMath.roundDivide(7n, 2)).eq(4n)
    expect(BigIntMath.roundDivide(7, 2)).eq(4n)
    expect(BigIntMath.roundDivide(7, 2)).eq(4n)
  })

  it('roundDivide should throw on division by zero', () => {
    expect(() => BigIntMath.roundDivide(7n, 0n)).toThrow(RangeError)
  })
})
