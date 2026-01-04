import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    extends: './vitest.config.mts',
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
    extends: './vitest.config.mts',
    define: {
      IS_BROWSER: true
    },
    test: {
      include: ['test/*.test.ts'],
      environment: 'jsdom',
      name: 'browser-math',
      browser: {
        enabled: true,
        provider: 'webdriverio',
        name: 'chrome',
        headless: true
      }
    }
  }
])
