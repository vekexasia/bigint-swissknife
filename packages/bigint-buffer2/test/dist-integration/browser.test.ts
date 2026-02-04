/**
 * Integration test for browser build (dist/browser.esm.mjs)
 * Run with: npx vitest run test/dist-integration/browser.test.ts --project=buffer2-browser-js
 */

import { describe, it, expect } from 'vitest';

// Import from browser build
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
} from '../../dist/browser.esm.mjs';

describe('Browser build (dist/browser.esm.mjs)', () => {
  describe('exports', () => {
    it('should export all functions', () => {
      expect(typeof toBigIntBE).toBe('function');
      expect(typeof toBigIntLE).toBe('function');
      expect(typeof toBufferBE).toBe('function');
      expect(typeof toBufferLE).toBe('function');
      expect(typeof toBigIntBESigned).toBe('function');
      expect(typeof toBigIntLESigned).toBe('function');
      expect(typeof toBufferBEInto).toBe('function');
      expect(typeof toBufferLEInto).toBe('function');
      expect(typeof getImplementation).toBe('function');
      expect(typeof initNative).toBe('function');
      expect(typeof fallback).toBe('object');
    });

    it('should use JS implementation in browser', () => {
      const impl = getImplementation();
      expect(impl).toBe('js');
    });
  });

  describe('toBigIntBE', () => {
    it('should convert big-endian buffer to BigInt', () => {
      const buffer = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
      expect(toBigIntBE(buffer)).toBe(16909060n);
    });

    it('should handle zero', () => {
      const buffer = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
      expect(toBigIntBE(buffer)).toBe(0n);
    });

    it('should handle empty buffer', () => {
      const buffer = new Uint8Array([]);
      expect(toBigIntBE(buffer)).toBe(0n);
    });
  });

  describe('toBigIntLE', () => {
    it('should convert little-endian buffer to BigInt', () => {
      const buffer = new Uint8Array([0x04, 0x03, 0x02, 0x01]);
      expect(toBigIntLE(buffer)).toBe(16909060n);
    });
  });

  describe('toBufferBE', () => {
    it('should convert BigInt to big-endian buffer', () => {
      const result = toBufferBE(16909060n, 4);
      expect(result).toEqual(new Uint8Array([0x01, 0x02, 0x03, 0x04]));
    });

    it('should pad with zeros', () => {
      const result = toBufferBE(1n, 4);
      expect(result).toEqual(new Uint8Array([0x00, 0x00, 0x00, 0x01]));
    });
  });

  describe('toBufferLE', () => {
    it('should convert BigInt to little-endian buffer', () => {
      const result = toBufferLE(16909060n, 4);
      expect(result).toEqual(new Uint8Array([0x04, 0x03, 0x02, 0x01]));
    });
  });

  describe('signed conversions', () => {
    it('should handle negative numbers (BE)', () => {
      const buffer = new Uint8Array([0xff, 0xff]);
      expect(toBigIntBESigned(buffer)).toBe(-1n);
    });

    it('should handle negative numbers (LE)', () => {
      const buffer = new Uint8Array([0xff, 0xff]);
      expect(toBigIntLESigned(buffer)).toBe(-1n);
    });

    it('should handle positive numbers', () => {
      const buffer = new Uint8Array([0x7f, 0xff]);
      expect(toBigIntBESigned(buffer)).toBe(32767n);
    });
  });

  describe('into functions', () => {
    it('should write into provided buffer (BE)', () => {
      const buffer = new Uint8Array(4);
      toBufferBEInto(16909060n, buffer);
      expect(buffer).toEqual(new Uint8Array([0x01, 0x02, 0x03, 0x04]));
    });

    it('should write into provided buffer (LE)', () => {
      const buffer = new Uint8Array(4);
      toBufferLEInto(16909060n, buffer);
      expect(buffer).toEqual(new Uint8Array([0x04, 0x03, 0x02, 0x01]));
    });
  });

  describe('fallback', () => {
    it('should provide fallback implementation', () => {
      expect(typeof fallback.toBigIntBE).toBe('function');
      const buffer = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
      expect(fallback.toBigIntBE(buffer)).toBe(16909060n);
    });
  });

  describe('initNative (deprecated)', () => {
    it('should return a promise that resolves', async () => {
      await expect(initNative()).resolves.toBeUndefined();
    });
  });
});
