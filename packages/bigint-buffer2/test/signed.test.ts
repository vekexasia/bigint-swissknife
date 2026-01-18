/**
 * Tests for signed BigInt conversion (two's complement).
 *
 * Tests toBigIntBESigned, toBigIntLESigned and roundtrip with toBufferBE/LE.
 */

import { describe, it, expect } from 'vitest';
import {
  toBigIntBE,
  toBigIntLE,
  toBigIntBESigned,
  toBigIntLESigned,
  toBufferBE,
  toBufferLE,
  fallback,
} from '../src/index.js';

describe('toBigIntBESigned', () => {
  it('should convert empty buffer to 0n', () => {
    expect(toBigIntBESigned(new Uint8Array([]))).toBe(0n);
  });

  it('should return positive for values below midpoint', () => {
    // 0x7f = 127, which is < 128 (midpoint for 1 byte)
    expect(toBigIntBESigned(new Uint8Array([0x7f]))).toBe(127n);
    // 0x00 = 0
    expect(toBigIntBESigned(new Uint8Array([0x00]))).toBe(0n);
    // 0x01 = 1
    expect(toBigIntBESigned(new Uint8Array([0x01]))).toBe(1n);
  });

  it('should return negative for values at or above midpoint', () => {
    // 0x80 = 128, which is >= 128 -> -128
    expect(toBigIntBESigned(new Uint8Array([0x80]))).toBe(-128n);
    // 0xff = 255 -> -1
    expect(toBigIntBESigned(new Uint8Array([0xff]))).toBe(-1n);
    // 0xfe = 254 -> -2
    expect(toBigIntBESigned(new Uint8Array([0xfe]))).toBe(-2n);
  });

  it('should handle 2-byte signed values', () => {
    // 0x7fff = 32767 (max positive i16)
    expect(toBigIntBESigned(new Uint8Array([0x7f, 0xff]))).toBe(32767n);
    // 0x8000 = 32768 -> -32768 (min i16)
    expect(toBigIntBESigned(new Uint8Array([0x80, 0x00]))).toBe(-32768n);
    // 0xffff = 65535 -> -1
    expect(toBigIntBESigned(new Uint8Array([0xff, 0xff]))).toBe(-1n);
  });

  it('should handle 4-byte signed values', () => {
    // 0x7fffffff = 2147483647 (max i32)
    expect(toBigIntBESigned(new Uint8Array([0x7f, 0xff, 0xff, 0xff]))).toBe(2147483647n);
    // 0x80000000 -> -2147483648 (min i32)
    expect(toBigIntBESigned(new Uint8Array([0x80, 0x00, 0x00, 0x00]))).toBe(-2147483648n);
    // 0xffffffff -> -1
    expect(toBigIntBESigned(new Uint8Array([0xff, 0xff, 0xff, 0xff]))).toBe(-1n);
  });

  it('should handle 8-byte signed values', () => {
    // 0x7fffffffffffffff = max i64
    expect(toBigIntBESigned(new Uint8Array([0x7f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]))).toBe(9223372036854775807n);
    // 0x8000000000000000 -> min i64
    expect(toBigIntBESigned(new Uint8Array([0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))).toBe(-9223372036854775808n);
    // 0xffffffffffffffff -> -1
    expect(toBigIntBESigned(new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]))).toBe(-1n);
  });
});

describe('toBigIntLESigned', () => {
  it('should convert empty buffer to 0n', () => {
    expect(toBigIntLESigned(new Uint8Array([]))).toBe(0n);
  });

  it('should return positive for values below midpoint', () => {
    expect(toBigIntLESigned(new Uint8Array([0x7f]))).toBe(127n);
    expect(toBigIntLESigned(new Uint8Array([0x00]))).toBe(0n);
    expect(toBigIntLESigned(new Uint8Array([0x01]))).toBe(1n);
  });

  it('should return negative for values at or above midpoint', () => {
    expect(toBigIntLESigned(new Uint8Array([0x80]))).toBe(-128n);
    expect(toBigIntLESigned(new Uint8Array([0xff]))).toBe(-1n);
    expect(toBigIntLESigned(new Uint8Array([0xfe]))).toBe(-2n);
  });

  it('should handle 2-byte signed values (little-endian)', () => {
    // 0x7fff in LE = [0xff, 0x7f] -> 32767
    expect(toBigIntLESigned(new Uint8Array([0xff, 0x7f]))).toBe(32767n);
    // 0x8000 in LE = [0x00, 0x80] -> -32768
    expect(toBigIntLESigned(new Uint8Array([0x00, 0x80]))).toBe(-32768n);
    // 0xffff in LE = [0xff, 0xff] -> -1
    expect(toBigIntLESigned(new Uint8Array([0xff, 0xff]))).toBe(-1n);
  });

  it('should handle 4-byte signed values (little-endian)', () => {
    // 0x7fffffff in LE = [0xff, 0xff, 0xff, 0x7f] -> max i32
    expect(toBigIntLESigned(new Uint8Array([0xff, 0xff, 0xff, 0x7f]))).toBe(2147483647n);
    // 0x80000000 in LE = [0x00, 0x00, 0x00, 0x80] -> min i32
    expect(toBigIntLESigned(new Uint8Array([0x00, 0x00, 0x00, 0x80]))).toBe(-2147483648n);
    // 0xffffffff in LE -> -1
    expect(toBigIntLESigned(new Uint8Array([0xff, 0xff, 0xff, 0xff]))).toBe(-1n);
  });

  it('should handle 8-byte signed values (little-endian)', () => {
    // max i64 in LE
    expect(toBigIntLESigned(new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f]))).toBe(9223372036854775807n);
    // min i64 in LE
    expect(toBigIntLESigned(new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80]))).toBe(-9223372036854775808n);
    // -1 in LE
    expect(toBigIntLESigned(new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]))).toBe(-1n);
  });
});

describe('signed roundtrip conversions (encode negative -> decode signed)', () => {
  const signedTestCases = [
    // 1-byte (i8)
    { name: '-1 (i8)', value: -1n, width: 1 },
    { name: '-128 (min i8)', value: -128n, width: 1 },
    { name: '127 (max i8)', value: 127n, width: 1 },
    { name: '0 (i8)', value: 0n, width: 1 },
    { name: '-42 (i8)', value: -42n, width: 1 },

    // 2-byte (i16)
    { name: '-1 (i16)', value: -1n, width: 2 },
    { name: '-32768 (min i16)', value: -32768n, width: 2 },
    { name: '32767 (max i16)', value: 32767n, width: 2 },
    { name: '-1000 (i16)', value: -1000n, width: 2 },

    // 4-byte (i32)
    { name: '-1 (i32)', value: -1n, width: 4 },
    { name: '-2147483648 (min i32)', value: -2147483648n, width: 4 },
    { name: '2147483647 (max i32)', value: 2147483647n, width: 4 },
    { name: '-123456789 (i32)', value: -123456789n, width: 4 },

    // 8-byte (i64)
    { name: '-1 (i64)', value: -1n, width: 8 },
    { name: 'min i64', value: -9223372036854775808n, width: 8 },
    { name: 'max i64', value: 9223372036854775807n, width: 8 },
    { name: '-123456789012345 (i64)', value: -123456789012345n, width: 8 },

    // 16-byte (i128)
    { name: '-1 (i128)', value: -1n, width: 16 },
    { name: 'min i128', value: -(1n << 127n), width: 16 },
    { name: 'max i128', value: (1n << 127n) - 1n, width: 16 },

    // 32-byte (i256)
    { name: '-1 (i256)', value: -1n, width: 32 },
    { name: 'min i256', value: -(1n << 255n), width: 32 },
    { name: 'max i256', value: (1n << 255n) - 1n, width: 32 },
  ];

  for (const { name, value, width } of signedTestCases) {
    it(`should roundtrip BE for ${name}`, () => {
      const buffer = toBufferBE(value, width);
      const recovered = toBigIntBESigned(buffer);
      expect(recovered).toBe(value);
    });

    it(`should roundtrip LE for ${name}`, () => {
      const buffer = toBufferLE(value, width);
      const recovered = toBigIntLESigned(buffer);
      expect(recovered).toBe(value);
    });
  }
});

describe('signed vs unsigned comparison', () => {
  it('should return same value for positive numbers below midpoint', () => {
    const buf = new Uint8Array([0x42]);
    expect(toBigIntBE(buf)).toBe(66n);
    expect(toBigIntBESigned(buf)).toBe(66n);
    expect(toBigIntLE(buf)).toBe(66n);
    expect(toBigIntLESigned(buf)).toBe(66n);
  });

  it('should differ for values at or above midpoint', () => {
    const buf = new Uint8Array([0xff]);
    expect(toBigIntBE(buf)).toBe(255n);
    expect(toBigIntBESigned(buf)).toBe(-1n);
    expect(toBigIntLE(buf)).toBe(255n);
    expect(toBigIntLESigned(buf)).toBe(-1n);
  });

  it('should handle the exact midpoint', () => {
    // 0x80 = 128 unsigned, -128 signed
    const buf = new Uint8Array([0x80]);
    expect(toBigIntBE(buf)).toBe(128n);
    expect(toBigIntBESigned(buf)).toBe(-128n);
  });
});

describe('fallback signed implementation', () => {
  it('should have signed functions available', () => {
    expect(typeof fallback.toBigIntBESigned).toBe('function');
    expect(typeof fallback.toBigIntLESigned).toBe('function');
  });

  it('should produce correct results for negative values', () => {
    expect(fallback.toBigIntBESigned(new Uint8Array([0xff]))).toBe(-1n);
    expect(fallback.toBigIntLESigned(new Uint8Array([0xff]))).toBe(-1n);
  });

  it('should produce correct results for positive values', () => {
    expect(fallback.toBigIntBESigned(new Uint8Array([0x7f]))).toBe(127n);
    expect(fallback.toBigIntLESigned(new Uint8Array([0x7f]))).toBe(127n);
  });
});
