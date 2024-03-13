import { converter as browser } from './browser.js'
import { converter as native } from './native.js'

export const converter = Object.getPrototypeOf(
  Object.getPrototypeOf(globalThis)
) !== Object.prototype
  ? browser
  : native
