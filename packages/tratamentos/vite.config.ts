import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'tratamentos',
      filename: 'remoteEntry.js',
      exposes: {
        './AcompanhamentoPage': './src/pages/AcompanhamentoPage',
        './TreatmentPage': './src/pages/TreatmentPage',
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
      '@moocafisio/shared': path.resolve(__dirname, '../../shared'),
    },
  },
  server: {
    port: 5175,
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

