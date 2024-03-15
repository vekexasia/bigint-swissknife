import { defineWorkspace } from 'vitest/config'
import path from 'path'

export default defineWorkspace([
  {
    extends: path.join(__dirname, 'vitest.config.mts'),
    test: {
      include: ['test/*.test.ts', 'test/node-only/**/*.test.ts'],
      environment: 'node',
      name: 'node-uint8array',
      alias: {
        './browser.js': './native.js'
      }
    }
  },
  {
    extends: path.join(__dirname, 'vitest.config.mts'),
    test: {
      include: ['test/*.test.ts'],
      environment: 'jsdom',
      name: 'browser-uint8array',
      browser: {
        name: 'chrome',
        enabled: true,
        headless: true
      }

    }
  }
])
