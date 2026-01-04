import { defineConfig } from "vitest/config";

export default defineConfig({
  root: import.meta.dirname,
  define: {
    IS_BROWSER: false
  },
  optimizeDeps: {
    include: ["vitest > @vitest/expect > chai"]
  },
  test: {
    benchmark: {
      include: ['test/benchmark/**/*.test.ts'],
    },
    coverage: {
      provider: 'istanbul',
      reporter: ['html', 'lcov', 'text-summary'],
      include: ['src/**/*.ts'],
    },
    alias: {
      "@/": new URL('./src/', import.meta.url).pathname,
      '@vekexasia/bigint-uint8array': new URL('../bigint-uint8array', import.meta.url).pathname,
    }
  }
});
