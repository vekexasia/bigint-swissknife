import { defineWorkspace } from 'vitest/config'
import * as fsScandir from '@nodelib/fs.scandir'
import uintworskpace from './packages/bigint-uint8array/vitest.workspace.ts'
import constrainedworkspace from './packages/bigint-constrained/vitest.workspace.ts'
import mathworkspace from './packages/bigint-math/vitest.workspace.ts'
import bufferworkspace from './packages/bigint-buffer-polyfill/vitest.workspace.ts'

export default defineWorkspace([
  ...uintworskpace,
  ...constrainedworkspace,
  ...mathworkspace,
  ...bufferworkspace
])
