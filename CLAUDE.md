# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies (Yarn 4.1.0 is the package manager)
yarn install

# Run all tests
yarn test

# Run tests in watch mode (from package directory)
cd packages/<package-name> && npm test

# Build all packages (must be done in dependency order)
yarn build

# Lint and fix
yarn lint

# Build single package
cd packages/<package-name> && npm run build

# Run benchmarks (bigint-constrained and bigint-uint8array only)
cd packages/<package-name> && npm run benchmark

# Generate coverage
cd packages/<package-name> && npm run coverage
```

## Architecture

This is a **Yarn workspaces monorepo** containing TypeScript packages for BigInt utilities.

### Package Dependency Order (critical for builds)
1. `bigint-uint8array` - base package, no internal dependencies
2. `bigint-constrained` - standalone bounded integers
3. `bigint-math` - depends on `bigint-uint8array`
4. `bigint-buffer-polyfill` - depends on `bigint-uint8array`

### Packages

- **`@vekexasia/bigint-uint8array`**: Core converter between `BigInt` and `Uint8Array`. Provides `converter` object with `signed`/`unsigned` and `be`/`le` operations. Has separate browser and Node.js builds.

- **`@vekexasia/bigint-math`**: Math utilities (`BigIntMath.abs`, `max`, `min`, `bitLength`, `divide`, `rand`, etc.). Uses crypto for secure random generation.

- **`@vekexasia/bigint-constrained`**: Bounded integers with overflow checking. Factory functions (`u8`, `u16`, `u32`, `u64`, `u128`, `u256`, `i8`, etc.) create `CheckedBigInt` instances that throw on overflow.

- **`@vekexasia/bigint-buffer-polyfill`**: Node.js only. Adds `Buffer.prototype.readBigIntBE/LE`, `writeBigIntBE/LE`, etc. for arbitrary-width BigInt Buffer operations.

### Build System

- **Rollup** with TypeScript for bundling
- Each package has its own `rollup.config.mjs`
- Outputs: ESM (`.mjs`), CJS (`.js`), IIFE, and UMD variants
- TypeDoc for documentation generation

### Testing

- **Vitest** for all tests
- Each package has `vitest.config.mts`
- Tests live in `packages/<name>/test/`
- Browser tests use `@vitest/browser` with WebdriverIO
