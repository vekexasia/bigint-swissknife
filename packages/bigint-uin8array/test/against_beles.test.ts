import {BELEs} from "./intcases.js";
import {describe, expect, it} from "vitest";
import {converter} from "@/index.js";
const toHex = (buf: Uint8Array): string => {
  return Array.from(buf).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
describe('main against beles', () => {
  BELEs.forEach((bele) => {
    it(`${bele.num}.${bele.type} - bytes[${bele.bytes}] - expect => ${bele.expect}`, () => {

      if (bele.type === 'le') {
        const buf = converter.signed.le.toUint8Array(bele.num, bele.bytes);
        expect(toHex(buf)).toEqual(bele.expect)
        expect(converter.signed.le.toBigInt(buf)).toEqual(bele.num)
      } else {
        const buf = converter.signed.be.toUint8Array(bele.num, bele.bytes);
        expect(toHex(buf)).toEqual(bele.expect)
        expect(converter.signed.be.toBigInt(buf)).toEqual(bele.num)
      }
    });
  });
});
