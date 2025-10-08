/**
 * Vitest Configuration
 * Configuração para testes unitários e de integração
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.*',
        'dist/',
        '.eslintrc.cjs',
        'scripts/',
        'supabase/',
      ],
      // Metas de cobertura
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.eslintrc.cjs'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});


