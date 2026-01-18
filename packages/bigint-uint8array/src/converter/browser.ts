import { type UncheckedConverter } from './type'
import { fallback } from '@vekexasia/bigint-buffer2/fallback'

export const uncheckedConverter: UncheckedConverter = {
  arrayToBigEndian: fallback.toBigIntBE,
  arrayToLittleEndian: fallback.toBigIntLE,
  bigEndianToNewArray: (num, bytes) => new Uint8Array(fallback.toBufferBE(num, bytes)),
  bigEndianToArray: (num, dest) => fallback.toBufferBEInto(num, dest),
  littleEndianToNewArray: (num, bytes) => new Uint8Array(fallback.toBufferLE(num, bytes)),
  littleEndianToArray: (num, dest) => fallback.toBufferLEInto(num, dest),
}
