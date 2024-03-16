import { byteBoundaries, assertIntBoundaries, assertUIntBoundaries } from '@/utils'
import {converter} from "@/index.js";
import { describe, it, expect } from 'vitest'
describe('utils', () => {
  it('boundaries', () => {
    expect(byteBoundaries(1)).toEqual({ min: -128n, max: 127n })
    expect(byteBoundaries(2)).toEqual({ min: -32768n, max: 32767n })
    expect(byteBoundaries(4)).toEqual({ min: -2147483648n, max: 2147483647n })
    expect(byteBoundaries(8)).toEqual({ min: -9223372036854775808n, max: 9223372036854775807n })
  })
  it('assertIntBoundaries', () => {
    expect(() => assertIntBoundaries(127n, 1)).not.throws()
    expect(() => assertIntBoundaries(128n, 1)).throws()
    expect(() => assertIntBoundaries(-128n, 1)).not.throws()
    expect(() => assertIntBoundaries(-129n, 1)).throws()
    expect(() => assertIntBoundaries(128n, 2)).not.throws()
  })
  it('assertUIntBoundaries', () => {
    expect(() => assertUIntBoundaries(127n, 1)).not.throw()
    expect(() => assertUIntBoundaries(255n, 1)).not.throw()
    expect(() => assertUIntBoundaries(256n, 1)).throws()
    expect(() => assertUIntBoundaries(-128n, 1)).throws()
    expect(() => assertUIntBoundaries(-129n, 1)).throws()
    expect(() => assertUIntBoundaries(256n, 2)).not.throw()
  })
})

describe('converter', () => {
  it('assertIntBoundaries', () => {
    expect(() => converter.signed.be.toNewArray(127n, 1)).not.throws()
    expect(() => converter.signed.be.toNewArray(128n, 1)).throws()
    expect(() => converter.signed.be.toNewArray(-128n, 1)).not.throws()
    expect(() => converter.signed.be.toNewArray(-129n, 1)).throws()
    expect(() => converter.signed.be.toNewArray(128n, 2)).not.throws()
    expect(() => converter.signed.le.toNewArray(127n, 1)).not.throws()
    expect(() => converter.signed.le.toNewArray(128n, 1)).throws()
    expect(() => converter.signed.le.toNewArray(-128n, 1)).not.throws()
    expect(() => converter.signed.le.toNewArray(-129n, 1)).throws()
    expect(() => converter.signed.le.toNewArray(128n, 2)).not.throws()
    const arr = new Uint8Array(1)
    expect(() => converter.signed.be.toArray(127n, arr)).not.throw()
    expect(() => converter.signed.be.toArray(128n, arr)).throws()
    expect(() => converter.signed.be.toArray(-128n, arr)).not.throw()
    expect(() => converter.signed.be.toArray(-129n, arr)).throws()

  })
  it('assertUIntBoundaries', () => {
    expect(() => converter.unsigned.be.toNewArray(127n, 1)).not.throw()
    expect(() => converter.unsigned.be.toNewArray(255n, 1)).not.throw()
    expect(() => converter.unsigned.be.toNewArray(256n, 1)).throws()
    expect(() => converter.unsigned.be.toNewArray(-128n, 1)).throws()
    expect(() => converter.unsigned.be.toNewArray(-129n, 1)).throws()
    expect(() => converter.unsigned.be.toNewArray(256n, 2)).not.throw()
    expect(() => converter.unsigned.le.toNewArray(127n, 1)).not.throw()
    expect(() => converter.unsigned.le.toNewArray(255n, 1)).not.throw()
    expect(() => converter.unsigned.le.toNewArray(256n, 1)).throws()
    expect(() => converter.unsigned.le.toNewArray(-128n, 1)).throws()
    expect(() => converter.unsigned.le.toNewArray(-129n, 1)).throws()
    expect(() => converter.unsigned.le.toNewArray(256n, 2)).not.throw()

    const arr = new Uint8Array(1)
    expect(() => converter.unsigned.be.toArray(127n, arr)).not.throw()
    expect(() => converter.unsigned.be.toArray(255n, arr)).not.throws()
    expect(() => converter.unsigned.be.toArray(256n, arr)).throws()

  })
})
/**/
