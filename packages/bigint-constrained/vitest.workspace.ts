import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    extends: 'vitest.config.mts',
    test: {
      include: ['test/*.test.ts', 'test/node-only/**/*.test.ts'],
      name: 'node',
      environment: 'node'
    }
  },
  {
    extends: 'vitest.config.mts',
    test: {
      include: ['test/*.test.ts'],
      name: 'browser',
      environment: 'jsdom',
      browser: {
        name: 'chrome',
        enabled: true
      }
    }
  }
])
