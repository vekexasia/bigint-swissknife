# @vekexasia/bigint-uint8array: Enhanced Buffer/Uint8Array Conversion for BigInt
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

Be aware that `bigint-buffer` is a **peer dependency** of this library and is used internally. When not installed the library will use a pure JS implementation.

For those who are not in need for extreme performance it is recommended to not install `bigint-buffer` and use the pure JS implementation to keep the dependency chain as small as possible.


## Installation

Add the library to your project:

```bash
npm install @vekexasia/bigint-uint8array
```

or

```bash
yarn add @vekexasia/bigint-uint8array
```

When using the library in a browser environment, you can **also** include it directly in your HTML file using the [iife](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) build or the [umd](https://github.com/umdjs/umd). Both will expose the `BigIntUint8Array` global variable.

If you wish to use iife or umd even with your preferred builder, remember to import the library like so

```typescript
import '@vekexasia/bigint-math/iife';
// or import '@vekexasia/bigint-math/umd'; 
```

## Typescript

The library is entirely written in TypeScript and comes with its own type definitions.

## Documentation

You can find typedoc documentation [here](https://vekexasia.github.io/bigint-swissknife/modules/_vekexasia_bigint_uint8array.html).

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

The library uses the NAPI bindings when available (when bigint-buffer is installed as peer dependency). Besides the default `converter` there is also the [`uncheckedConverter`](https://vekexasia.github.io/bigint-swissknife/variables/_vekexasia_bigint_uint8array.uncheckedConverter-1.html)
which is roughly 1.5x faster but does not check for overflows.

Furthermore, the library allows to reuse the same buffer for multiple operations, which can be useful in performance-critical scenarios.
**NOTE**: the bigint-buffer implementation will always create a new buffer.

This means that the `toArray` method is actually slower in node.js (for now).
```
✓ newArray (2) 3574ms
   · converter.be.toNewArray                 3,900,104.52 ops/sec ±0.62% (1950053 samples)
   · uncheckedConverter.bigEndianToNewArray  5,570,941.24 ops/sec ±0.42% (2785471 samples) fastest
✓ reuseArray (2) 4788ms
   · converter.be.toArray                 3,358,796.16 ops/sec ±0.27% (1679399 samples)
   · uncheckedConverter.bigEndianToArray  4,881,600.69 ops/sec ±0.28% (2440801 samples) fastest
```

Also be aware that native implementation is between 3-5x faster than the pure JS implementation.
```
✓ newArray (2)
  · native   4,239,630.32 ops/sec ±0.69% (2119816 samples) fastest
  · browser  1,103,549.21 ops/sec ±0.37% ( 551775 samples)
✓ reuseArray (2) 
  · native   3,395,706.54 ops/sec ±0.40% (1697854 samples) fastest
  · browser  1,113,350.88 ops/sec ±0.31% ( 556676 samples)
```


## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
