import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import {nodeResolve as resolve} from '@rollup/plugin-node-resolve'
import { typescriptPaths } from 'rollup-plugin-typescript-paths';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
console.log(__dirname);
console.log([`${__dirname}/../`, `${__dirname}/../../node_modules`, `${__dirname}/node_modules`]);
/**
 * @type {import('rollup').RollupOptions[]}
 */
const b = [
  {
    // input: '/src/fillRandom.ts',
    input: 'src/index.ts',
    output: {
      dynamicImportInCjs: true,
      inlineDynamicImports: true,
      format: 'iife',
      // dir: 'dist',
      name: 'BigIntMath',
      globals: {
        crypto: 'crypto'
      },
    },
    plugins: [

      replace({
        preventAssignment: true,
        values: {
          'IS_BROWSER': 'true',
        }
      }),
      typescript({
        tsconfig: './tsconfig.json',
        filterRoot: './src',
      }),
      commonjs({extensions: ['.js', '.cjs', '.ts']}),
      resolve({
        browser: true,
        exportConditions: ['browser', 'default'],
        // dedupe: ['bigint-uint8array', '@vekexasia/bigint-uint8array'],
        // modulePaths: [`${__dirname}/../`, `${__dirname}/../../node_modules`, `${__dirname}/node_modules`],
        mainFields: ['browser', 'module', 'main'],
      }),

    ]
  }
  // {
  //   input: 'packages/bigint-math/src/fillRandom.ts',
  //   plugins: [
  //     typescript({
  //
  //     })
  //   ]
  // }
]

export default b
