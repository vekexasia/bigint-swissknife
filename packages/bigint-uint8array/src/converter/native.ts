import * as native from 'bigint-buffer'
import { type IConverter } from './type'

export const converter: IConverter = {
  bigEndianToNewArray: native.toBufferBE,
  bigEndianToArray: (num: bigint, dest: Uint8Array) => {
    const src = converter.bigEndianToNewArray(num, dest.length)
    dest.set(src)
  },
  littleEndianToNewArray: native.toBufferLE,
  littleEndianToArray: (num: bigint, dest: Uint8Array) => {
    const src = converter.littleEndianToNewArray(num, dest.length)
    dest.set(src)
  },
  arrayToLittleEndian: native.toBigIntLE as IConverter['arrayToLittleEndian'],
  arrayToBigEndian: native.toBigIntBE as IConverter['arrayToBigEndian']
}
