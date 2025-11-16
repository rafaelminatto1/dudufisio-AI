import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // Isola o root para o design-system para evitar escanear o projeto inteiro
  root: path.resolve(__dirname, 'design-system'),
  build: {
    outDir: path.resolve(__dirname, 'dist-design-system'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'design-system/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      // Prioriza utilitários compartilhados do root
      '@/lib': path.resolve(__dirname, './lib'),
      'design-system': path.resolve(__dirname, './design-system'),
      '@/design-system': path.resolve(__dirname, './design-system'),
      // Map '@' to project root to support root-level imports
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 3001,
    open: '/index.html',
    fs: {
      // Allow imports from project root when using a custom root
      allow: [path.resolve(__dirname)],
    },
  },
  css: {
    postcss: path.resolve(__dirname, 'postcss.config.mjs'),
  },
  optimizeDeps: {
    exclude: ['src', 'lib', 'services', 'components/ui'],
  },
});