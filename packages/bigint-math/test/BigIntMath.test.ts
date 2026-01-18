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
  it('min', () => {
    expect(BigIntMath.min(-1, 1n, '2')).eq(-1n)
    expect(BigIntMath.min(1, 2)).eq(1n)
    expect(BigIntMath.min('1', '2')).eq(1n)
  })
  it('rand', () => {
    const rand = BigIntMath.rand(10n)
    expect(rand).toBeGreaterThanOrEqual(0n)
    expect(rand).toBeLessThanOrEqual(10n)

    for (let i = 1n; i < 65536n; i++) {
      const r = BigIntMath.rand(i)
      expect(r).toBeGreaterThanOrEqual(0n)
      expect(r).toBeLessThanOrEqual(i)
    }
  })
  it('sign', () => {
    expect(BigIntMath.sign(-1n)).eq(-1)
    expect(BigIntMath.sign(0n)).eq(0)
    expect(BigIntMath.sign(1n)).eq(1)
  })

  it('ceilDivide', () => {
    expect(BigIntMath.ceilDivide(5n, 2n)).eq(3n)
    expect(BigIntMath.ceilDivide(5, 2)).eq(3n)
    expect(BigIntMath.ceilDivide('5', '2')).eq(3n)

    expect(BigIntMath.ceilDivide(4n, 2n)).eq(2n)
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
})
