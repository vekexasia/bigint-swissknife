/**
 * Test for GitHub Issue #3: Native bindings return incorrect/delayed results in Bun runtime
 *
 * This test verifies the fix works correctly in Bun.
 * It imports from the built dist files to avoid build-time constant issues.
 *
 * Run with Bun:  bun test test/bun-runtime.test.ts
 * Run with Node: npx vitest run test/bun-runtime.test.ts
 */

// Detect runtime
const isBun = typeof globalThis.Bun !== 'undefined';
console.log(`\n🔍 Runtime: ${isBun ? 'Bun' : 'Node.js'} | Test framework: ${isBun ? 'bun:test' : 'vitest'}\n`);

// Dynamic import based on test runner
// Vitest uses 'vitest', Bun uses 'bun:test'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let describe: any, it: any, expect: any;

if (isBun) {
  // @ts-expect-error - Bun-specific import not recognized by TS
  const bunTest = await import('bun:test');
  describe = bunTest.describe;
  it = bunTest.it;
  expect = bunTest.expect;
} else {
  const vitest = await import('vitest');
  describe = vitest.describe;
  it = vitest.it;
  expect = vitest.expect;
}

// Import from built files to ensure we test the actual distribution
const { toBufferLE, toBufferBE, toBigIntLE, toBigIntBE } = await import('../dist/node.esm.mjs');

describe('GitHub Issue #3 - Bun runtime correctness', () => {
  describe('toBufferLE', () => {
    it('should return correct result on first call (not zeros)', () => {
      const result = toBufferLE(BigInt(100), 8);
      // Expected: 64 00 00 00 00 00 00 00 (100 in LE)
      expect(result[0]).toBe(0x64);
      expect(result[1]).toBe(0x00);
    });

    it('should return correct result on consecutive calls (not delayed)', () => {
      const result1 = toBufferLE(BigInt(100), 8);
      const result2 = toBufferLE(BigInt(101), 8);
      const result3 = toBufferLE(BigInt(102), 8);

      // Each should have its own correct value, not the previous one
      expect(result1[0]).toBe(0x64); // 100
      expect(result2[0]).toBe(0x65); // 101
      expect(result3[0]).toBe(0x66); // 102
    });

    it('should handle various values correctly', () => {
      const testCases = [
        { input: 0n, expected: 0x00 },
        { input: 1n, expected: 0x01 },
        { input: 255n, expected: 0xff },
        { input: 256n, expected: 0x00 }, // 256 = 0x100, first byte is 0
        { input: 0xdeadbeefn, expected: 0xef },
      ];

      for (const { input, expected } of testCases) {
        const result = toBufferLE(input, 8);
        expect(result[0]).toBe(expected);
      }
    });
  });

  describe('toBufferBE', () => {
    it('should return correct result on first call', () => {
      const result = toBufferBE(BigInt(100), 8);
      // Expected: 00 00 00 00 00 00 00 64 (100 in BE)
      expect(result[7]).toBe(0x64);
      expect(result[0]).toBe(0x00);
    });

    it('should return correct result on consecutive calls', () => {
      const result1 = toBufferBE(BigInt(100), 8);
      const result2 = toBufferBE(BigInt(101), 8);
      const result3 = toBufferBE(BigInt(102), 8);

      expect(result1[7]).toBe(0x64); // 100
      expect(result2[7]).toBe(0x65); // 101
      expect(result3[7]).toBe(0x66); // 102
    });
  });

  describe('roundtrip consistency', () => {
    it('should roundtrip correctly in LE', () => {
      const values = [0n, 1n, 100n, 255n, 256n, 65535n, 0xdeadbeefn, 2n ** 64n - 1n];

      for (const value of values) {
        const buffer = toBufferLE(value, 8);
        const recovered = toBigIntLE(buffer);
        expect(recovered).toBe(value);
      }
    });

    it('should roundtrip correctly in BE', () => {
      const values = [0n, 1n, 100n, 255n, 256n, 65535n, 0xdeadbeefn, 2n ** 64n - 1n];

      for (const value of values) {
        const buffer = toBufferBE(value, 8);
        const recovered = toBigIntBE(buffer);
        expect(recovered).toBe(value);
      }
    });
  });

  describe('stress test - no delayed results', () => {
    it('should handle rapid consecutive calls without delay', () => {
      // This is the core of the bug - rapid calls should not show "delayed" results
      for (let i = 0; i < 100; i++) {
        const value = BigInt(i);
        const result = toBufferLE(value, 8);
        const recovered = toBigIntLE(result);
        expect(recovered).toBe(value);
      }
    });
  });
});
