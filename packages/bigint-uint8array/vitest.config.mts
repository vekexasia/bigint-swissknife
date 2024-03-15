import {defineConfig} from "vitest/config";

export default defineConfig({
  root: `${__dirname}`,
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

    }

  }
});
