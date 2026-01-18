# @vekexasia/bigint-buffer2: Fast BigInt/Buffer conversion

<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/> <img
src="https://img.shields.io/badge/esbuild-FFCF00?style=for-the-badge&logo=esbuild&logoColor=black"/> <img
src="https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white"/> <img
src="https://img.shields.io/badge/vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white"/> <img
src="https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white"/>

This project is part of the [bigint-swissknife](https://github.com/vekexasia/bigint-swissknife) project. It provides fast BigInt/Buffer conversion with Rust native bindings and a pure JS fallback for browsers.

## Why?

The original [`bigint-buffer`](https://github.com/no2chem/bigint-buffer/) library provided a solid foundation for working with BigInts, offering efficient conversion to and from buffers. However, it has several known issues ([#40](https://github.com/no2chem/bigint-buffer/issues/40), [#59](https://github.com/no2chem/bigint-buffer/issues/59), [#22](https://github.com/no2chem/bigint-buffer/issues/22), [#12](https://github.com/no2chem/bigint-buffer/issues/12)) and lacks browser support.

This library addresses those limitations by providing:

- **Native performance** via Rust napi-rs bindings for Node.js
- **Pure JS fallback** for browsers and environments without native support
- **Signed BigInt support** with two's complement encoding
- **Cross-platform** pre-built binaries (linux-x64, darwin-x64, darwin-arm64, win32-x64)
- **Drop-in replacement** for the original bigint-buffer

## Documentation

You can find typedoc documentation [here](https://vekexasia.github.io/bigint-swissknife/modules/_vekexasia_bigint_buffer2.html).

## Installation

Add the library to your project:

```bash
npm install @vekexasia/bigint-buffer2
```

or

```bash
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

### Signed BigInt Support

```typescript
import { toBigIntBESigned, toBigIntLESigned } from '@vekexasia/bigint-buffer2';

const buffer = new Uint8Array([0xff, 0xff]); // -1 in 2 bytes (two's complement)
const signed = toBigIntBESigned(buffer); // -1n
```

### Implementation Detection

```typescript
import { getImplementation } from '@vekexasia/bigint-buffer2';

console.log(getImplementation()); // 'native' or 'js'
```

### Explicit Implementation Selection

For benchmarking or specific use cases, you can import implementations directly:

```typescript
// Force JS fallback
import { toBigIntBE } from '@vekexasia/bigint-buffer2/js';

// Force native (Node.js only)
import { toBigIntBE } from '@vekexasia/bigint-buffer2/native';
```

## TypeScript

The library is entirely written in TypeScript and comes with its own type definitions.

## Performance

This package provides significant performance improvements over pure JavaScript implementations:

| Operation | Native | JS Fallback |
|-----------|--------|-------------|
| toBigIntBE (64B) | ~2x faster | baseline |
| toBufferBE (64B) | ~2x faster | baseline |

Run benchmarks:
```bash
npm run benchmark
```

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
