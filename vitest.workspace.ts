import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  // bigint-uint8array - node with bigint-buffer
  {
    extends: './packages/bigint-uint8array/vitest.config.mts',
    test: {
      root: './packages/bigint-uint8array',
      include: ['test/*.test.ts', 'test/node-only/**/*.test.ts'],
      exclude: ['**/benchmark/**'],
      environment: 'node',
      name: 'node-uint8array-with-bigint-buffer',
    }
  },
  // bigint-uint8array - node without bigint-buffer
  {
    extends: './packages/bigint-uint8array/vitest.config.mts',
    test: {
      root: './packages/bigint-uint8array',
      include: ['test/*.test.ts', 'test/node-only/**/*.test.ts'],
      exclude: ['**/benchmark/**'],
      environment: 'node',
      name: 'node-uint8array-without-bigint-buffer',
      alias: {
        'bigint-buffer': 'vekexasia is for hire :)'
      },
    }
  },
  // bigint-uint8array - browser
  {
    extends: './packages/bigint-uint8array/vitest.config.mts',
    test: {
      root: './packages/bigint-uint8array',
      include: ['test/*.test.ts'],
      exclude: ['**/benchmark/**'],
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
  },
  // bigint-constrained - node
  {
    extends: './packages/bigint-constrained/vitest.config.mts',
    test: {
      root: './packages/bigint-constrained',
      include: ['test/*.test.ts'],
      environment: 'node',
      name: 'node-constrained'
    }
  },
  // bigint-constrained - browser
  {
    extends: './packages/bigint-constrained/vitest.config.mts',
    test: {
      root: './packages/bigint-constrained',
      include: ['test/*.test.ts'],
      name: 'browser-constrained',
      browser: {
        enabled: true,
        provider: 'webdriverio',
        name: 'chrome',
        headless: true
      }
    }
  },
  // bigint-math - node
  {
    extends: './packages/bigint-math/vitest.config.mts',
    define: {
      IS_BROWSER: false
    },
    test: {
      root: './packages/bigint-math',
      include: ['test/*.test.ts'],
      environment: 'node',
      name: 'node-math'
    }
  },
  // bigint-math - browser
  {
    extends: './packages/bigint-math/vitest.config.mts',
    define: {
      IS_BROWSER: true
    },
    test: {
      root: './packages/bigint-math',
      include: ['test/*.test.ts'],
      name: 'browser-math',
      browser: {
        enabled: true,
        provider: 'webdriverio',
        name: 'chrome',
        headless: true
      }
    }
  },
  // bigint-buffer-polyfill - node only
  {
    extends: './packages/bigint-buffer-polyfill/vitest.config.mts',
    test: {
      root: './packages/bigint-buffer-polyfill',
      include: ['test/*.test.ts'],
      environment: 'node',
      name: 'node-polyfill'
    }
  }
])
