import {type UncheckedConverter} from './type'
import {uncheckedConverter as fallback} from './browser.js';
let _uncheckedConverter: UncheckedConverter = fallback;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const module = await import('bigint-buffer');

  if (module) {
    _uncheckedConverter = {
      bigEndianToNewArray: module.toBufferBE,
      bigEndianToArray: (num: bigint, dest: Uint8Array) => {
        const src = _uncheckedConverter.bigEndianToNewArray(num, dest.length)
        dest.set(src)
      },
      littleEndianToNewArray: module.toBufferLE,
      littleEndianToArray: (num: bigint, dest: Uint8Array) => {
        const src = _uncheckedConverter.littleEndianToNewArray(num, dest.length)
        dest.set(src)
      },
      arrayToLittleEndian: module.toBigIntLE as UncheckedConverter['arrayToLittleEndian'],
      arrayToBigEndian: module.toBigIntBE as UncheckedConverter['arrayToBigEndian']
    }
  }
} catch (e) {
  // bigint-buffer not available as peer-dependency
  console.log('not found');
}
export const uncheckedConverter = _uncheckedConverter

