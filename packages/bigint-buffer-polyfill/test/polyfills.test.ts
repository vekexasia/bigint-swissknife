import '@/index.js'
import { BELEs } from '@cases'
import { describe, it, expect } from 'vitest'

describe('buffer', () => {
  describe('int', () => {
    BELEs.forEach((bele) => {
      it(`${bele.num}.${bele.type} - bytes[${bele.bytes}] - expect => ${bele.expect}`, () => {
        const buf = Buffer.alloc(bele.bytes)
        if (bele.type === 'le') {
          buf.writeBigIntLE(bele.num, bele.bytes)
        } else {
          buf.writeBigIntBE(bele.num, bele.bytes)
        }
        expect(buf.toString('hex')).toEqual(bele.expect)
      })
    })

    // with offset
    BELEs.forEach((bele) => {
      it(`${bele.num}.${bele.type} - bytes[${bele.bytes}] - offset[10], expect => ${bele.expect}`, () => {
        const buf = Buffer.alloc(bele.bytes + 10).fill(0)
        if (bele.type === 'le') {
          buf.writeBigIntLE(bele.num, bele.bytes, 10)
        } else {
          buf.writeBigIntBE(bele.num, bele.bytes, 10)
        }
        expect(buf.toString('hex')).toEqual(Buffer.alloc(10, 0).toString('hex') + bele.expect)
      })
    })

    // READ
    BELEs.forEach((bele) => {
      it(`readBigInt${bele.type} - bytes[${bele.bytes}] - expect => ${bele.num}`, () => {
        const buf = Buffer.from(bele.expect, 'hex')
        if (bele.type === 'le') {
          expect(buf.readBigIntLE(bele.bytes)).toEqual(bele.num)
        } else {
          expect(buf.readBigIntBE(bele.bytes)).toEqual(bele.num)
        }
      })
      it(`readBigInt${bele.type} - bytes[${bele.bytes}] - offset[10] expect => ${bele.num}`, () => {
        const buf = Buffer.concat([
          Buffer.alloc(10, 255), Buffer.from(bele.expect, 'hex')
        ])
        if (bele.type === 'le') {
          expect(buf.readBigIntLE(bele.bytes, 10)).toEqual(bele.num)
        } else {
          expect(buf.readBigIntBE(bele.bytes, 10)).toEqual(bele.num)
        }
      })
    })
  })

  describe('uint', () => {
    it('boundarychecks', () => {
      const buf = Buffer.alloc(2)
      expect(() => buf.writeBigUIntLE(-1n, 2)).toThrow()
      expect(() => buf.writeBigUIntBE(-1n, 2)).toThrow()
      // expect(() => buf.writeBigUIntLE(65536n, 2)).toThrow()
      // expect(() => buf.writeBigUIntBE(65536n, 2)).toThrow()

      expect(() => buf.writeBigUIntLE(0n, 2)).not.toThrow()
      expect(() => buf.writeBigUIntBE(0n, 2)).not.toThrow()
    })
    it('writeread', () => {
      const buf = Buffer.alloc(2)
      buf.writeBigUIntLE(65535n, 2)
      expect(buf.readBigUIntLE(2)).toEqual(65535n)
      buf.writeBigUIntBE(65535n, 2)
      expect(buf.readBigUIntBE(2)).toEqual(65535n)
    })
    it('writeread with offset', () => {
      const buf = Buffer.alloc(4)
      buf.writeBigUIntLE(65535n, 2, 2)
      expect(buf.readBigUIntLE(2, 2)).toEqual(65535n)
      buf.writeBigUIntBE(65535n, 2, 2)
      expect(buf.readBigUIntBE(2, 2)).toEqual(65535n)
    })
  })
})
