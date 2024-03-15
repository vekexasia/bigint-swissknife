import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'
import {rollupStandardCreate} from "../../build/rollupconfigcreator.mjs";
/**
 * @type {import('rollup').RollupOptions[]}
 */
export default [
  ... rollupStandardCreate({}, ['bigint-buffer']),
  // IIFE AND UMD
  {
    input: './src/index.ts',
    output: [
      {
        format: 'iife',
        name: 'BigIntUint8Array',
        file: 'dist/browser.iife.js',
      },
      {
        format: 'umd',
        name: 'BigIntUint8Array',
        file: 'dist/browser.umd.js',
      }
    ],
    external: ['crypto'],
    plugins: [
      replace({
        values: {
          'IS_BROWSER': 'true',
        },
        preventAssignment: true
      }),
      typescript({
        tsconfig: './tsconfig.json',
        compilerOptions: {
          esModuleInterop: true,
        },
        include: ['../../build/types/globals.d.ts', 'src/**/*.ts'],
      }),

      // commonjs(),


    ]
  },
]
