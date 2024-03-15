import { defineWorkspace } from 'vitest/config'
import path from 'path'

export default defineWorkspace([
  {
    extends: path.join(__dirname, 'vitest.config.mts'),
    test: {
      include: ['test/*.test.ts', 'test/node-only/**/*.test.ts'],
      environment: 'node',
      name: 'node-constrained'
    }
  },
  {
    extends: path.join(__dirname, 'vitest.config.mts'),
    test: {
      include: ['test/*.test.ts'],
      environment: 'jsdom',
      name: 'browser-constrained',
      browser: {
        name: 'chrome',
        headless: true,
        enabled: true
      }
    }
  }
])
