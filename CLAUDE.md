# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Install dependencies (uses Yarn 4.1.0)
yarn install

# Build all packages (ordered by dependency: bigint-buffer2 -> bigint-uint8array -> bigint-constrained -> bigint-math -> bigint-buffer-polyfill)
yarn build

# Run all tests
yarn test

# Lint all packages
yarn lint

# Run tests for a single package
cd packages/<package-name> && yarn test

# Run a single test file
cd packages/<package-name> && npx vitest run test/<file>.test.ts

# Run benchmarks (bigint-buffer2 and bigint-uint8array only)
cd packages/<package-name> && yarn benchmark

# Build native Rust bindings (bigint-buffer2 only)
cd packages/bigint-buffer2 && yarn build:native
```

## Architecture Overview

This is a Yarn workspaces monorepo providing BigInt utilities for JavaScript/TypeScript.

### Package Dependency Graph

```
bigint-buffer2 (core conversion, Rust + JS)
       ↓
bigint-uint8array (checked conversions with bounds validation)
       ↓
├── bigint-constrained (bounded BigInts: u8, i8, u16, i16, etc.)
├── bigint-math (Math utilities: abs, sign, max, min, rand, bitLength)
└── bigint-buffer-polyfill (Node.js Buffer prototype extensions)
```

### Key Patterns

**bigint-buffer2** (`packages/bigint-buffer2/`):
- Dual implementation: Rust native bindings (via napi-rs) with JS fallback
- Auto-detects native availability at runtime, falls back to JS in browsers
- Build-time `IS_BROWSER` constant controls browser vs Node.js bundles
- Native bindings in `rust/napi/` wrap core logic from `rust/core/`
- Exports: `/js`, `/native`, `/fallback` subpaths for explicit implementation selection

**bigint-uint8array** (`packages/bigint-uint8array/`):
- Wraps unchecked converter with bounds validation (`assertIntBoundaries`, `assertUIntBoundaries`)
- `UncheckedConverter` interface: raw byte manipulation without validation
- `BigIntConverter` interface: signed/unsigned operations with BE/LE variants

**bigint-constrained** (`packages/bigint-constrained/`):
- `CheckedBigInt` class enforces bit-width bounds on arithmetic operations
- Factory functions: `u8()`, `u16()`, `u32()`, `u64()`, `u128()`, `u256()` and signed variants

**Build system**: Each package uses `esbuild.config.mjs` producing ESM/CJS/IIFE/UMD bundles with TypeScript declarations in `dist/types/`.
