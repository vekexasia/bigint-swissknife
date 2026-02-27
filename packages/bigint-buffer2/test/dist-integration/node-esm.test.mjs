/**
 * Integration test for ESM build (dist/node.esm.mjs)
 * Run with: node test/dist-integration/node-esm.test.mjs
 */

import assert from 'assert';
import {
  toBigIntBE,
  toBigIntLE,
  toBufferBE,
  toBufferLE,
  toBigIntBESigned,
  toBigIntLESigned,
  toBufferBEInto,
  toBufferLEInto,
  getImplementation,
  initNative,
  fallback,
} from '../../dist/node.esm.mjs';

console.log('Testing ESM build (dist/node.esm.mjs)...\n');

// Test exports exist
assert(typeof toBigIntBE === 'function', 'toBigIntBE should be exported');
assert(typeof toBigIntLE === 'function', 'toBigIntLE should be exported');
assert(typeof toBufferBE === 'function', 'toBufferBE should be exported');
assert(typeof toBufferLE === 'function', 'toBufferLE should be exported');
assert(typeof toBigIntBESigned === 'function', 'toBigIntBESigned should be exported');
assert(typeof toBigIntLESigned === 'function', 'toBigIntLESigned should be exported');
assert(typeof toBufferBEInto === 'function', 'toBufferBEInto should be exported');
assert(typeof toBufferLEInto === 'function', 'toBufferLEInto should be exported');
assert(typeof getImplementation === 'function', 'getImplementation should be exported');
assert(typeof initNative === 'function', 'initNative should be exported (deprecated)');
assert(typeof fallback === 'object', 'fallback should be exported');
console.log('✓ All exports present');

// Test implementation detection
const impl = getImplementation();
assert(impl === 'native' || impl === 'js', `Implementation should be 'native' or 'js', got: ${impl}`);
console.log(`✓ Implementation: ${impl}`);

// Test basic conversion - toBigIntBE
const bufferBE = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
const numBE = toBigIntBE(bufferBE);
assert(numBE === 16909060n, `toBigIntBE failed: expected 16909060n, got ${numBE}`);
console.log('✓ toBigIntBE works');

// Test basic conversion - toBigIntLE
const bufferLE = new Uint8Array([0x04, 0x03, 0x02, 0x01]);
const numLE = toBigIntLE(bufferLE);
assert(numLE === 16909060n, `toBigIntLE failed: expected 16909060n, got ${numLE}`);
console.log('✓ toBigIntLE works');

// Test basic conversion - toBufferBE
const resultBE = toBufferBE(16909060n, 4);
assert(resultBE.length === 4, 'toBufferBE length check failed');
assert(resultBE[0] === 0x01 && resultBE[1] === 0x02 && resultBE[2] === 0x03 && resultBE[3] === 0x04, 'toBufferBE content check failed');
console.log('✓ toBufferBE works');

// Test basic conversion - toBufferLE
const resultLE = toBufferLE(16909060n, 4);
assert(resultLE.length === 4, 'toBufferLE length check failed');
assert(resultLE[0] === 0x04 && resultLE[1] === 0x03 && resultLE[2] === 0x02 && resultLE[3] === 0x01, 'toBufferLE content check failed');
console.log('✓ toBufferLE works');

// Test signed conversion
const signedBuf = new Uint8Array([0xff, 0xff]);
const signedNum = toBigIntBESigned(signedBuf);
assert(signedNum === -1n, `toBigIntBESigned failed: expected -1n, got ${signedNum}`);
console.log('✓ toBigIntBESigned works');

// Test into functions
const intoBuf = Buffer.alloc(4);
toBufferBEInto(16909060n, intoBuf);
assert(intoBuf[0] === 0x01 && intoBuf[1] === 0x02 && intoBuf[2] === 0x03 && intoBuf[3] === 0x04, 'toBufferBEInto failed');
console.log('✓ toBufferBEInto works');

// Test fallback export
assert(typeof fallback.toBigIntBE === 'function', 'fallback.toBigIntBE should exist');
const fallbackResult = fallback.toBigIntBE(bufferBE);
assert(fallbackResult === 16909060n, 'fallback.toBigIntBE failed');
console.log('✓ fallback export works');

// Test that initNative returns immediately (deprecated but should work)
await initNative();
console.log('✓ initNative (deprecated) works');

console.log('\n✅ ESM build tests passed!');
