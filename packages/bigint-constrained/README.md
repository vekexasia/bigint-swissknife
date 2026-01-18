# @vekexasia/bigint-constrained: BigInt wrapper for boundaries checking

<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/> <img 
src="https://img.shields.io/badge/rollup-323330?style=for-the-badge&logo=rollup.js&logoColor=Brown"/> <img 
src="https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white"/> <img 
src="https://img.shields.io/badge/vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white"/>

This project is part of the [bigint-swissknife](https://github.com/vekexasia/bigint-swissknife) project. It provides a BigInt wrapper class that enforces bounds checking on arithmetic operations.

## Why?

Sometimes you need to work with a bounded BigInt. This library provides a simple wrapper around BigInt that allows you to specify a minimum and maximum value for the BigInt.

For example, if you need to make sure the bigint you work with is at max 255 (aka uint8), you can use the following:

```typescript
import { u8 } from '@vekexasia/bigint-constrained';

const a = u8(255n);
const b = u8(256n); // throws an error
const c = u8(-1n); // throws an error

a.add(1n); // throws an error
```

Please notice:

 - Every operation performs boundaries checking and throws an error if the operation would result in a value outside the boundaries.
 - Every operation is **idempotent** on the calling instance and returns a **new instance** of the bounded BigInt with the same boundaries.


## Documentation

You can find typedoc documentation [here](https://vekexasia.github.io/bigint-swissknife/modules/_vekexasia_bigint-constrained.html).

## Installation

Add the library to your project:

```bash
npm install @vekexasia/bigint-constrained
```

or

```bash
yarn add @vekexasia/bigint-constrained
```

## Usage

Simply import the library like shown above and then you can start using the methods to work with bounded BigInts.

Right now the library exposes the following bounded BigInts:

- `u8` (uint8)
- `u16` (uint16)
- `u32` (uint32)
- `u64` (uint64)
- `u128` (uint128)
- `u256` (uint256)
- `i8` (int8)
-  ...
- `i256` (int256)

If these are not sufficient you can always create your own like so: 

```typescript
import {CheckedBigInt} from '@vekexasia/bigint-constrained';

const u1024 = new CheckedBigInt(0n /*value*/, 1024 /*bits*/, false /*unsigned*/);
```

or custom bounds:

```typescript
import {CheckedBigInt} from '@vekexasia/bigint-constrained';

const between10And20 = new CheckedBigInt(10n, {min: 10n, max: 20n});

```

## TypeScript

The library is entirely written in TypeScript and comes with its own type definitions.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
