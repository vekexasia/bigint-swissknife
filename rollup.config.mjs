import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
/**
 * @type {import('rollup').RollupOptions[]}
 */
const b = [
  {
    input: 'packages/bigint-math/src/fillRandom.ts',

    output: {
      format: 'es',
      name: 'BigIntMath',
      amd: {
        id: 'bigint-math'
      },
      globals: {
        crypto: 'crypto'
      }
    },
    external: ['crypto'],
    plugins: [typescript({
      tsconfig: 'packages/bigint-math/tsconfig.json'
    })]
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
