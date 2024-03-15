import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'
import alias from '@rollup/plugin-alias';
import {rollupStandardCreate} from "../../build/rollupconfigcreator.mjs";
import commonjs from "@rollup/plugin-commonjs";

const conf = [{name: 'node', browser: false}, {name: 'browser', browser: true}]
/**
 * @type {import('rollup').RollupOptions[]}
 */
const b = [
  ... rollupStandardCreate(),
// IIFE AND UMD
  {
    input: './src/index.ts',
    output: [
      {
        format: 'iife',
        name: 'CheckedBigInt',
        file: 'dist/browser.iife.js',
      },
      {
        format: 'umd',
        name: 'CheckedBigInt',
        file: 'dist/browser.umd.js',
      }
    ],

    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        compilerOptions: {
          esModuleInterop: true,
        },
        include: ['../../build/types/globals.d.ts', 'src/**/*.ts'],
      }),


    ]
  },

]

export default b
