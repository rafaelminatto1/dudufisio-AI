import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'host',
      remotes: {
        agendaPacientes: 'http://localhost:5174/assets/remoteEntry.js',
        tratamentos: 'http://localhost:5175/assets/remoteEntry.js',
        financeiro: 'http://localhost:5176/assets/remoteEntry.js',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.3.1',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.3.1',
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^7.9.3',
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../'),
      '@moocafisio/shared': path.resolve(__dirname, '../../shared'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    cors: true,
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});

