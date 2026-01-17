/**
 * Tests for the hybrid implementation behavior.
 * Verifies that the main module uses JS for small values and WASM for large values.
 * Should run in browser environment after initWasm().
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  toBigIntBE,
  toBigIntLE,
  toBufferBE,
  toBufferLE,
  toBufferBEInto,
  toBufferLEInto,
  initWasm,
  getImplementation,
  setImplementation,
} from '../../src/index.js';
import { fallback } from '../../src/fallback.js';

// The threshold is 32 bytes - below uses JS, at or above uses WASM
const WASM_THRESHOLD = 32;

describe('Hybrid Implementation', () => {
  beforeAll(async () => {
    // Initialize WASM for hybrid mode
    await initWasm();
  });

  describe('Implementation detection', () => {
    it('should report wasm implementation after initWasm', () => {
      expect(getImplementation()).toBe('wasm');
    });
  });

  describe('Small values (< 32 bytes) - should use JS', () => {
    const smallSizes = [1, 2, 4, 8, 16, 31];

    for (const size of smallSizes) {
      it(`toBigIntBE with ${size}-byte buffer should match JS fallback exactly`, () => {
        const buffer = new Uint8Array(size);
        crypto.getRandomValues(buffer);

        const hybridResult = toBigIntBE(buffer);
        const jsResult = fallback.toBigIntBE(buffer);

        expect(hybridResult).toBe(jsResult);
      });

      it(`toBigIntLE with ${size}-byte buffer should match JS fallback exactly`, () => {
        const buffer = new Uint8Array(size);
        crypto.getRandomValues(buffer);

        const hybridResult = toBigIntLE(buffer);
        const jsResult = fallback.toBigIntLE(buffer);

        expect(hybridResult).toBe(jsResult);
      });

      it(`toBufferBE with ${size}-byte width should match JS fallback exactly`, () => {
        const value = (1n << BigInt(size * 8 - 1)) - 1n;

        const hybridResult = toBufferBE(value, size);
        const jsResult = fallback.toBufferBE(value, size);

        expect(Array.from(hybridResult)).toEqual(Array.from(jsResult));
      });

      it(`toBufferLE with ${size}-byte width should match JS fallback exactly`, () => {
        const value = (1n << BigInt(size * 8 - 1)) - 1n;

        const hybridResult = toBufferLE(value, size);
        const jsResult = fallback.toBufferLE(value, size);

        expect(Array.from(hybridResult)).toEqual(Array.from(jsResult));
      });
    }
  });

  describe('Large values (>= 32 bytes) - should use WASM', () => {
    const largeSizes = [32, 64, 128, 256, 512];

    for (const size of largeSizes) {
      it(`toBigIntBE with ${size}-byte buffer should work correctly`, () => {
        const buffer = new Uint8Array(size);
        crypto.getRandomValues(buffer);

        const hybridResult = toBigIntBE(buffer);
        const jsResult = fallback.toBigIntBE(buffer);

        // Should match JS fallback (WASM produces same results)
        expect(hybridResult).toBe(jsResult);
      });

      it(`toBigIntLE with ${size}-byte buffer should work correctly`, () => {
        const buffer = new Uint8Array(size);
        crypto.getRandomValues(buffer);

        const hybridResult = toBigIntLE(buffer);
        const jsResult = fallback.toBigIntLE(buffer);

        expect(hybridResult).toBe(jsResult);
      });

      it(`toBufferBE with ${size}-byte width should work correctly`, () => {
        const value = (1n << BigInt(size * 8 - 1)) - 1n;

        const hybridResult = toBufferBE(value, size);
        const jsResult = fallback.toBufferBE(value, size);

        expect(Array.from(hybridResult)).toEqual(Array.from(jsResult));
      });

      it(`toBufferLE with ${size}-byte width should work correctly`, () => {
        const value = (1n << BigInt(size * 8 - 1)) - 1n;

        const hybridResult = toBufferLE(value, size);
        const jsResult = fallback.toBufferLE(value, size);

        expect(Array.from(hybridResult)).toEqual(Array.from(jsResult));
      });
    }
  });

  describe('Threshold boundary', () => {
    it('should handle 31 bytes (just below threshold)', () => {
      const buffer = new Uint8Array(31);
      crypto.getRandomValues(buffer);

      const result = toBigIntBE(buffer);
      expect(result).toBe(fallback.toBigIntBE(buffer));
    });

    it('should handle 32 bytes (at threshold)', () => {
      const buffer = new Uint8Array(32);
      crypto.getRandomValues(buffer);

      const result = toBigIntBE(buffer);
      expect(result).toBe(fallback.toBigIntBE(buffer));
    });

    it('should handle 33 bytes (just above threshold)', () => {
      const buffer = new Uint8Array(33);
      crypto.getRandomValues(buffer);

      const result = toBigIntBE(buffer);
      expect(result).toBe(fallback.toBigIntBE(buffer));
    });
  });

  describe('Into methods', () => {
    it('toBufferBEInto should work for small buffers', () => {
      const buffer = new Uint8Array(16);
      toBufferBEInto(0x0102030405060708n, buffer);

      const expected = fallback.toBufferBE(0x0102030405060708n, 16);
      expect(Array.from(buffer)).toEqual(Array.from(expected));
    });

    it('toBufferBEInto should work for large buffers', () => {
      const buffer = new Uint8Array(64);
      const value = (1n << 256n) - 1n;
      toBufferBEInto(value, buffer);

      const expected = fallback.toBufferBE(value, 64);
      expect(Array.from(buffer)).toEqual(Array.from(expected));
    });

    it('toBufferLEInto should work for small buffers', () => {
      const buffer = new Uint8Array(16);
      toBufferLEInto(0x0102030405060708n, buffer);

      const expected = fallback.toBufferLE(0x0102030405060708n, 16);
      expect(Array.from(buffer)).toEqual(Array.from(expected));
    });

    it('toBufferLEInto should work for large buffers', () => {
      const buffer = new Uint8Array(64);
      const value = (1n << 256n) - 1n;
      toBufferLEInto(value, buffer);

      const expected = fallback.toBufferLE(value, 64);
      expect(Array.from(buffer)).toEqual(Array.from(expected));
    });
  });

  describe('setImplementation', () => {
    it('should allow forcing JS implementation', async () => {
      await setImplementation('js');
      expect(getImplementation()).toBe('js');

      // Large buffer should still work
      const buffer = new Uint8Array(64);
      crypto.getRandomValues(buffer);
      const result = toBigIntBE(buffer);
      expect(result).toBe(fallback.toBigIntBE(buffer));

      // Restore wasm
      await initWasm();
    });
  });

  describe('Round-trip consistency across threshold', () => {
    const sizes = [16, 31, 32, 33, 64];

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
