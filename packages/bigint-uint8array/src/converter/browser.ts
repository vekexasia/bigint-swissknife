import { type IConverter } from './type'
const toHex = (buf: Uint8Array): string => {
  return Array.from(buf).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
export const converter: IConverter = {
  toBigUIntBE (buf: Uint8Array) {
    if (buf.length === 0) {
      return 0n
    }
    return BigInt('0x' + toHex(buf))
  },
  toBigUIntLE (buf: Uint8Array) {
    if (buf.length === 0) {
      return 0n
    }
    return BigInt('0x' + toHex(new Uint8Array(buf).reverse()))
  },
  toUint8ArrayBE (num: bigint, bytes: number) {
    if (bytes <= 0) {
      throw new RangeError('bytes must be greater than 0')
    }
    const hex = num.toString(16).padStart(bytes * 2, '0')
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return new Uint8Array(hex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)))
  },
  toUint8ArrayLE (num: bigint, bytes: number) {
    return converter.toUint8ArrayBE(num, bytes).reverse()
  }
}
