# <img src=".github/swissknife.svg" height="40"/> bigint-swissknife

[BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) is a great addition to the JavaScript language, but it's still missing some utilities and features. This project aims to provide some missing utilities and features for BigInt.

This is a mono-repository containing several packages that provide utilities for working with BigInts.

A couple of examples:

- `bigint` lacks support in `Math.max` and `Math.min` functions.
- The `Buffer` class does not support `bigint` natively.
- There is no way to work with bounded `BigInts` (e.g., `uint8`, `int8`, `uint16`, `int16`, etc.).
- There is no way to work with `bigint` and `Uint8Array` natively converting between the two.
- Generating a random `bigint` is not possible natively.

## Packages

Currently, this repo is composed by the following packages:

- [@vekexasia/bigint-buffer-polyfill](./packages/bigint-buffer-polyfill/README.md): Buffer polyfill for BigInt
- [@vekexasia/bigint-constrained](./packages/bigint-constrained/README.md): Bounded BigInts
- [@vekexasia/bigint-math](./packages/bigint-math/README.md): BigInt Math utils
- [@vekexasia/bigint-uint8array](./packages/bigint-uint8array/README.md): Uint8Array conversion from/to BigInt

All the packages are written in TypeScript and come with their own type definitions. 

All the packages<sup>1</sup> also provide a browser compatible build. Check out the README of each package for more information.

<sup>1</sup> exception made for `bigint-buffer-polyfill` which does not make sense in a browser environment.

## Documentation

You can find the main typedoc documentation [here](https://vekexasia.github.io/bigint-swissknife/).

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.


