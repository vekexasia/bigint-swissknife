import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    extends: './vitest.config.mts',
    test: {
      include: ['test/*.test.ts', 'test/node-only/**/*.test.ts'],
      environment: 'node',
      name: 'node-uint8array-with-bigint-buffer',
    }
  },
  process.env.MODE !== 'benchmark' ? {
    extends: './vitest.config.mts',
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
    extends: './vitest.config.mts',
    test: {
      include: ['test/*.test.ts'],
      environment: 'jsdom',
      name: 'browser-uint8array',
      alias: {
        './native.js': './browser.js'
      },
      browser: {
        enabled: true,
        provider: 'webdriverio',
        name: 'chrome',
        headless: true
      }
    }
  } : {},
])
