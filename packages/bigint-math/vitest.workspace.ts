import { defineWorkspace } from 'vitest/config'
import path from 'path'

export default defineWorkspace([
  {
    extends: path.join(__dirname, 'vitest.config.mts'),
    define: {
      IS_BROWSER: false
    },
    test: {
      include: ['test/*.test.ts'],
      environment: 'node',
      name: 'node-math'
    }
  },
  {
    extends: path.join(__dirname, 'vitest.config.mts'),
    define: {
      IS_BROWSER: true
    },
    test: {
      include: ['test/*.test.ts'],
      environment: 'jsdom',
      name: 'browser-math',
      browser: {
        name: 'chrome',
        enabled: true
      }
    }
  }
])
