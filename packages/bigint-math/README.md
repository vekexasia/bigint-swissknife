# @vekexasia/bigint-math: BigInt Math utils

<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/> <img 
src="https://img.shields.io/badge/rollup-323330?style=for-the-badge&logo=rollup.js&logoColor=Brown"/> <img 
src="https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white"/> <img 
src="https://img.shields.io/badge/vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white"/>

This project is part of the [bigint-swissknife](https://github.com/vekexasia/bigint-swissknife) project. It aims to provide some missing utilities in the `Math` native class.

For example there is no `Math.max` for BigInt, this library provides a solution for that and other missing utilities.

## Why?

Tired of reinventing the wheel every time I decided to create a library that provides the missing math utilities for BigInt.

The library allows to perform operations not just on bigint but also on everything that is `BigIntable`

```typescript
export type BigIntable = bigint | number | string
```


## Documentation

You can find typedoc documentation [here](https://vekexasia.github.io/bigint-swissknife/variables/_vekexasia_bigint_math.BigIntMath.html).

## Installation

Add the library to your project:

```bash
npm install @vekexasia/bigint-math
```

or

```bash
yarn add @vekexasia/bigint-math
```

When using the library in a browser environment, you can **also** include it directly in your HTML file using the [iife](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) build or the [umd](https://github.com/umdjs/umd). Both will expose the `BigIntUint8Array` global variable.

If you wish to use iife or umd even with your preferred builder, remember to import the library like so

```typescript
import '@vekexasia/bigint-math/iife';
// or import '@vekexasia/bigint-math/umd'; 
```

## Usage

You can find all the available methods in the [typedoc documentation](https://vekexasia.github.io/bigint-swissknife/variables/_vekexasia_bigint_math.BigIntMath.html). But here a list of some of the most missing ones:

```typescript

import {BigIntMath} from '@vekexasia/bigint-math';

BigIntMath.max(1n, 2n, 3n, 4n, 5n); // 5n
BigIntMath.min(1n, 2n, 3n, 4n, 5n); // 1n
BigIntMath.abs(-1n); // 1n
BigIntMath.ceilDivide(5n, 4n); // 2n (5/4 = 1.25 => 2)
BigIntMath.divide(5n, 4n); // 1n (5/4 = 1.25)
BigIntMath.roundDivide(5n, 4n); // 1n (5/4 = 1.25 => 1)
BigIntMath.rand(2000000000000000000n); // random bigint between 0n and 2000000000000000000n


```

## TypeScript

The library is entirely written in TypeScript and comes with its own type definitions.

## a Note about `rand`

The `rand` method uses the `crypto` module to generate a random number. On browser it uses `window.crypto` and on node it uses `crypto` from the `crypto` module.


## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
