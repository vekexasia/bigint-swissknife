/**
 * Compile-time type contract tests for \@vekexasia/bigint-buffer2 subpath API split.
 *
 * Run via: cd packages/bigint-buffer2 && npm run test:types
 *
 * - Lines with \@ts-expect-error MUST produce a type error (if they stop erroring, tsc fails).
 * - Lines without it MUST compile cleanly.
 */

// ─── /native subpath ───────────────────────────────────────────────────────

import {
  toBufferBE as nativeToBufferBE,
  toBufferLE as nativeToBufferLE,
  toBufferBEInto as nativeToBufferBEInto,
  toBufferLEInto as nativeToBufferLEInto,
  toBigIntBE as nativeToBigIntBE,
  toBigIntLE as nativeToBigIntLE,
} from '@vekexasia/bigint-buffer2/native';

// --- Return types: native alloc methods must return Buffer, not Buffer | Uint8Array ---
const nativeBE: Buffer = nativeToBufferBE(1n, 4);
const nativeLE: Buffer = nativeToBufferLE(1n, 4);

// Verify return type is exactly Buffer via a helper that only accepts Buffer
function acceptsBufferOnly(b: Buffer): void { void b; }
acceptsBufferOnly(nativeToBufferBE(1n, 4));
acceptsBufferOnly(nativeToBufferLE(1n, 4));

// --- Into methods: native accepts Buffer only, rejects plain Uint8Array ---
nativeToBufferBEInto(1n, Buffer.alloc(4));
nativeToBufferLEInto(1n, Buffer.alloc(4));

// @ts-expect-error — native toBufferBEInto must reject plain Uint8Array
nativeToBufferBEInto(1n, new Uint8Array(4));

// @ts-expect-error — native toBufferLEInto must reject plain Uint8Array
nativeToBufferLEInto(1n, new Uint8Array(4));

// --- Read methods: native accepts both Buffer and Uint8Array ---
nativeToBigIntBE(Buffer.alloc(4));
nativeToBigIntBE(new Uint8Array(4));
nativeToBigIntLE(Buffer.alloc(4));
nativeToBigIntLE(new Uint8Array(4));

// ─── /fallback subpath ─────────────────────────────────────────────────────

import {
  toBufferBEInto as fbToBufferBEInto,
  toBufferLEInto as fbToBufferLEInto,
  toBigIntBE as fbToBigIntBE,
} from '@vekexasia/bigint-buffer2/fallback';

// --- Into methods: fallback accepts both Buffer and Uint8Array ---
fbToBufferBEInto(1n, Buffer.alloc(4));
fbToBufferBEInto(1n, new Uint8Array(4));
fbToBufferLEInto(1n, Buffer.alloc(4));
fbToBufferLEInto(1n, new Uint8Array(4));

// --- Read methods: fallback accepts both ---
fbToBigIntBE(Buffer.alloc(4));
fbToBigIntBE(new Uint8Array(4));

// ─── /js subpath (alias of /fallback) ──────────────────────────────────────

import {
  toBufferBEInto as jsToBufferBEInto,
  toBufferLEInto as jsToBufferLEInto,
} from '@vekexasia/bigint-buffer2/js';

jsToBufferBEInto(1n, new Uint8Array(4));
jsToBufferLEInto(1n, new Uint8Array(4));

// ─── Main entry ────────────────────────────────────────────────────────────

import {
  toBufferBEInto as mainToBufferBEInto,
  toBufferLEInto as mainToBufferLEInto,
  toBufferBE as mainToBufferBE,
  toBufferLE as mainToBufferLE,
} from '@vekexasia/bigint-buffer2';

// --- Into methods: main entry accepts both (broad contract) ---
mainToBufferBEInto(1n, Buffer.alloc(4));
mainToBufferBEInto(1n, new Uint8Array(4));
mainToBufferLEInto(1n, Buffer.alloc(4));
mainToBufferLEInto(1n, new Uint8Array(4));

// --- Alloc methods: main entry returns Buffer | Uint8Array (broad) ---
const mainBE: Buffer | Uint8Array = mainToBufferBE(1n, 4);

// @ts-expect-error — main toBufferBE returns Buffer | Uint8Array, not just Buffer
const mainBEStrict: Buffer = mainToBufferBE(1n, 4);

// @ts-expect-error — main toBufferLE returns Buffer | Uint8Array, not just Buffer
const mainLEStrict: Buffer = mainToBufferLE(1n, 4);

// Suppress unused-variable warnings
void nativeBE; void nativeLE; void mainBE; void mainBEStrict; void mainLEStrict;
