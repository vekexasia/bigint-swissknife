import { describe, expect, it } from 'vitest'
import {
  CheckedBigInt,
  i128,
  i16,
  i256,
  i32,
  i64,
  i8, u128, u16, u256, u32, u64,
  u8
} from '../src/index.js'

describe('CheckedBigInt', () => {
  describe('constructor', () => {
    it('should construct boundaries properly', () => {
      expect(i8(127n).boundaries).to.deep.eq({ min: -128n, max: 127n })
      expect(u8(127n).boundaries).to.deep.eq({ min: 0n, max: 255n })
    })
    it('should throw on invalid bit size', () => {
      expect(() => new CheckedBigInt(0, 0n, false)).to.throw(RangeError)
      expect(() => new CheckedBigInt(-1, 0n, false)).to.throw(RangeError)
    })
    it('should allow custom boundaries', () => {
      const a = new CheckedBigInt(8, 0n, { min: 0n, max: 2n })
      expect(a.boundaries).to.deep.eq({ min: 0n, max: 2n })
    })
  })

  describe('checkedAdd', () => {
    it('should should return added value', () => {
      const a = i8(1n).checkedAdd(1n)
      expect(a.value).to.eq(2n)
    })
    it('should throw on overflow', () => {
      expect(() => i8(127n).checkedAdd(1n)).to.throw(RangeError)
      expect(() => i8(-128n).checkedAdd(-1n)).to.throw(RangeError)
    })
  })

  describe('checkedSub', () => {
    it('should should return subtracted value', () => {
      const a = i8(1n).checkedSub(1n)
      expect(a.value).to.eq(0n)
    })
    it('should throw on overflow', () => {
      expect(() => i8(-128n).checkedSub(1n)).to.throw(RangeError)
      expect(() => i8(127n).checkedSub(-1n)).to.throw(RangeError)
    })
  })

  describe('checkedRem', () => {
    it('should return remainder', () => {
      const a = i8(5n).checkedRem(3n)
      expect(a.value).to.eq(2n)
    })
    it('should throw on division by zero', () => {
      expect(() => i8(5n).checkedRem(0n)).to.throw(RangeError)
    })
    it('should throw on overflow', () => {
      expect(() => i8(-128n).checkedRem(-1n)).to.throw(RangeError)
    })
  })

  describe('checkedMul', () => {
    it('should return multiplication', () => {
      const a = i8(5n).checkedMul(3n)
      expect(a.value).to.eq(15n)
    })
    it('should throw on overflow', () => {
      expect(() => i8(15n).checkedMul(8n)).to.not.throw(RangeError)
      expect(() => i8(16n).checkedMul(8n)).to.throw(RangeError)
    })
    it('should throw if multiplication turns to negative in UINT', () => {
      expect(() => u8(1n).checkedMul(-1n)).to.throw(RangeError)
    })
  })

  describe('checkedDiv', () => {
    it('should return division', () => {
      const a = i8(5n).checkedDiv(3n)
      expect(a.value).to.eq(1n)
    })
    it('should throw on division by zero', () => {
      expect(() => i8(5n).checkedDiv(0n)).to.throw(RangeError)
    })
    it('should throw on overflow', () => {
      expect(() => i8(-128n).checkedDiv(-1n)).to.throw(RangeError)
    })
  })

  describe('checkedPow', () => {
    it('should return power', () => {
      const a = i8(2n).checkedPow(3n)
      expect(a.value).to.eq(8n)
    })
    it('should throw on overflow', () => {
      expect(() => i8(2n).checkedPow(7n)).to.throw(RangeError)
    })
    it('should throw on negative exponent', () => {
      expect(() => i8(2n).checkedPow(-1n)).to.throw(RangeError)
    })
  })

  describe('checkedShl', () => {
    it('should shift left', () => {
      const a = i8(1n).checkedShl(1n)
      expect(a.value).to.eq(2n)
    })
    it('should throw on negative shift', () => {
      expect(() => i8(1n).checkedShl(-1n)).to.throw(RangeError)
    })
    it('should throw on overflow', () => {
      expect(() => i8(64n).checkedShl(1n)).to.throw(RangeError)
    })
  })

  describe('checkedShr', () => {
    it('should shift right', () => {
      const a = i8(2n).checkedShr(1n)
      expect(a.value).to.eq(1n)
    })
    it('should throw on negative shift', () => {
      expect(() => i8(1n).checkedShr(-1n)).to.throw(RangeError)
    })
    it('should throw on more bits', () => {
      expect(() => i8(-128n).checkedShr(8n)).to.not.throw(RangeError)
      expect(() => i8(-128n).checkedShr(9n)).to.throw(RangeError)
    })
  })

  describe('utilityTypes', () => {
    describe('signed', () => {
      it('should return proper signed', () => {
        expect(i8(1n).boundaries.min).to.eq(-128n)
        expect(i16(1n).boundaries.min).to.eq(-(2n ** 15n))
        expect(i32(1n).boundaries.min).to.eq(-(2n ** 31n))
        expect(i64(1n).boundaries.min).to.eq(-(2n ** 63n))
        expect(i128(1n).boundaries.min).to.eq(-(2n ** 127n))
        expect(i256(1n).boundaries.min).to.eq(-(2n ** 255n))
      })
    })
    describe('unsigned', () => {
      it('should return proper unsigned', () => {
        expect(u8(1n).boundaries.max).to.eq(2n ** 8n - 1n)
        expect(u16(1n).boundaries.max).to.eq(2n ** 16n - 1n)
        expect(u32(1n).boundaries.max).to.eq(2n ** 32n - 1n)
        expect(u64(1n).boundaries.max).to.eq(2n ** 64n - 1n)
        expect(u128(1n).boundaries.max).to.eq(2n ** 128n - 1n)
        expect(u256(1n).boundaries.max).to.eq(2n ** 256n - 1n)
      })
    })
  })
})
