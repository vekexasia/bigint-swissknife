import { type IConverter } from './type'
const toHex = (buf: Uint8Array): string => {
  return Array.from(buf).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
export const converter: IConverter = {
  arrayToBigEndian (buf: Uint8Array) {
    if (buf.length === 0) {
      return 0n
    }
    return BigInt('0x' + toHex(buf))
  },
  arrayToLittleEndian (buf: Uint8Array) {
    if (buf.length === 0) {
      return 0n
    }
    return BigInt('0x' + toHex(new Uint8Array(buf).reverse()))
  },
  bigEndianToNewArray (num: bigint, bytes: number) {
    if (bytes <= 0) {
      throw new RangeError('bytes must be greater than 0')
    }
    const toRet = new Uint8Array(bytes)
    converter.bigEndianToArray(num, toRet)
    return toRet
  },
  bigEndianToArray (num: bigint, dest: Uint8Array) {
    const hex = num.toString(16).padStart(dest.length * 2, '0')
    if (hex.length > dest.length * 2) {
      throw new RangeError(`Number is too large to fit in the buffer - ${num} - ${hex} - ${hex.length} > ${dest.length * 2}`)
    }
    dest.set(hex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)))
  },
  littleEndianToNewArray (num: bigint, bytes: number) {
    if (bytes <= 0) {
      throw new RangeError('bytes must be greater than 0')
    }
    const toRet = new Uint8Array(bytes)
    converter.littleEndianToArray(num, toRet)
    return toRet
  },
  littleEndianToArray (num: bigint, dest: Uint8Array) {
    converter.bigEndianToArray(num, dest)
    dest.reverse()
  }

}
