/**
 * Parity tests for bigint-buffer2.
 *
 * Tests that verify all implementations (native, wasm, fallback) produce identical results.
 */

import { describe, it, expect } from 'vitest';
import { fallback } from '../src/fallback.js';
import { toBigIntBE, toBigIntLE, toBufferBE, toBufferLE, getImplementation } from '../src/index.js';

/**
 * Generate a random BigInt with specified bit length.
 */
function randomBigInt(bits: number): bigint {
  let result = 0n;
  for (let i = 0; i < bits; i += 32) {
    result = (result << 32n) | BigInt(Math.floor(Math.random() * 0x100000000));
  }
  // Mask to exact bit length
  return result & ((1n << BigInt(bits)) - 1n);
}

/**
 * Generate a random Uint8Array with specified length.
 */
function randomBuffer(length: number): Uint8Array {
  const arr = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    arr[i] = Math.floor(Math.random() * 256);
  }
  return arr;
}

describe('Implementation parity', () => {
  // Note: In tests, we may only have fallback available depending on build state.
  // These tests verify that the main exports match the fallback exactly.

  const testValues = [
    { name: 'zero', value: 0n, width: 8 },
    { name: 'one', value: 1n, width: 1 },
    { name: 'small', value: 255n, width: 1 },
    { name: 'medium', value: 0x123456789abcdefn, width: 8 },
    { name: 'large', value: (1n << 128n) - 1n, width: 16 },
    { name: 'max 256-bit', value: (1n << 256n) - 1n, width: 32 },
  ];

  describe('toBigIntBE consistency', () => {
    for (const { name, value, width } of testValues) {
      it(`should match fallback for ${name}`, () => {
        const buffer = fallback.toBufferBE(value, width);
        const mainResult = toBigIntBE(buffer);
        const fallbackResult = fallback.toBigIntBE(buffer);
        expect(mainResult).toBe(fallbackResult);
      });
    }
  });

  describe('toBigIntLE consistency', () => {
    for (const { name, value, width } of testValues) {
      it(`should match fallback for ${name}`, () => {
        const buffer = fallback.toBufferLE(value, width);
        const mainResult = toBigIntLE(buffer);
        const fallbackResult = fallback.toBigIntLE(buffer);
        expect(mainResult).toBe(fallbackResult);
      });
    }
  });

  describe('toBufferBE consistency', () => {
    for (const { name, value, width } of testValues) {
      it(`should match fallback for ${name}`, () => {
        const mainResult = toBufferBE(value, width);
        const fallbackResult = fallback.toBufferBE(value, width);
        expect(Array.from(mainResult)).toEqual(Array.from(fallbackResult));
      });
    }
  });

  describe('toBufferLE consistency', () => {
    for (const { name, value, width } of testValues) {
      it(`should match fallback for ${name}`, () => {
        const mainResult = toBufferLE(value, width);
        const fallbackResult = fallback.toBufferLE(value, width);
        expect(Array.from(mainResult)).toEqual(Array.from(fallbackResult));
      });
    }
  });
});

describe('Random value parity', () => {
  const sizes = [1, 2, 4, 8, 16, 32, 64];

  for (const size of sizes) {
    describe(`${size}-byte values`, () => {
      it('should produce consistent BE round-trip results', () => {
        for (let i = 0; i < 10; i++) {
          const value = randomBigInt(size * 8);
          const mainBuffer = toBufferBE(value, size);
          const fallbackBuffer = fallback.toBufferBE(value, size);

          expect(Array.from(mainBuffer)).toEqual(Array.from(fallbackBuffer));

          const mainRecovered = toBigIntBE(mainBuffer);
          const fallbackRecovered = fallback.toBigIntBE(fallbackBuffer);

          expect(mainRecovered).toBe(fallbackRecovered);
        }
      });

      it('should produce consistent LE round-trip results', () => {
        for (let i = 0; i < 10; i++) {
          const value = randomBigInt(size * 8);
          const mainBuffer = toBufferLE(value, size);
          const fallbackBuffer = fallback.toBufferLE(value, size);

          expect(Array.from(mainBuffer)).toEqual(Array.from(fallbackBuffer));

          const mainRecovered = toBigIntLE(mainBuffer);
          const fallbackRecovered = fallback.toBigIntLE(fallbackBuffer);

          expect(mainRecovered).toBe(fallbackRecovered);
        }
      });

      it('should produce consistent buffer-to-bigint results', () => {
        for (let i = 0; i < 10; i++) {
          const buffer = randomBuffer(size);

          const mainBE = toBigIntBE(buffer);
          const fallbackBE = fallback.toBigIntBE(buffer);
          expect(mainBE).toBe(fallbackBE);

          const mainLE = toBigIntLE(buffer);
          const fallbackLE = fallback.toBigIntLE(buffer);
          expect(mainLE).toBe(fallbackLE);
        }
      });
    });
  }
});

describe('Implementation detection', () => {
  it('should return a valid implementation type', () => {
    const impl = getImplementation();
    expect(['native', 'wasm', 'js']).toContain(impl);
  });
});

describe('Cross-endianness consistency', () => {
  it('should have BE and LE produce opposite byte orders', () => {
    const value = 0x0102030405060708n;
    const be = toBufferBE(value, 8);
    const le = toBufferLE(value, 8);

    // BE and LE should be reverses of each other
    const beReversed = Array.from(be).reverse();
    expect(beReversed).toEqual(Array.from(le));
  });

  it('should have toBigIntBE and toBigIntLE be inverses', () => {
    const buffer = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
    const reversed = new Uint8Array(buffer).reverse();

    const beValue = toBigIntBE(buffer);
    const leValue = toBigIntLE(reversed);

    expect(beValue).toBe(leValue);
  });
});
