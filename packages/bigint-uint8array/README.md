# 💪🔢 @vekexasia/bigint-buffer: Enhanced Buffer Utilities for BigInt Handling
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/> <img 
src="https://img.shields.io/badge/jest-323330?style=for-the-badge&logo=mocha&logoColor=Brown"/> <img 
src="https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white"/>

This project builds upon the original [`bigint-buffer`](https://www.npmjs.org/package/bigint-buffer) utility, which provides efficient conversion between TC39 BigInts and buffers, by introducing additional functionality for more flexible bigint handling, including support for reading and writing arbitrarily large **signed** and unsigned bigints.

## New Features

### Signed BigInt Support with Coercion

- **Signed BigInt Support**: The library now supports signed bigints, allowing for the representation of negative numbers in addition to positive ones. This feature is crucial for applications that require a full range of integer representation.

- **Value Coercion Based on Byte Length**: When writing BigInts to a buffer, the library intelligently checks or coerces values based on the specified number of bytes. This ensures that the value fits within the allocated space, preserving the sign and magnitude as accurately as possible.

### Buffer class monkey patch utility methods for Arbitrary-Length BigInts

For convenience the library allows to monkey patch (only if properly imported) the Buffer class with the new methods. This is done by importing the library as follows:

```typescript
import '@vekexasia/bigint-buffer/buffer';
```

Upon doing so the following methods will be available on the Buffer class:
```typescript
interface Buffer {
  // signed
  writeBigIntBE: (value: bigint, width: number, offset?: number) => number
  writeBigIntLE: (value: bigint, width: number, offset?: number) => number
  readBigIntBE: (width: number, offset?: number) => bigint
  readBigIntLE: (width: number, offset?: number) => bigint
  // unsigned
  writeBigUIntBE: (value: bigint, width: number, offset?: number) => number
  writeBigUIntLE: (value: bigint, width: number, offset?: number) => number
  readBigUIntBE: (width: number, offset?: number) => bigint
  readBigUIntLE: (width: number, offset?: number) => bigint
}
```


## Why Extend bigint-buffer?

The original `bigint-buffer` library provided a solid foundation for working with BigInts, offering efficient conversion to and from buffers without the need for intermediate hexadecimal string conversion. 
By extending its capabilities to include support for signed integers, this project aims to address a broader spectrum of use cases, making it a more versatile tool for developers working with large or complex numerical data.

## Installation

Add the extended bigint-buffer to your project:

```bash
npm install @vekexasia/bigint-buffer
```

## Usage

The extended functionality integrates seamlessly with the existing `bigint-buffer` API, providing additional methods for working with BigInts:

```typescript
import {
  toBufferBigIntLE,
  toBigIntLE,
} from '@vekexasia/bigint-buffer';

let buffer = toBufferBigIntLE(42n, 1);
let bigint = toBigIntLE(buffer, 1); // 42n

buffer = toBufferBigIntLE(-42n, 1);
bigint = toBigIntLE(buffer, 1); // -42n

buffer = toBufferBigIntLE(128, 1); // throws Error as 128 does not fit in 1 signed integer byte

```

or by leveraging buffer monkey patching:

```typescript
import '@vekexasia/bigint-buffer/buffer';

const buffer = Buffer.alloc(8);
buffer.writeBigIntLE(42n, 8);
const bigint = buffer.readBigIntLE(8); // 42n

```

## Documentation

All the methods are documented in the source code. 