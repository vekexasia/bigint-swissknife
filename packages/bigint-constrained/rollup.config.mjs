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
      file: 'dist/cjs.js'
    }, {
      format: 'esm',
      file: 'dist/esm.mjs'
    },{
      format: 'iife',
      name: 'BigIntConstrained',
      file: 'dist/iife.js'
    },{
      format: 'umd',
      name: 'BigIntConstrained',
      file: 'dist/umd.js'
    }],
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
