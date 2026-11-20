import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

/**
 * Shared Vite config: used by Vitest directly, merged into vite.lib.config.ts for the library build.
 */
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
    reporters: process.env.CI ? ['default', 'junit'] : ['default'],
    outputFile: { junit: './junit.xml' },
    coverage: {
      provider: 'v8',
      include: ['src/tedi/{components,providers}/**/*.{ts,vue}'],
      exclude: ['**/*.spec.ts', '**/*.stories.ts', '**/index.ts'],
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
