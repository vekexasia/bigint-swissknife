/**
 * Edge case tests for bigint-buffer2.
 *
 * Tests for known bigint-buffer issues and edge cases that should be handled correctly.
 */

import { describe, it, expect } from 'vitest';
import { toBigIntBE, toBigIntLE, toBufferBE, toBufferLE, fallback } from '../src/index.js';

describe('Issue #40 - core dump with width 0', () => {
  it('toBufferLE(123n, 0) should return empty buffer', () => {
    const result = toBufferLE(123n, 0);
    expect(result.length).toBe(0);
  });

  it('toBufferBE(123n, 0) should return empty buffer', () => {
    const result = toBufferBE(123n, 0);
    expect(result.length).toBe(0);
  });

  it('toBigIntBE(empty) should return 0n', () => {
    expect(toBigIntBE(new Uint8Array(0))).toBe(0n);
  });

  it('toBigIntLE(empty) should return 0n', () => {
    expect(toBigIntLE(new Uint8Array(0))).toBe(0n);
  });

  it('fallback: toBufferLE(123n, 0) should return empty buffer', () => {
    const result = fallback.toBufferLE(123n, 0);
    expect(result.length).toBe(0);
  });

  it('fallback: toBufferBE(123n, 0) should return empty buffer', () => {
    const result = fallback.toBufferBE(123n, 0);
    expect(result.length).toBe(0);
  });
});

describe('Issue #59 - buffer overflow', () => {
  it('should truncate values that exceed width (BE)', () => {
    // 0x123456 in 2 bytes should give 0x3456
    const result = toBufferBE(0x123456n, 2);
    expect(result.length).toBe(2);
    expect(Array.from(result)).toEqual([0x34, 0x56]);
  });

  it('should truncate values that exceed width (LE)', () => {
    // 0x123456 in 2 bytes should give 0x56, 0x34 (LE of truncated value)
    const result = toBufferLE(0x123456n, 2);
    expect(result.length).toBe(2);
    expect(Array.from(result)).toEqual([0x56, 0x34]);
  });

  it('should not crash on very large values with small width', () => {
    const largeValue = (1n << 512n) - 1n;
    const result = toBufferBE(largeValue, 4);
    expect(result.length).toBe(4);
    // Should be all 0xFF (truncated to lowest 4 bytes)
    expect(Array.from(result)).toEqual([0xff, 0xff, 0xff, 0xff]);
  });

  it('fallback: should truncate values that exceed width', () => {
    const result = fallback.toBufferBE(0x123456n, 2);
    expect(result.length).toBe(2);
    expect(Array.from(result)).toEqual([0x34, 0x56]);
  });
});

describe('CVE-2025-3194 - null/invalid input handling', () => {
  // The original bigint-buffer crashes when passing null to toBigIntLE/toBigIntBE
  // Our implementation should throw a TypeError instead of crashing

  it('toBigIntBE should throw on null input', () => {
    expect(() => toBigIntBE(null as unknown as Uint8Array)).toThrow();
  });

  it('toBigIntLE should throw on null input', () => {
    expect(() => toBigIntLE(null as unknown as Uint8Array)).toThrow();
  });

  it('toBigIntBE should throw on undefined input', () => {
    expect(() => toBigIntBE(undefined as unknown as Uint8Array)).toThrow();
  });

  it('toBigIntLE should throw on undefined input', () => {
    expect(() => toBigIntLE(undefined as unknown as Uint8Array)).toThrow();
  });

  it('fallback: toBigIntBE should throw on null input', () => {
    expect(() => fallback.toBigIntBE(null as unknown as Uint8Array)).toThrow();
  });

  it('fallback: toBigIntLE should throw on null input', () => {
    expect(() => fallback.toBigIntLE(null as unknown as Uint8Array)).toThrow();
  });
});

describe('Issue #12 - first conversion returns zeros', () => {
  it('should return correct value on first call (BE)', () => {
    // This tests that initialization doesn't corrupt the first result
    const result = toBigIntBE(new Uint8Array([0x01, 0x02, 0x03]));
    expect(result).toBe(0x010203n);
  });

  it('should return correct value on first call (LE)', () => {
    const result = toBigIntLE(new Uint8Array([0x03, 0x02, 0x01]));
    expect(result).toBe(0x010203n);
  });

  it('should return consistent results on repeated calls', () => {
    const buffer = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    const expected = 0xdeadbeefn;

    // Call multiple times and verify consistency
    for (let i = 0; i < 10; i++) {
      expect(toBigIntBE(buffer)).toBe(expected);
    }
  });
});

describe('Issue #22 - assertion failures with large values', () => {
  it('should handle 256-bit values', () => {
    const value = (1n << 256n) - 1n;
    const buffer = toBufferBE(value, 32);
    const recovered = toBigIntBE(buffer);
    expect(recovered).toBe(value);
  });

  it('should handle 512-bit values', () => {
    const value = (1n << 512n) - 1n;
    const buffer = toBufferBE(value, 64);
    const recovered = toBigIntBE(buffer);
    expect(recovered).toBe(value);
  });

  it('should handle 1024-bit values', () => {
    const value = (1n << 1024n) - 1n;
    const buffer = toBufferBE(value, 128);
    const recovered = toBigIntBE(buffer);
    expect(recovered).toBe(value);
  });

  it('fallback: should handle 256-bit values', () => {
    const value = (1n << 256n) - 1n;
    const buffer = fallback.toBufferBE(value, 32);
    const recovered = fallback.toBigIntBE(buffer);
    expect(recovered).toBe(value);
  });
});

describe('Negative number handling', () => {
  it('should handle negative numbers with two\'s complement (BE)', () => {
    // -1 in 4 bytes should be 0xFFFFFFFF
    const result = toBufferBE(-1n, 4);
    expect(Array.from(result)).toEqual([0xff, 0xff, 0xff, 0xff]);
  });

  it('should handle negative numbers with two\'s complement (LE)', () => {
    // -1 in 4 bytes should be 0xFFFFFFFF
    const result = toBufferLE(-1n, 4);
    expect(Array.from(result)).toEqual([0xff, 0xff, 0xff, 0xff]);
  });

  it('should handle -128 in 1 byte', () => {
    const result = toBufferBE(-128n, 1);
    expect(Array.from(result)).toEqual([0x80]);
  });

  it('fallback: should handle negative numbers', () => {
    const result = fallback.toBufferBE(-1n, 4);
    expect(Array.from(result)).toEqual([0xff, 0xff, 0xff, 0xff]);
  });
});

describe('Special byte patterns', () => {
  it('should handle alternating bits', () => {
    const pattern = 0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaan;
    const buffer = toBufferBE(pattern, 16);
    const recovered = toBigIntBE(buffer);
    expect(recovered).toBe(pattern);
  });

  it('should handle single bit set at various positions', () => {
    for (let i = 0; i < 64; i++) {
      const value = 1n << BigInt(i);
      const buffer = toBufferBE(value, 8);
      const recovered = toBigIntBE(buffer);
      expect(recovered).toBe(value);
    }
  });

  it('should handle buffer with only high byte set', () => {
    const buffer = new Uint8Array([0x80, 0x00, 0x00, 0x00]);
    expect(toBigIntBE(buffer)).toBe(0x80000000n);
  });

  it('should handle buffer with only low byte set', () => {
    const buffer = new Uint8Array([0x00, 0x00, 0x00, 0x01]);
    expect(toBigIntBE(buffer)).toBe(1n);
  });
});

describe('Width edge cases', () => {
  it('should handle width 1', () => {
    expect(Array.from(toBufferBE(255n, 1))).toEqual([0xff]);
    expect(Array.from(toBufferLE(255n, 1))).toEqual([0xff]);
  });

  it('should handle odd widths', () => {
    const value = 0x123456789an;
    const buffer = toBufferBE(value, 5);
    expect(buffer.length).toBe(5);
    const recovered = toBigIntBE(buffer);
    expect(recovered).toBe(value);
  });

  it('should handle large odd widths', () => {
    const value = (1n << 72n) - 1n; // 9 bytes
    const buffer = toBufferBE(value, 9);
    expect(buffer.length).toBe(9);
    const recovered = toBigIntBE(buffer);
    expect(recovered).toBe(value);
  });
});
