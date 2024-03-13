import { describe, it, expect } from 'vitest'
import { converter as browserConverter } from "@/converter/browser.js";
import { converter as nativeConverter } from "@/converter/native.js";

describe('parity', () => {
  for (let i = 8; i < 255; i++) {
    it(`should convert a ${i} lenght buffer to a big-endian BigInt`, () => {
      const t = Uint8Array.from(new Array(i).fill(0).map((_, i) => i));
      expect(browserConverter.toBigUIntBE(t)).toEqual(nativeConverter.toBigUIntBE(t));
      expect(browserConverter.toUint8ArrayBE(browserConverter.toBigUIntBE(t), i))
        .toEqual(new Uint8Array(nativeConverter.toUint8ArrayBE(nativeConverter.toBigUIntBE(t), i)));
    });
    it(`should convert a ${i} lenght buffer to a little-endian BigInt`, () => {
      const t = Uint8Array.from(new Array(i).fill(0).map((_, i) => i));
      expect(browserConverter.toBigUIntLE(t)).toEqual(nativeConverter.toBigUIntLE(t));
      expect(browserConverter.toUint8ArrayLE(browserConverter.toBigUIntLE(t), i))
        .toEqual(new Uint8Array(nativeConverter.toUint8ArrayLE(nativeConverter.toBigUIntLE(t), i)));

    });
  }

});
