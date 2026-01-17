/**
 * Tests for the pure JS implementation.
 * These tests import directly from the /js subpath.
 */

import { describe, it, expect } from 'vitest';
import {
  toBigIntBE,
  toBigIntLE,
  toBufferBE,
  toBufferLE,
  toBufferBEInto,
  toBufferLEInto,
  fallback,
} from '../../src/fallback.js';

describe('JS Implementation', () => {
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

    it('should handle large values', () => {
      const buffer = new Uint8Array(32);
      buffer.fill(0xff);
      const result = toBigIntBE(buffer);
      expect(result).toBe((1n << 256n) - 1n);
    });
  });

  describe('toBigIntLE', () => {
    it('should convert little-endian buffer to BigInt', () => {
      const buffer = new Uint8Array([0x04, 0x03, 0x02, 0x01]);
      expect(toBigIntLE(buffer)).toBe(0x01020304n);
    });

    it('should handle empty buffer', () => {
      expect(toBigIntLE(new Uint8Array(0))).toBe(0n);
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

    it('should pad with zeros', () => {
      const result = toBufferBE(0x01n, 4);
      expect(Array.from(result)).toEqual([0x00, 0x00, 0x00, 0x01]);
    });

    it('should truncate if value exceeds width', () => {
      const result = toBufferBE(0x123456n, 2);
      expect(Array.from(result)).toEqual([0x34, 0x56]);
    });

    it('should handle negative numbers (twos complement)', () => {
      const result = toBufferBE(-1n, 4);
      expect(Array.from(result)).toEqual([0xff, 0xff, 0xff, 0xff]);
    });
  });

  describe('toBufferLE', () => {
    it('should convert BigInt to little-endian buffer', () => {
      const result = toBufferLE(0x01020304n, 4);
      expect(Array.from(result)).toEqual([0x04, 0x03, 0x02, 0x01]);
    });

    it('should handle width 0', () => {
      const result = toBufferLE(123n, 0);
      expect(result.length).toBe(0);
    });
  });

  describe('toBufferBEInto', () => {
    it('should write into pre-allocated buffer', () => {
      const buffer = new Uint8Array(4);
      toBufferBEInto(0x01020304n, buffer);
      expect(Array.from(buffer)).toEqual([0x01, 0x02, 0x03, 0x04]);
    });
  });

  describe('toBufferLEInto', () => {
    it('should write into pre-allocated buffer', () => {
      const buffer = new Uint8Array(4);
      toBufferLEInto(0x01020304n, buffer);
      expect(Array.from(buffer)).toEqual([0x04, 0x03, 0x02, 0x01]);
    });
  });

  describe('Round-trip consistency', () => {
    const sizes = [1, 2, 4, 8, 16, 32, 64];

    for (const size of sizes) {
      it(`should round-trip ${size}-byte values (BE)`, () => {
        const value = (1n << BigInt(size * 8 - 1)) - 1n; // Max positive for size
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

  describe('fallback object export', () => {
    it('should export fallback object with all methods', () => {
      expect(fallback).toBeDefined();
      expect(typeof fallback.toBigIntBE).toBe('function');
      expect(typeof fallback.toBigIntLE).toBe('function');
      expect(typeof fallback.toBufferBE).toBe('function');
      expect(typeof fallback.toBufferLE).toBe('function');
      expect(typeof fallback.toBufferBEInto).toBe('function');
      expect(typeof fallback.toBufferLEInto).toBe('function');
    });
  });
});
