import * as native from 'bigint-buffer'
import { type UncheckedConverter } from './type'

export const uncheckedConverter: UncheckedConverter = {
  bigEndianToNewArray: native.toBufferBE,
  bigEndianToArray: (num: bigint, dest: Uint8Array) => {
    const src = uncheckedConverter.bigEndianToNewArray(num, dest.length)
    dest.set(src)
  },
  littleEndianToNewArray: native.toBufferLE,
  littleEndianToArray: (num: bigint, dest: Uint8Array) => {
    const src = uncheckedConverter.littleEndianToNewArray(num, dest.length)
    dest.set(src)
  },
  arrayToLittleEndian: native.toBigIntLE as UncheckedConverter['arrayToLittleEndian'],
  arrayToBigEndian: native.toBigIntBE as UncheckedConverter['arrayToBigEndian']
}
