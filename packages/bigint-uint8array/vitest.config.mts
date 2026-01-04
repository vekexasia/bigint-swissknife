import { defineConfig } from "vitest/config";

export default defineConfig({
  root: import.meta.dirname,
  optimizeDeps: {
    include: ["vitest > @vitest/expect > chai"]
  },
  test: {
    exclude: ['**/benchmark/**', '**/node_modules/**'],
    benchmark: {
      include: ['test/benchmark/**/*.test.ts'],
      reporters: ['default', 'verbose'],
    },
    coverage: {
      provider: 'istanbul',
      reporter: ['html', 'lcov', 'text-summary'],
      include: ['src/**/*.ts'],
    },
    alias: {
      "@/": new URL('./src/', import.meta.url).pathname,
    }
  }
});
