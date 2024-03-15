import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'
import {rollupStandardCreate} from "../../build/rollupconfigcreator.mjs";
/**
 * @type {import('rollup').RollupOptions[]}
 */
export default [
  ... rollupStandardCreate({}, ['bigint-buffer']),
]
