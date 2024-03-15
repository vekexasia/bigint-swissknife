import typescript from '@rollup/plugin-typescript'
import {rollupCreate, rollupTypes} from "../../build/rollupconfigcreator.mjs";

const tsOptions = {compilerOptions: {rootDir: '.'}};
/**
 * @type {import('rollup').RollupOptions[]}
 */
export default [
  {... rollupCreate({isBrowser: false, isEsm: false}, tsOptions), external: ['@vekexasia/bigint-uint8array']},
  {... rollupCreate({isBrowser: false, isEsm: true},tsOptions), external: ['@vekexasia/bigint-uint8array']},
  {... rollupTypes(), external: ['@vekexasia/bigint-uint8array']},
]
