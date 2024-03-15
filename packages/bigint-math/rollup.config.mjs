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
  ... rollupStandardCreate({}, ['crypto', '@vekexasia/bigint-uint8array']),


  // IIFE AND UMD
  {
    input: './src/index.ts',
    output: [
      {
        format: 'iife',
        name: 'BigIntMath',
        file: 'dist/browser.iife.js',
      },
      {
        format: 'umd',
        name: 'BigIntMath',
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

      alias( {
        entries: [
          { find: '@vekexasia/bigint-uint8array', replacement: `${process.cwd()}/../bigint-uint8array/dist/browser.cjs.js` },
        ]
      }),
      commonjs(),


    ]
  },

]

export default b
