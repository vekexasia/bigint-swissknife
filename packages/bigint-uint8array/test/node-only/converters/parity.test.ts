import { describe, it, expect } from 'vitest'
import { uncheckedConverter as browserConverter } from '@/converter/browser.js'
import { uncheckedConverter as nativeConverter } from '@/converter/native.js'

describe('parity', () => {
  for (let i = 8; i < 255; i++) {
    it(`should convert a ${i} lenght buffer to a big-endian BigInt`, () => {
      const t = Uint8Array.from(new Array(i).fill(0).map((_, i) => i))
      expect(browserConverter.arrayToBigEndian(t)).toEqual(nativeConverter.arrayToBigEndian(t))
      expect(browserConverter.bigEndianToNewArray(browserConverter.arrayToBigEndian(t), i))
        .toEqual(new Uint8Array(nativeConverter.bigEndianToNewArray(nativeConverter.arrayToBigEndian(t), i)))
    })
    it(`should convert a ${i} lenght buffer to a little-endian BigInt`, () => {
      const t = Uint8Array.from(new Array(i).fill(0).map((_, i) => i))
      expect(browserConverter.arrayToLittleEndian(t)).toEqual(nativeConverter.arrayToLittleEndian(t))
      expect(browserConverter.littleEndianToNewArray(browserConverter.arrayToLittleEndian(t), i))
        .toEqual(new Uint8Array(nativeConverter.littleEndianToNewArray(nativeConverter.arrayToLittleEndian(t), i)))
    })
  }
})
