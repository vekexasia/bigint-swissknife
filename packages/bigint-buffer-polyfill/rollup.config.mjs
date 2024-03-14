import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'
import nodeResolve from "@rollup/plugin-node-resolve";

/**
 * @type {import('rollup').RollupOptions[]}
 */
const b = [
  {
    input: 'src/index.ts',
    output: [{
      format: 'cjs',
      file: 'dist/node.cjs.js'
    }, {
      format: 'esm',
      file: 'dist/node.esm.mjs'
    }],
    external: ['@vekexasia/bigint-uint8array'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        compilerOptions: {
          rootDir: "./src",
          outDir: 'dist/types',
          declaration: true,
        }
      }),

    ]
  }

]

export default b
