/**
 * Browser stub for native module.
 * This is used in browser builds where native bindings are not available.
 */

import type { BigIntBuffer2Extended } from './types.js';

export function getNativeSync(): BigIntBuffer2Extended {
  throw new Error("@vekexasia/bigint-buffer2: Native bindings are not available in browser environments.");
}

export function isNativeAvailable(): boolean {
  return false;
}

export function isNativeLoaded(): boolean {
  return false;
}
