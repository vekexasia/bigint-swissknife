# @vekexasia/bigint-uint8array: Enhanced Buffer Utilities for BigInt Handling
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/> <img 
src="https://img.shields.io/badge/rollup-323330?style=for-the-badge&logo=rollup.js&logoColor=Brown"/> <img 
src="https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white"/> <img 
src="https://img.shields.io/badge/vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white"/>

This project builds upon the original [`bigint-buffer`](https://github.com/no2chem/bigint-buffer/) utility, which provides efficient conversion between TC39 BigInts and buffers, by introducing additional functionality for more flexible bigint handling, including support for reading and writing arbitrarily large **signed** and unsigned bigints.

## New Features

### Signed BigInt Support with Coercion

- **Signed BigInt Support**: The library now supports signed bigints, allowing for the representation of negative numbers in addition to positive ones. This feature is crucial for applications that require a full range of integer representation.

- **Value Coercion Based on Byte Length**: When writing BigInts to a buffer, the library intelligently checks or coerces values based on the specified number of bytes. This ensures that the value fits within the allocated space, preserving the sign and magnitude as accurately as possible.

- **Real browser support**: The library works in browser environments, while the original `bigint-buffer` is [built upon the Buffer class](https://github.com/no2chem/bigint-buffer/issues/15) which is not available in browsers. 

## Why extend bigint-buffer?

The original `bigint-buffer` library provided a solid foundation for working with BigInts, offering efficient conversion to and from buffers without the need for intermediate hexadecimal string conversion. 
By extending its capabilities to include support for signed integers, this project aims to address a broader spectrum of use cases, making it a more versatile tool for developers working with large or complex numerical data.

## Installation

Add the extended bigint-buffer to your project:

```bash
npm install @vekexasia/bigint-buffer
```
## Documentation

You can find typedoc documentation [here](https://vekexasia.github.io/bigint-uint8array/).

## Usage

The extended functionality integrates seamlessly with the existing `bigint-buffer` API, providing additional methods for working with BigInts:

```typescript
import { converter } from '@vekexasia/bigint-uint8array';

let arr = converter
  .unsigned // or .signed if working with signed integers
  .be // or .le for little endian
  .toNewArray(42n, 1 /* bytes */); // Uint8Array [ 42 ]
let bigint = converter.unsigned.be.toBigInt(arr); // 42n

```


## Performance

The library uses the NAPI bindings when available. Besides the default `converter` there is also the [`uncheckedConverter`](https://vekexasia.github.io/bigint-swissknife/variables/_vekexasia_bigint_uint8array.uncheckedConverter.html)
which is faster but does not check for overflows.

Furthermore, the library allows to reuse the same buffer for multiple operations, which can be useful in performance-critical scenarios.
**NOTE**: the bigint-buffer implementation will always create a new buffer even in 
