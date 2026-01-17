/**
 * Performance benchmarks for bigint-buffer2.
 *
 * Compares performance against the original bigint-buffer library.
 */

import { bench, describe, beforeAll } from 'vitest';

// Import bigint-buffer2 implementations
import { fallback as bigintBuffer2Fallback } from '../../src/fallback.js';
import {
  toBigIntBE,
  toBigIntLE,
  toBufferBE,
  toBufferLE,
  toBufferBEInto,
  toBufferLEInto,
  getImplementation,
  initNative,
} from '../../src/index.js';

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

// Test sizes: 8, 16, 24, 32, 48, 64, 128 bytes
const sizes = [8, 16, 24, 32, 48, 64, 128];

// Pre-generate test data for consistent benchmarks
const testData: Record<number, {
  buffers: Buffer[];
  values: bigint[];
  preallocatedBuffers: Buffer[];
}> = {};

beforeAll(() => {
  console.log(`\n✓ Using implementation: ${getImplementation()}`);
  console.log('Generating test data...\n');

  for (const size of sizes) {
    testData[size] = {
      buffers: [],
      values: [],
      preallocatedBuffers: [],
    };
    for (let i = 0; i < 100; i++) {
      testData[size].buffers.push(randomBuffer(size));
      testData[size].values.push(randomBigInt(size * 8));
      testData[size].preallocatedBuffers.push(Buffer.alloc(size));
    }
  }
});

// Generate benchmarks for each size
for (const size of sizes) {
  // ==================== toBigIntBE ====================
  describe(`toBigIntBE (${size}B)`, () => {
    if (bigintBuffer) {
      bench('bigint-buffer', () => {
        for (const buf of testData[size].buffers) {
          bigintBuffer!.toBigIntBE(buf);
        }
      });
    }

    bench('bigint-buffer2 native', () => {
      for (const buf of testData[size].buffers) {
        toBigIntBE(buf);
      }
    });

    bench('bigint-buffer2 fallback', () => {
      for (const buf of testData[size].buffers) {
        bigintBuffer2Fallback.toBigIntBE(buf);
      }
    });
  });

  // ==================== toBigIntLE ====================
  describe(`toBigIntLE (${size}B)`, () => {
    if (bigintBuffer) {
      bench('bigint-buffer', () => {
        for (const buf of testData[size].buffers) {
          bigintBuffer!.toBigIntLE(buf);
        }
      });
    }

    bench('bigint-buffer2 native', () => {
      for (const buf of testData[size].buffers) {
        toBigIntLE(buf);
      }
    });

    bench('bigint-buffer2 fallback', () => {
      for (const buf of testData[size].buffers) {
        bigintBuffer2Fallback.toBigIntLE(buf);
      }
    });
  });

  // ==================== toBufferBE ====================
  describe(`toBufferBE (${size}B)`, () => {
    if (bigintBuffer) {
      bench('bigint-buffer', () => {
        for (const value of testData[size].values) {
          bigintBuffer!.toBufferBE(value, size);
        }
      });
    }

    bench('bigint-buffer2 native', () => {
      for (const value of testData[size].values) {
        toBufferBE(value, size);
      }
    });

    bench('bigint-buffer2 fallback', () => {
      for (const value of testData[size].values) {
        bigintBuffer2Fallback.toBufferBE(value, size);
      }
    });
  });

  // ==================== toBufferLE ====================
  describe(`toBufferLE (${size}B)`, () => {
    if (bigintBuffer) {
      bench('bigint-buffer', () => {
        for (const value of testData[size].values) {
          bigintBuffer!.toBufferLE(value, size);
        }
      });
    }

    bench('bigint-buffer2 native', () => {
      for (const value of testData[size].values) {
        toBufferLE(value, size);
      }
    });

    bench('bigint-buffer2 fallback', () => {
      for (const value of testData[size].values) {
        bigintBuffer2Fallback.toBufferLE(value, size);
      }
    });
  });

  // ==================== toBufferBEInto ====================
  describe(`toBufferBEInto (${size}B) - vs bigint-buffer`, () => {
    if (bigintBuffer) {
      bench('bigint-buffer', () => {
        for (const value of testData[size].values) {
          bigintBuffer!.toBufferBE(value, size);
        }
      });
    }

    bench('bigint-buffer2 native (into)', () => {
      for (let i = 0; i < testData[size].values.length; i++) {
        toBufferBEInto(testData[size].values[i], testData[size].preallocatedBuffers[i]);
      }
    });
  });

  // ==================== toBufferLEInto ====================
  describe(`toBufferLEInto (${size}B) - vs bigint-buffer`, () => {
    if (bigintBuffer) {
      bench('bigint-buffer', () => {
        for (const value of testData[size].values) {
          bigintBuffer!.toBufferLE(value, size);
        }
      });
    }

    bench('bigint-buffer2 native (into)', () => {
      for (let i = 0; i < testData[size].values.length; i++) {
        toBufferLEInto(testData[size].values[i], testData[size].preallocatedBuffers[i]);
      }
    });
  });
}
