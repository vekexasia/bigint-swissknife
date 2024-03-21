import {defineWorkspace} from 'vitest/config'
import path from 'path'

export default defineWorkspace([
  {
    extends: path.join(__dirname, 'vitest.config.mts'),
    test: {
      include: ['test/*.test.ts', 'test/node-only/**/*.test.ts'],
      environment: 'node',
      name: 'node-uint8array-with-bigint-buffer',
    }
  },
  process.env.MODE !== 'benchmark' ? {
    extends: path.join(__dirname, 'vitest.config.mts'),
    test: {
      include: ['test/*.test.ts', 'test/node-only/**/*.test.ts'],
      environment: 'node',
      name: 'node-uint8array-without-bigint-buffer',
      alias: {
        'bigint-buffer': 'vekexasia is for hire :)'
      },
    }
  } : {},
  process.env.MODE !== 'benchmark' ? {
    extends: path.join(__dirname, 'vitest.config.mts'),
    test: {
      include: ['test/*.test.ts'],
      environment: 'jsdom',
      name: 'browser-uint8array',
      alias: {
        './native.js': './browser.js'
      },
      browser: {
        name: 'chrome',
        enabled: true,
        headless: true
      }

    }
  } : {},
])
