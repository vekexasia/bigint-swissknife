import {type UncheckedConverter} from './type'
import {uncheckedConverter as fallback} from './browser.js';
let _uncheckedConverter: UncheckedConverter = fallback;

// Try bigint-buffer2 (Rust-based implementation with better performance)
try {
  // For ESM: await import() waits for module, then we await initNative()
  // For CJS: esbuild replaces "await import(" with "require(" making it sync,
  //          initNative() is already called by bigint-buffer2 at load time
  const module = await import('@vekexasia/bigint-buffer2');

  if (module) {
    // initNative returns a promise - awaiting it ensures native is ready for ESM
    // For CJS this becomes a no-op since require() is sync and initNative already started
    const initPromise = module.initNative();
    if (initPromise && typeof initPromise.then === 'function') {
      await initPromise;
    }

    _uncheckedConverter = {
      bigEndianToNewArray: (num, bytes) => new Uint8Array(module.toBufferBE(num, bytes)),
      bigEndianToArray: (num, dest) => module.toBufferBEInto(num, dest),
      littleEndianToNewArray: (num, bytes) => new Uint8Array(module.toBufferLE(num, bytes)),
      littleEndianToArray: (num, dest) => module.toBufferLEInto(num, dest),
      arrayToLittleEndian: module.toBigIntLE,
      arrayToBigEndian: module.toBigIntBE
    }
  }
} catch {
  // bigint-buffer2 not available, use JS fallback (also from bigint-buffer2)
}
export const uncheckedConverter = _uncheckedConverter

