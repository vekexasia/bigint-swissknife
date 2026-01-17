/**
 * Performance benchmarks for bigint-buffer2.
 *
 * Compares performance against the original bigint-buffer library.
 */

import { bench, describe, beforeAll } from 'vitest';

// Import bigint-buffer2 implementations
import { fallback as bigintBuffer2Fallback } from '../../src/fallback.js';
import { toBigIntBE, toBufferBE, toBufferBEInto, getImplementation, initNative } from '../../src/index.js';

// Import native bindings directly for overhead testing
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const native = require('../../index.linux-x64-gnu.node') as {
  bigintNoop(num: bigint): void;
  bufferNoop(buffer: Buffer): void;
  uint8ArrayNoop(buffer: Buffer): void;
  bothNoop(num: bigint, buffer: Buffer): void;
  bothSliceNoop(num: bigint, buffer: Buffer): void;
  toBufferBeFast(num: bigint, buffer: Buffer): void;
};

// Try to import original bigint-buffer for comparison
let bigintBuffer: typeof import('bigint-buffer') | null = null;
try {
  bigintBuffer = await import('bigint-buffer');
} catch {
  console.log('bigint-buffer not available for comparison benchmarks');
}

// Initialize native before running benchmarks
await initNative();

// Verify we're using native
const impl = getImplementation();
if (impl !== 'native') {
  throw new Error(`Expected native implementation but got: ${impl}. Native bindings must be loaded for accurate benchmarks.`);
}

/**
 * Generate a random BigInt with specified bit length.
 */
function randomBigInt(bits: number): bigint {
  let result = 0n;
  for (let i = 0; i < bits; i += 32) {
    result = (result << 32n) | BigInt(Math.floor(Math.random() * 0x100000000));
  }
  return result & ((1n << BigInt(bits)) - 1n);
}

/**
 * Generate a random Buffer/Uint8Array with specified length.
 */
function randomBuffer(length: number): Buffer {
  const arr = Buffer.alloc(length);
  for (let i = 0; i < length; i++) {
    arr[i] = Math.floor(Math.random() * 256);
  }
  return arr;
}

// Only test 32 bytes for now
const size = 32;

// Pre-generate test data for consistent benchmarks
const buffers: Buffer[] = [];
const values: bigint[] = [];

// Pre-allocate buffers for _into tests
const preallocatedBuffers: Buffer[] = [];

beforeAll(() => {
  console.log(`\n✓ Using implementation: ${getImplementation()}`);
  console.log('Generating test data...\n');

  for (let i = 0; i < 100; i++) {
    buffers.push(randomBuffer(size));
    values.push(randomBigInt(size * 8));
    preallocatedBuffers.push(Buffer.alloc(size));
  }
});

describe('toBigIntBE (32B)', () => {
  if (bigintBuffer) {
    bench('bigint-buffer', () => {
      for (const buf of buffers) {
        bigintBuffer!.toBigIntBE(buf);
      }
    });
  }

  bench('bigint-buffer2 native', () => {
    for (const buf of buffers) {
      toBigIntBE(buf);
    }
  });

  bench('bigint-buffer2 fallback', () => {
    for (const buf of buffers) {
      bigintBuffer2Fallback.toBigIntBE(buf);
    }
  });
});

describe('toBufferBE (32B)', () => {
  if (bigintBuffer) {
    bench('bigint-buffer', () => {
      for (const value of values) {
        bigintBuffer!.toBufferBE(value, size);
      }
    });
  }

  bench('bigint-buffer2 native (alloc)', () => {
    for (const value of values) {
      toBufferBE(value, size);
    }
  });

  bench('bigint-buffer2 native (into)', () => {
    for (let i = 0; i < values.length; i++) {
      toBufferBEInto(values[i], preallocatedBuffers[i]);
    }
  });

  bench('bigint-buffer2 native (fast)', () => {
    for (let i = 0; i < values.length; i++) {
      native.toBufferBeFast(values[i], preallocatedBuffers[i]);
    }
  });

  bench('bigint-buffer2 fallback', () => {
    for (const value of values) {
      bigintBuffer2Fallback.toBufferBE(value, size);
    }
  });
});

describe('napi overhead (32B)', () => {
  bench('BigInt param (noop)', () => {
    for (const value of values) {
      native.bigintNoop(value);
    }
  });

  bench('&[u8] slice param (noop)', () => {
    for (const buf of buffers) {
      native.bufferNoop(buf);
    }
  });

  bench('Uint8Array param (noop)', () => {
    for (const buf of preallocatedBuffers) {
      native.uint8ArrayNoop(buf);
    }
  });

  bench('BigInt + Uint8Array (noop)', () => {
    for (let i = 0; i < values.length; i++) {
      native.bothNoop(values[i], preallocatedBuffers[i]);
    }
  });

  bench('BigInt + &[u8] slice (noop)', () => {
    for (let i = 0; i < values.length; i++) {
      native.bothSliceNoop(values[i], preallocatedBuffers[i]);
    }
  });
});
