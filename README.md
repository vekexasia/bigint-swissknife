# <img src="https://raw.githubusercontent.com/vekexasia/bigint-swissknife/main/.github/swissknife.svg" height="40"/> bigint-swissknife

**The missing BigInt toolkit for JavaScript/TypeScript** — Fast buffer conversions, math utilities, bounded integers, and more.

<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/> <img src="https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white"/> <img src="https://img.shields.io/badge/vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white"/>

## Why?

JavaScript's `BigInt` is powerful but incomplete. The standard library leaves you without:

- **Buffer conversion** — No native way to convert between `BigInt` and `Uint8Array`/`Buffer`
- **Math functions** — `Math.max()`, `Math.min()`, `Math.abs()` don't work with BigInt
- **Bounded integers** — No `u8`, `i32`, `u256` types with overflow protection
- **Random generation** — No way to generate cryptographically random BigInts

This monorepo fills those gaps with **fast, type-safe, browser-compatible** packages.

## Packages

| Package | Version | Description | Highlights |
|---------|---------|-------------|------------|
| **[@vekexasia/bigint-buffer2](https://www.npmjs.com/package/@vekexasia/bigint-buffer2)** | [![npm](https://img.shields.io/npm/v/@vekexasia/bigint-buffer2.svg)](https://www.npmjs.com/package/@vekexasia/bigint-buffer2) | BigInt ↔ Buffer conversion | 🦀 Rust native bindings, ~30% faster than alternatives |
| **[@vekexasia/bigint-uint8array](https://www.npmjs.com/package/@vekexasia/bigint-uint8array)** | [![npm](https://img.shields.io/npm/v/@vekexasia/bigint-uint8array.svg)](https://www.npmjs.com/package/@vekexasia/bigint-uint8array) | BigInt ↔ Uint8Array with bounds checking | Signed/unsigned, big/little endian |
| **[@vekexasia/bigint-constrained](https://www.npmjs.com/package/@vekexasia/bigint-constrained)** | [![npm](https://img.shields.io/npm/v/@vekexasia/bigint-constrained.svg)](https://www.npmjs.com/package/@vekexasia/bigint-constrained) | Bounded BigInts (u8, i32, u256, etc.) | Overflow protection on all operations |
| **[@vekexasia/bigint-math](https://www.npmjs.com/package/@vekexasia/bigint-math)** | [![npm](https://img.shields.io/npm/v/@vekexasia/bigint-math.svg)](https://www.npmjs.com/package/@vekexasia/bigint-math) | Math utilities for BigInt | abs, sign, max, min, rand, bitLength |
| **[@vekexasia/bigint-buffer-polyfill](https://www.npmjs.com/package/@vekexasia/bigint-buffer-polyfill)** | [![npm](https://img.shields.io/npm/v/@vekexasia/bigint-buffer-polyfill.svg)](https://www.npmjs.com/package/@vekexasia/bigint-buffer-polyfill) | Buffer prototype extensions | `buf.writeBigIntBE()`, `buf.readBigUIntLE()` |

## Performance

`bigint-buffer2` provides native Rust bindings that outperform pure JavaScript implementations:

![Performance Comparison](https://raw.githubusercontent.com/vekexasia/bigint-swissknife/main/packages/bigint-buffer2/docs/benchmark-operations-BE.png)

*The red bars (`toBufferBEInto`) show 30-40% speedup by writing directly into pre-allocated buffers.*

## Quick Start

```bash
# Core buffer conversion (recommended starting point)
npm install @vekexasia/bigint-buffer2

# Or pick what you need
npm install @vekexasia/bigint-uint8array  # bounds-checked conversions
npm install @vekexasia/bigint-constrained # bounded integers
npm install @vekexasia/bigint-math        # math utilities
```

### Examples

```typescript
// Buffer conversion (bigint-buffer2)
import { toBigIntBE, toBufferBE } from '@vekexasia/bigint-buffer2';
const num = toBigIntBE(new Uint8Array([0x01, 0x02, 0x03]));  // 66051n
const buf = toBufferBE(12345n, 4);  // Uint8Array [0, 0, 48, 57]

// Bounded integers (bigint-constrained)
import { u8, i32 } from '@vekexasia/bigint-constrained';
const byte = u8(255n);
byte.add(1n);  // throws RangeError: overflow

// Math utilities (bigint-math)
import { BigIntMath } from '@vekexasia/bigint-math';
BigIntMath.max(1n, 5n, 3n);        // 5n
BigIntMath.rand(1000000000000n);   // random BigInt 0..1T
```

## Browser Support

All packages work in browsers. `bigint-buffer2` automatically falls back to a pure JS implementation when native bindings aren't available.

## Documentation

Full API documentation: **[vekexasia.github.io/bigint-swissknife](https://vekexasia.github.io/bigint-swissknife/)**

## Investigating `bigint-buffer` downloads

This repo includes a small CLI to estimate **which direct dependents are most likely driving npm downloads** for a package.

```bash
# Generic usage
yarn downloads:drivers bigint-buffer --compare @vekexasia/bigint-buffer2

# Ready-made report for the migration question
yarn downloads:drivers:bigint-buffer
```

What it does:
- pulls weekly npm downloads for the target package
- discovers direct dependents via ecosyste.ms
- fetches weekly downloads for each dependent
- checks whether the dependent still uses the target in its **latest** published version or only in older versions
- writes optional JSON/CSV reports under `artifacts/`

Important: npm does **not** expose exact per-downloader attribution, so this is an **evidence-based estimator**, not an exact source-of-downloads audit.

## License

MIT License - see [LICENSE](./LICENSE.md) for details.
