import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    extends: './vitest.config.mts',
    test: {
      include: ['test/*.test.ts', 'test/node-only/**/*.test.ts'],
      environment: 'node',
      name: 'node-polyfill'
    }
  }
])
