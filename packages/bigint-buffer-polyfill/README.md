# @vekexasia/bigint-buffer-polyfill: Buffer polyfill for BigInt

<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/> <img 
src="https://img.shields.io/badge/rollup-323330?style=for-the-badge&logo=rollup.js&logoColor=Brown"/> <img 
src="https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white"/> <img 
src="https://img.shields.io/badge/vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white"/>

This project is part of the [bigint-swissknife](https://github.com/vekexasia/bigint-swissknife) project. It aims to monkeypatch the Buffer native class adding
support for BigInts. This is useful when working with Node.js.

## Documentation

You can find typedoc documentation [here](https://vekexasia.github.io/bigint-swissknife/interfaces/_vekexasia_bigint_buffer_polyfill.Buffer.html).

## Installation

Add the library to your project:

```bash
npm install @vekexasia/bigint-buffer-polyfill
```

or

```bash
yarn add @vekexasia/bigint-buffer-polyfill
```

## Usage

Simply import the library and start using it on your Buffers.


```typescript
import '@vekexasia/bigint-buffer-polyfill';

const buf = Buffer.alloc(16);
buf.writeBigIntBE(-42n, 8);
buf.writeBigUIntLE(69n, 8, 8);

console.log(buf.readBigIntBE(8)); // -42n
console.log(buf.readBigUIntLE(8, 8)); // 69n
```

## TypeScript

The library is entirely written in TypeScript and comes with its own type definitions.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
