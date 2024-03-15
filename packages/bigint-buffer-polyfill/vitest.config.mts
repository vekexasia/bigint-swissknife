import {defineConfig} from "vitest/config";

export default defineConfig({
  root: `${__dirname}`,
  optimizeDeps: {
    include: ["vitest > @vitest/expect > chai"]
  },
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['html', 'lcov', 'text-summary'],
      include: ['src/**/*.ts'],
    },
    alias: {
      "@/": new URL('./src/', import.meta.url).pathname,
      "@cases": new URL('../bigint-uint8array/test/intcases.ts', import.meta.url).pathname,
      '@vekexasia/bigint-uint8array': new URL('../bigint-uint8array', import.meta.url).pathname,

    }
  }
});
