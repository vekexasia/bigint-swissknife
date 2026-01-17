# @vekexasia/bigint-buffer2

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Build Tool](https://img.shields.io/badge/Build-esbuild-yellow.svg)](https://esbuild.github.io/)
[![Rust](https://img.shields.io/badge/Rust-Native%20%2B%20WASM-orange.svg)](https://www.rust-lang.org/)
[![Test Framework](https://img.shields.io/badge/Test-Vitest-green.svg)](https://vitest.dev/)

Fast BigInt/Buffer conversion with Rust native bindings, WASM for browsers, and JS fallback.

Part of the [bigint-swissknife](https://github.com/vekexasia/bigint-swissknife) monorepo.

## Features

- **Native performance** via Rust napi-rs bindings for Node.js
- **WASM support** for browsers via wasm-bindgen
- **Pure JS fallback** for environments without native/WASM support
- **Drop-in replacement** for `bigint-buffer`
- **Fixes known issues** from the original bigint-buffer (#40, #59, #22, #12)
- **Cross-platform** pre-built binaries (linux-x64, darwin-x64, darwin-arm64, win32-x64)

## Installation

```bash
npm install @vekexasia/bigint-buffer2
# or
yarn add @vekexasia/bigint-buffer2
```

## Usage

```typescript
import { toBigIntBE, toBigIntLE, toBufferBE, toBufferLE } from '@vekexasia/bigint-buffer2';

// Buffer to BigInt
const buffer = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
const bigEndian = toBigIntBE(buffer);   // 16909060n
const littleEndian = toBigIntLE(buffer); // 67305985n

// BigInt to Buffer
const be = toBufferBE(16909060n, 4);  // Uint8Array [0x01, 0x02, 0x03, 0x04]
const le = toBufferLE(67305985n, 4);  // Uint8Array [0x01, 0x02, 0x03, 0x04]
```

### Browser WASM Initialization

For best performance in browsers, initialize WASM early:

```typescript
import { initWasm, toBigIntBE } from '@vekexasia/bigint-buffer2';

// Initialize WASM (optional - falls back to JS if not called)
await initWasm();

// Now use the API
const result = toBigIntBE(buffer);
```

### Implementation Detection

```typescript
import { getImplementation } from '@vekexasia/bigint-buffer2';

console.log(getImplementation()); // 'native', 'wasm', or 'js'
```

## API

### `toBigIntBE(buffer: Buffer | Uint8Array): bigint`
Convert a big-endian buffer to BigInt.

### `toBigIntLE(buffer: Buffer | Uint8Array): bigint`
Convert a little-endian buffer to BigInt.

### `toBufferBE(num: bigint, width: number): Buffer | Uint8Array`
Convert BigInt to big-endian buffer with specified byte width.

### `toBufferLE(num: bigint, width: number): Buffer | Uint8Array`
Convert BigInt to little-endian buffer with specified byte width.

### `initWasm(): Promise<void>`
Initialize WASM implementation (browser only).

### `getImplementation(): 'native' | 'wasm' | 'js'`
Get the current implementation type.

## TypeScript

Types are included with the package.

## Performance

This package provides significant performance improvements over pure JavaScript implementations:

| Operation | Native | WASM | JS Fallback |
|-----------|--------|------|-------------|
| toBigIntBE (64B) | ~2x faster | ~1.5x faster | baseline |
| toBufferBE (64B) | ~2x faster | ~1.5x faster | baseline |

Run benchmarks:
```bash
npm run benchmark
```

## Documentation

Full API documentation: https://vekexasia.github.io/bigint-swissknife/

## License

MIT
