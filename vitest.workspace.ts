import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  // ==================== bigint-buffer2 ====================

  // bigint-buffer2 - node with native implementation
  {
    extends: './packages/bigint-buffer2/vitest.config.mts',
    test: {
      root: './packages/bigint-buffer2',
      include: ['test/*.test.ts', 'test/impl/js.test.ts', 'test/impl/native.test.ts'],
      exclude: ['**/benchmark/**', 'test/impl/wasm.test.ts', 'test/impl/hybrid.test.ts'],
      environment: 'node',
      name: 'buffer2-node-native',
    }
  },

  // bigint-buffer2 - JS implementation only (node)
  {
    extends: './packages/bigint-buffer2/vitest.config.mts',
    test: {
      root: './packages/bigint-buffer2',
      include: ['test/impl/js.test.ts'],
      exclude: ['**/benchmark/**'],
      environment: 'node',
      name: 'buffer2-node-js',
    }
  },

  // bigint-buffer2 - browser with WASM
  {
    extends: './packages/bigint-buffer2/vitest.config.mts',
    define: {
      IS_BROWSER: true,
    },
    test: {
      root: './packages/bigint-buffer2',
      include: ['test/impl/wasm.test.ts', 'test/impl/hybrid.test.ts'],
      exclude: ['**/benchmark/**', 'test/impl/native.test.ts'],
      name: 'buffer2-browser-wasm',
      browser: {
        enabled: true,
        provider: 'webdriverio',
        name: 'chrome',
        headless: true
      }
    }
  },

  // bigint-buffer2 - browser with JS fallback only
  {
    extends: './packages/bigint-buffer2/vitest.config.mts',
    define: {
      IS_BROWSER: true,
    },
    test: {
      root: './packages/bigint-buffer2',
      include: ['test/impl/js.test.ts'],
      exclude: ['**/benchmark/**'],
      name: 'buffer2-browser-js',
      browser: {
        enabled: true,
        provider: 'webdriverio',
        name: 'chrome',
        headless: true
      }
    }
  },

  // ==================== bigint-uint8array ====================

  // bigint-uint8array - node with bigint-buffer
  {
    extends: './packages/bigint-uint8array/vitest.config.mts',
    test: {
      root: './packages/bigint-uint8array',
      include: ['test/*.test.ts', 'test/node-only/**/*.test.ts'],
      exclude: ['**/benchmark/**'],
      environment: 'node',
      name: 'uint8array-node-with-bigint-buffer',
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
      name: 'uint8array-node-without-bigint-buffer',
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
      name: 'uint8array-browser',
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

  // ==================== bigint-constrained ====================

  // bigint-constrained - node
  {
    extends: './packages/bigint-constrained/vitest.config.mts',
    test: {
      root: './packages/bigint-constrained',
      include: ['test/*.test.ts'],
      environment: 'node',
      name: 'constrained-node'
    }
  },
  // bigint-constrained - browser
  {
    extends: './packages/bigint-constrained/vitest.config.mts',
    test: {
      root: './packages/bigint-constrained',
      include: ['test/*.test.ts'],
      name: 'constrained-browser',
      browser: {
        enabled: true,
        provider: 'webdriverio',
        name: 'chrome',
        headless: true
      }
    }
  },

  // ==================== bigint-math ====================

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
      name: 'math-node'
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
      name: 'math-browser',
      browser: {
        enabled: true,
        provider: 'webdriverio',
        name: 'chrome',
        headless: true
      }
    }
  },

  // ==================== bigint-buffer-polyfill ====================

  // bigint-buffer-polyfill - node only
  {
    extends: './packages/bigint-buffer-polyfill/vitest.config.mts',
    test: {
      root: './packages/bigint-buffer-polyfill',
      include: ['test/*.test.ts'],
      environment: 'node',
      name: 'polyfill-node'
    }
  }
])
