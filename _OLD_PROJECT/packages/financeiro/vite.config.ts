import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'financeiro',
      filename: 'remoteEntry.js',
      exposes: {
        './FinancialDashboardPage': './src/pages/FinancialDashboardPage',
        './ReportsPage': './src/pages/ReportsPage',
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
        recharts: {
          singleton: true,
          requiredVersion: '^2.15.4',
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../'), // Raiz do projeto
      '@moocafisio/shared': path.resolve(__dirname, '../../shared'),
    },
  },
  server: {
    port: 5176,
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

