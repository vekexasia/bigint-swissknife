import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'
import nodeResolve from "@rollup/plugin-node-resolve";
import alias from '@rollup/plugin-alias';
import {typescriptPaths} from 'rollup-plugin-typescript-paths';
import resolve from 'resolve';
import * as fs from 'fs';


import * as repl from "repl";

const conf = [{name: 'node', browser: false}, {name: 'browser', browser: true}]
/**
 * @type {import('rollup').RollupOptions[]}
 */
const b = [

  ...conf.map(({name, browser}) => ([
    {
      input: 'src/index.ts',
      output: [{
        format: 'cjs',
        file: `dist/${name}.cjs.js`
      }],
      external: ['@vekexasia/bigint-uint8array'],
      plugins: [
        replace({
          values: {
            'await import(': 'require(',
          },
          delimiters: ['', ''],
          preventAssignment: true
        }),
        replace({
          values: {
            'IS_BROWSER': `${browser}`,
          },
          preventAssignment: true
        }),
        typescript({
          tsconfig: './tsconfig.json',
          include: ['../../build/types/globals.d.ts', 'src/**/*.ts'],
        }),
      ]
    },
    {
      input: 'src/index.ts',
      output: [{
        format: 'esm',
        file: `dist/${name}.esm.mjs`
      }],
      external: ['@vekexasia/bigint-uint8array', 'crypto'],
      plugins: [
        replace({
          values: {
            'IS_BROWSER': `${browser}`,
          },
          preventAssignment: true
        }),
        typescript({
          tsconfig: './tsconfig.json',
          include: ['../../build/types/globals.d.ts', 'src/**/*.ts'],
        }),
      ]
    }
  ])).flat(),
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
        include: ['../../build/types/globals.d.ts', 'src/**/*.ts'],
      }),
      alias( {
        entries: [
          { find: '@vekexasia/bigint-uint8array', replacement: `${process.cwd()}/../bigint-uint8array/dist/browser.esm.js` },
        ]
      }),

    ]
  },
  //
  // Types
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist'
      }
    ],
    external: ['@vekexasia/bigint-uint8array', 'crypto'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',

        compilerOptions: {
          rootDir: './src',
          outDir: 'dist/types',
          declaration: true,
        },
        include: ['../../../build/types/globals.d.ts', './**/*.ts'],
      }),
      {
        name: 'remove-transpiled',
        generateBundle: async (options,
                               bundle, isWrite) => {
          delete bundle['index.js']
        }
      }
    ]
  }
]

export default b
