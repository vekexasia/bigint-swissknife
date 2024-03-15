import replace from '@rollup/plugin-replace'
import typescript from '@rollup/plugin-typescript'
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

/**
 *
 * @param conf {{isBrowser: boolean, isEsm: boolean}}
 * @param typescriptOptions {import('@rollup/plugin-typescript').RollupTypescriptOptions} eventual override of typescript options
 * @returns {{output: [{file: string, format: string}], input: string, plugins: *[]}}
 */
export const rollupCreate = (conf, typescriptOptions= null) => {
  const { isBrowser, isEsm } = conf
  return {
    input: 'src/index.ts',
    output: [{
      format: `${isEsm ? 'esm' : 'cjs'}`,
      file: `dist/${isBrowser ? 'browser' : 'node'}.${isEsm ? 'esm' : 'cjs'}.${isEsm ? 'm' : ''}js`,
      inlineDynamicImports: true

    }],
    plugins: [
      replace({
        values: {
          IS_BROWSER: `${isBrowser}`,
          ...(() => {
            if (isBrowser) {
              return {
                'native.js': 'browser.js'
              }
            } else {
              return {
                'browser.js': 'native.js'
              }
            }
          })()
        },
        preventAssignment: true
      }),
      ...(() => {
        if (!isEsm) {
          return [replace({
            values: {
              'await import(': 'import('
            },
            delimiters: ['', ''],
            preventAssignment: true
          })]
        }
        return []
      })(),
      typescript({
        tsconfig: './tsconfig.json',
        include: ['../../build/types/globals.d.ts', 'src/**/*.ts'],
        ...(typescriptOptions || {})
      }),
      commonjs(),
      nodeResolve()
    ]
  }
}

export const rollupTypes= () => {
  const base = rollupCreate({isBrowser: false, isEsm: false}, {
    compilerOptions: {
      declaration: true,
      rootDir: './src',
      emitDeclarationOnly: true,
      outDir: 'dist/types',
    },
    include: ['../../../build/types/globals.d.ts', './**/*.ts']
  });
  base.plugins.push({
    name: 'remove-transpiled',
    generateBundle: async (options,
                           bundle, isWrite) => {
      delete bundle['node.cjs.js']
    }
  });
  return base
}

/**
 * Genrate standard browser and node rollup configurations + types
 * @param typescriptOptions {import('@rollup/plugin-typescript').RollupTypescriptOptions} eventual override of typescript options
 * @param externals {string[]} eventual override of externals
 * @returns {import('rollup').RollupOptions[]}
 */
export const rollupStandardCreate = (typescriptOptions= {}, externals= []) => {
  return [
    {... rollupCreate({isBrowser: true, isEsm: true}, typescriptOptions), external: externals ?? []},
    {... rollupCreate({isBrowser: true, isEsm: false}, typescriptOptions), external: externals ?? []},
    {... rollupCreate({isBrowser: false, isEsm: true}, typescriptOptions), external: externals ?? []},
    {... rollupCreate({isBrowser: false, isEsm: false}, typescriptOptions), external: externals ?? []},
    {... rollupTypes(), external: externals},
  ]
}
