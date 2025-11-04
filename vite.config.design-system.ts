import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist-design-system',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'design-system/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './design-system'),
      '@/src': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    open: '/design-system/index.html',
  },
  css: {
    postcss: './postcss.config.mjs',
  },
  optimizeDeps: {
    exclude: ['src', 'lib', 'services', 'components/ui'],
  },
});