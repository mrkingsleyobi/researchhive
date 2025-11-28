import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        '.next/**',
        'dist/**',
        '**/*.config.ts',
        '**/*.config.js',
        '**/types/**',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web/src'),
      '@researchhive/ai': path.resolve(__dirname, './packages/ai'),
      '@researchhive/database': path.resolve(__dirname, './packages/database'),
      '@researchhive/types': path.resolve(__dirname, './packages/types/src'),
      '@researchhive/ui': path.resolve(__dirname, './packages/ui'),
    },
  },
});
