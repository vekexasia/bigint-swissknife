/**
 * Core API tests for bigint-buffer2.
 *
 * Tests basic functionality of toBigIntBE, toBigIntLE, toBufferBE, toBufferLE.
 */

import { describe, it, expect } from 'vitest';
import { toBigIntBE, toBigIntLE, toBufferBE, toBufferLE, fallback } from '../src/index.js';

describe('toBigIntBE', () => {
  it('should convert empty buffer to 0n', () => {
    expect(toBigIntBE(new Uint8Array([]))).toBe(0n);
  });

  it('should convert single byte', () => {
    expect(toBigIntBE(new Uint8Array([0x42]))).toBe(0x42n);
  });

  it('should convert 4 bytes', () => {
    expect(toBigIntBE(new Uint8Array([0x01, 0x02, 0x03, 0x04]))).toBe(0x01020304n);
  });

  it('should convert 8 bytes', () => {
    const buf = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
    expect(toBigIntBE(buf)).toBe(0x0102030405060708n);
  });

  it('should convert 16 bytes', () => {
    const buf = new Uint8Array([
      0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
      0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10,
    ]);
    expect(toBigIntBE(buf)).toBe(0x0102030405060708090a0b0c0d0e0f10n);
  });

  it('should handle all zeros', () => {
    expect(toBigIntBE(new Uint8Array([0, 0, 0, 0]))).toBe(0n);
  });

  it('should handle leading zeros', () => {
    expect(toBigIntBE(new Uint8Array([0, 0, 0x01, 0x02]))).toBe(0x0102n);
  });

  it('should handle max 8-byte value', () => {
    const buf = new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
    expect(toBigIntBE(buf)).toBe(0xffffffffffffffffn);
  });
});

describe('toBigIntLE', () => {
  it('should convert empty buffer to 0n', () => {
    expect(toBigIntLE(new Uint8Array([]))).toBe(0n);
  });

  it('should convert single byte', () => {
    expect(toBigIntLE(new Uint8Array([0x42]))).toBe(0x42n);
  });

  it('should convert 4 bytes', () => {
    expect(toBigIntLE(new Uint8Array([0x04, 0x03, 0x02, 0x01]))).toBe(0x01020304n);
  });

  it('should convert 8 bytes', () => {
    const buf = new Uint8Array([0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01]);
    expect(toBigIntLE(buf)).toBe(0x0102030405060708n);
  });

  it('should handle all zeros', () => {
    expect(toBigIntLE(new Uint8Array([0, 0, 0, 0]))).toBe(0n);
  });

  it('should handle trailing zeros (high bytes)', () => {
    expect(toBigIntLE(new Uint8Array([0x02, 0x01, 0, 0]))).toBe(0x0102n);
  });
});

describe('toBufferBE', () => {
  it('should convert 0n to zero-filled buffer', () => {
    const result = toBufferBE(0n, 4);
    expect(Array.from(result)).toEqual([0, 0, 0, 0]);
  });

  it('should convert single byte value', () => {
    const result = toBufferBE(0x42n, 1);
    expect(Array.from(result)).toEqual([0x42]);
  });

  it('should convert 4-byte value', () => {
    const result = toBufferBE(0x01020304n, 4);
    expect(Array.from(result)).toEqual([0x01, 0x02, 0x03, 0x04]);
  });

  it('should convert 8-byte value', () => {
    const result = toBufferBE(0x0102030405060708n, 8);
    expect(Array.from(result)).toEqual([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
  });

  it('should pad with zeros on the left', () => {
    const result = toBufferBE(0x1234n, 4);
    expect(Array.from(result)).toEqual([0x00, 0x00, 0x12, 0x34]);
  });

  it('should handle max 8-byte value', () => {
    const result = toBufferBE(0xffffffffffffffffn, 8);
    expect(Array.from(result)).toEqual([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
  });
});

describe('toBufferLE', () => {
  it('should convert 0n to zero-filled buffer', () => {
    const result = toBufferLE(0n, 4);
    expect(Array.from(result)).toEqual([0, 0, 0, 0]);
  });

  it('should convert single byte value', () => {
    const result = toBufferLE(0x42n, 1);
    expect(Array.from(result)).toEqual([0x42]);
  });

  it('should convert 4-byte value', () => {
    const result = toBufferLE(0x01020304n, 4);
    expect(Array.from(result)).toEqual([0x04, 0x03, 0x02, 0x01]);
  });

  it('should convert 8-byte value', () => {
    const result = toBufferLE(0x0102030405060708n, 8);
    expect(Array.from(result)).toEqual([0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01]);
  });

  it('should pad with zeros on the right (high bytes)', () => {
    const result = toBufferLE(0x1234n, 4);
    expect(Array.from(result)).toEqual([0x34, 0x12, 0x00, 0x00]);
  });
});

describe('round-trip conversions', () => {
  const testCases = [
    { name: 'zero', value: 0n, width: 8 },
    { name: 'one', value: 1n, width: 1 },
    { name: 'max u8', value: 255n, width: 1 },
    { name: 'max u16', value: 65535n, width: 2 },
    { name: 'max u32', value: 0xffffffffn, width: 4 },
    { name: 'max u64', value: 0xffffffffffffffffn, width: 8 },
    { name: 'max u128', value: (1n << 128n) - 1n, width: 16 },
    { name: 'max u256', value: (1n << 256n) - 1n, width: 32 },
    { name: 'random medium', value: 0x123456789abcdefn, width: 8 },
    { name: 'random large', value: 0xdeadbeefcafebabe1234567890abcdefn, width: 16 },
  ];

  for (const { name, value, width } of testCases) {
    it(`should round-trip BE for ${name}`, () => {
      const buffer = toBufferBE(value, width);
      const recovered = toBigIntBE(buffer);
      expect(recovered).toBe(value);
    });

    it(`should round-trip LE for ${name}`, () => {
      const buffer = toBufferLE(value, width);
      const recovered = toBigIntLE(buffer);
      expect(recovered).toBe(value);
    });
  }
});

describe('fallback implementation', () => {
  it('should be available for direct use', () => {
    expect(fallback).toBeDefined();
    expect(typeof fallback.toBigIntBE).toBe('function');
    expect(typeof fallback.toBigIntLE).toBe('function');
    expect(typeof fallback.toBufferBE).toBe('function');
    expect(typeof fallback.toBufferLE).toBe('function');
  });

  it('should produce correct results', () => {
    const buf = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
    expect(fallback.toBigIntBE(buf)).toBe(0x01020304n);
    expect(fallback.toBigIntLE(buf)).toBe(0x04030201n);
  });
});
