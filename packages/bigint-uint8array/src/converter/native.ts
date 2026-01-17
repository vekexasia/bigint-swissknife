import {type UncheckedConverter} from './type'
import {uncheckedConverter as fallback} from './browser.js';
let _uncheckedConverter: UncheckedConverter = fallback;

// Try bigint-buffer2 first (new Rust-based implementation with better performance)
try {
  const buffer2 = await import('@vekexasia/bigint-buffer2/adapter');
  if (buffer2?.uncheckedConverter) {
    _uncheckedConverter = buffer2.uncheckedConverter;
  }
} catch {
  // bigint-buffer2 not available, try original bigint-buffer
  try {
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
  } catch {
    // Neither bigint-buffer2 nor bigint-buffer available, use JS fallback
  }
}
export const uncheckedConverter = _uncheckedConverter

