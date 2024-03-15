import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'

const browser = {
  // Browser
  input: 'src/index.ts',
  output: {
    format: 'es',

    file: 'dist/browser.esm.js'
  },
  plugins: [
    ,
    typescript({
      tsconfig: './tsconfig.json',
      filterRoot: './src'
    })

  ]
}

const browser2 = {
  // Browser
  input: 'src/index.ts',
  output: [
    {
      format: 'iife',
      name: 'BigIntUint8Array',
      file: 'dist/browser.iife.js'
    },
    {
      format: 'umd',
      name: 'BigIntUint8Array',
      file: 'dist/browser.umd.js'
    }
  ],
  plugins: [

    typescript({
      tsconfig: './tsconfig.json',
      filterRoot: './src'
    })

  ]
}
/**
 * @type {import('rollup').RollupOptions[]}
 */
const b = [
  browser,
  browser2,
  {
    input: 'src/index.ts',
    output: [{
      format: 'cjs',
      file: 'dist/node.cjs.js'
    }, {
      format: 'esm',
      file: 'dist/node.esm.mjs'
    }],
    external: ['bigint-buffer'],
    plugins: [
      replace({
        preventAssignment: true,
        values: {
          'browser.js': 'native.js'
        }
      }),
      typescript({
        tsconfig: './tsconfig.json',
        filterRoot: './src'

      }),
      typescript({
        tsconfig: './tsconfig.json',
        filterRoot: './src',

        compilerOptions: {
          rootDir: 'src',
          outDir: 'dist/types',
          declaration: true,
          declarationMap: true,
          emitDeclarationOnly: true
        }
      })

    ]
  }

]

export default b
