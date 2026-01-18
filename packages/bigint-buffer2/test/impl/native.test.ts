/**
 * Tests for the native Rust implementation.
 * These tests import directly from the /native subpath.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  toBigIntBE,
  toBigIntLE,
  toBufferBE,
  toBufferLE,
  toBufferBEInto,
  toBufferLEInto,
  loadingPromise,
  isNativeLoaded,
  getNative,
  isNativeAvailable,
} from '../../src/native/index.js';
import { fallback } from '../../src/fallback.js';
import { BELEs, LargeValues, hexToBytes, bytesToHex } from '../fixtures/intcases.js';

describe('Native Implementation', () => {
  beforeAll(async () => {
    // Wait for native bindings to load
    await loadingPromise;
  });

  describe('Native loading', () => {
    it('should load native bindings', async () => {
      const available = await isNativeAvailable();
      expect(available).toBe(true);
    });

    it('should report native as loaded', () => {
      expect(isNativeLoaded()).toBe(true);
    });

    it('should get native implementation', async () => {
      const native = await getNative();
      expect(native).toBeDefined();
      expect(typeof native.toBigIntBE).toBe('function');
    });
  });

  describe('toBigIntBE', () => {
    it('should convert big-endian buffer to BigInt', () => {
      const buffer = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
      expect(toBigIntBE(buffer)).toBe(0x01020304n);
    });

    it('should handle empty buffer', () => {
      expect(toBigIntBE(new Uint8Array(0))).toBe(0n);
    });

    it('should handle all-zero buffer', () => {
      expect(toBigIntBE(new Uint8Array([0, 0, 0, 0]))).toBe(0n);
    });

    it('should handle large values (256-bit)', () => {
      const buffer = new Uint8Array(32);
      buffer.fill(0xff);
      const result = toBigIntBE(buffer);
      expect(result).toBe((1n << 256n) - 1n);
    });

    it('should match JS fallback for random values', () => {
      for (let i = 0; i < 100; i++) {
        const size = Math.floor(Math.random() * 64) + 1;
        const buffer = new Uint8Array(size);
        crypto.getRandomValues(buffer);

        const nativeResult = toBigIntBE(buffer);
        const jsResult = fallback.toBigIntBE(buffer);
        expect(nativeResult).toBe(jsResult);
      }
    });
  });

  describe('toBigIntLE', () => {
    it('should convert little-endian buffer to BigInt', () => {
      const buffer = new Uint8Array([0x04, 0x03, 0x02, 0x01]);
      expect(toBigIntLE(buffer)).toBe(0x01020304n);
    });

    it('should match JS fallback for random values', () => {
      for (let i = 0; i < 100; i++) {
        const size = Math.floor(Math.random() * 64) + 1;
        const buffer = new Uint8Array(size);
        crypto.getRandomValues(buffer);

        const nativeResult = toBigIntLE(buffer);
        const jsResult = fallback.toBigIntLE(buffer);
        expect(nativeResult).toBe(jsResult);
      }
    });
  });

  describe('toBufferBE', () => {
    it('should convert BigInt to big-endian buffer', () => {
      const result = toBufferBE(0x01020304n, 4);
      expect(Array.from(result)).toEqual([0x01, 0x02, 0x03, 0x04]);
    });

    it('should handle width 0', () => {
      const result = toBufferBE(123n, 0);
      expect(result.length).toBe(0);
    });

    it('should handle negative numbers (twos complement)', () => {
      const result = toBufferBE(-1n, 4);
      expect(Array.from(result)).toEqual([0xff, 0xff, 0xff, 0xff]);
    });

    it('should match JS fallback for random values', () => {
      for (let i = 0; i < 100; i++) {
        const bits = Math.floor(Math.random() * 256) + 1;
        const width = Math.ceil(bits / 8);
        const value = BigInt('0x' + [...Array(width * 2)].map(() =>
          Math.floor(Math.random() * 16).toString(16)).join(''));

        const nativeResult = toBufferBE(value, width);
        const jsResult = fallback.toBufferBE(value, width);
        expect(Array.from(nativeResult)).toEqual(Array.from(jsResult));
      }
    });
  });

  describe('toBufferLE', () => {
    it('should convert BigInt to little-endian buffer', () => {
      const result = toBufferLE(0x01020304n, 4);
      expect(Array.from(result)).toEqual([0x04, 0x03, 0x02, 0x01]);
    });

    it('should match JS fallback for random values', () => {
      for (let i = 0; i < 100; i++) {
        const bits = Math.floor(Math.random() * 256) + 1;
        const width = Math.ceil(bits / 8);
        const value = BigInt('0x' + [...Array(width * 2)].map(() =>
          Math.floor(Math.random() * 16).toString(16)).join(''));

        const nativeResult = toBufferLE(value, width);
        const jsResult = fallback.toBufferLE(value, width);
        expect(Array.from(nativeResult)).toEqual(Array.from(jsResult));
      }
    });
  });

  describe('toBufferBEInto', () => {
    it('should write into pre-allocated buffer', () => {
      const buffer = Buffer.alloc(4);
      toBufferBEInto(0x01020304n, buffer);
      expect(Array.from(buffer)).toEqual([0x01, 0x02, 0x03, 0x04]);
    });

    it('should work with Uint8Array', () => {
      const buffer = new Uint8Array(4);
      toBufferBEInto(0x01020304n, buffer);
      expect(Array.from(buffer)).toEqual([0x01, 0x02, 0x03, 0x04]);
    });
  });

  describe('toBufferLEInto', () => {
    it('should write into pre-allocated buffer', () => {
      const buffer = Buffer.alloc(4);
      toBufferLEInto(0x01020304n, buffer);
      expect(Array.from(buffer)).toEqual([0x04, 0x03, 0x02, 0x01]);
    });
  });

  describe('Fixture-based tests (BELEs)', () => {
    const beCases = BELEs.filter(c => c.type === 'be');
    const leCases = BELEs.filter(c => c.type === 'le');

    describe('toBufferBE with fixtures', () => {
      for (const { num, bytes, expect: expectedHex } of beCases) {
        it(`should encode ${num}n to ${expectedHex} (${bytes} bytes)`, () => {
          const result = toBufferBE(num, bytes);
          expect(bytesToHex(new Uint8Array(result))).toBe(expectedHex);
        });
      }
    });

    describe('toBufferLE with fixtures', () => {
      for (const { num, bytes, expect: expectedHex } of leCases) {
        it(`should encode ${num}n to ${expectedHex} (${bytes} bytes)`, () => {
          const result = toBufferLE(num, bytes);
          expect(bytesToHex(new Uint8Array(result))).toBe(expectedHex);
        });
      }
    });

    describe('toBigIntBE with fixtures (unsigned interpretation)', () => {
      for (const { num, expect: expectedHex } of beCases) {
        // Only test positive values for unsigned conversion
        if (num >= 0n) {
          it(`should decode ${expectedHex} to ${num}n`, () => {
            const buffer = hexToBytes(expectedHex);
            const result = toBigIntBE(buffer);
            expect(result).toBe(num);
          });
        }
      }
    });

    describe('toBigIntLE with fixtures (unsigned interpretation)', () => {
      for (const { num, expect: expectedHex } of leCases) {
        if (num >= 0n) {
          it(`should decode ${expectedHex} to ${num}n`, () => {
            const buffer = hexToBytes(expectedHex);
            const result = toBigIntLE(buffer);
            expect(result).toBe(num);
          });
        }
      }
    });
  });

  describe('Large value tests', () => {
    for (const { num, bytes } of LargeValues) {
      it(`should round-trip ${bytes}-byte value (BE)`, () => {
        const buffer = toBufferBE(num, bytes);
        // For negative numbers, we can't do unsigned round-trip
        if (num >= 0n) {
          const recovered = toBigIntBE(buffer);
          expect(recovered).toBe(num);
        }
        // But we can verify it matches JS fallback
        const jsBuffer = fallback.toBufferBE(num, bytes);
        expect(Array.from(buffer)).toEqual(Array.from(jsBuffer));
      });

      it(`should round-trip ${bytes}-byte value (LE)`, () => {
        const buffer = toBufferLE(num, bytes);
        if (num >= 0n) {
          const recovered = toBigIntLE(buffer);
          expect(recovered).toBe(num);
        }
        const jsBuffer = fallback.toBufferLE(num, bytes);
        expect(Array.from(buffer)).toEqual(Array.from(jsBuffer));
      });
    }
  });

  describe('Round-trip consistency', () => {
    const sizes = [1, 2, 4, 8, 16, 32, 64, 128];

    for (const size of sizes) {
      it(`should round-trip ${size}-byte values (BE)`, () => {
        const value = (1n << BigInt(size * 8 - 1)) - 1n;
        const buffer = toBufferBE(value, size);
        const recovered = toBigIntBE(buffer);
        expect(recovered).toBe(value);
      });

      it(`should round-trip ${size}-byte values (LE)`, () => {
        const value = (1n << BigInt(size * 8 - 1)) - 1n;
        const buffer = toBufferLE(value, size);
        const recovered = toBigIntLE(buffer);
        expect(recovered).toBe(value);
      });
    }
  });
});
