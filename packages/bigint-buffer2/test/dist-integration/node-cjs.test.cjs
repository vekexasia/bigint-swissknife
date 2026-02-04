/**
 * Integration test for CJS build (dist/node.cjs.js)
 * Run with: node test/dist-integration/node-cjs.test.cjs
 */

const assert = require('assert');
const path = require('path');

// Import from built CJS file
const lib = require('../../dist/node.cjs.js');

console.log('Testing CJS build (dist/node.cjs.js)...\n');

// Test exports exist
assert(typeof lib.toBigIntBE === 'function', 'toBigIntBE should be exported');
assert(typeof lib.toBigIntLE === 'function', 'toBigIntLE should be exported');
assert(typeof lib.toBufferBE === 'function', 'toBufferBE should be exported');
assert(typeof lib.toBufferLE === 'function', 'toBufferLE should be exported');
assert(typeof lib.toBigIntBESigned === 'function', 'toBigIntBESigned should be exported');
assert(typeof lib.toBigIntLESigned === 'function', 'toBigIntLESigned should be exported');
assert(typeof lib.toBufferBEInto === 'function', 'toBufferBEInto should be exported');
assert(typeof lib.toBufferLEInto === 'function', 'toBufferLEInto should be exported');
assert(typeof lib.getImplementation === 'function', 'getImplementation should be exported');
assert(typeof lib.initNative === 'function', 'initNative should be exported (deprecated)');
assert(typeof lib.fallback === 'object', 'fallback should be exported');
console.log('✓ All exports present');

// Test implementation detection
const impl = lib.getImplementation();
assert(impl === 'native' || impl === 'js', `Implementation should be 'native' or 'js', got: ${impl}`);
console.log(`✓ Implementation: ${impl}`);

// Test basic conversion - toBigIntBE
const bufferBE = Buffer.from([0x01, 0x02, 0x03, 0x04]);
const numBE = lib.toBigIntBE(bufferBE);
assert(numBE === 16909060n, `toBigIntBE failed: expected 16909060n, got ${numBE}`);
console.log('✓ toBigIntBE works');

// Test basic conversion - toBigIntLE
const bufferLE = Buffer.from([0x04, 0x03, 0x02, 0x01]);
const numLE = lib.toBigIntLE(bufferLE);
assert(numLE === 16909060n, `toBigIntLE failed: expected 16909060n, got ${numLE}`);
console.log('✓ toBigIntLE works');

// Test basic conversion - toBufferBE
const resultBE = lib.toBufferBE(16909060n, 4);
assert(Buffer.from(resultBE).equals(bufferBE), 'toBufferBE failed');
console.log('✓ toBufferBE works');

// Test basic conversion - toBufferLE
const resultLE = lib.toBufferLE(16909060n, 4);
assert(Buffer.from(resultLE).equals(bufferLE), 'toBufferLE failed');
console.log('✓ toBufferLE works');

// Test signed conversion
const signedBuf = Buffer.from([0xff, 0xff]);
const signedNum = lib.toBigIntBESigned(signedBuf);
assert(signedNum === -1n, `toBigIntBESigned failed: expected -1n, got ${signedNum}`);
console.log('✓ toBigIntBESigned works');

// Test into functions
const intoBuf = Buffer.alloc(4);
lib.toBufferBEInto(16909060n, intoBuf);
assert(intoBuf.equals(bufferBE), 'toBufferBEInto failed');
console.log('✓ toBufferBEInto works');

// Test fallback export
assert(typeof lib.fallback.toBigIntBE === 'function', 'fallback.toBigIntBE should exist');
const fallbackResult = lib.fallback.toBigIntBE(bufferBE);
assert(fallbackResult === 16909060n, 'fallback.toBigIntBE failed');
console.log('✓ fallback export works');

console.log('\n✅ CJS build tests passed!');
