import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [
        react(),
        // VitePWA temporarily disabled due to Service Worker conflicts
        // VitePWA({...})
      ],
      server: {
        host: 'localhost',
        port: 5173,
        strictPort: true,
        hmr: {
          port: 5173
        },
        watch: {
          usePolling: false,
          interval: 100
        }
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@/components': path.resolve(__dirname, './components'),
          '@/pages': path.resolve(__dirname, './pages'),
          '@/services': path.resolve(__dirname, './services'),
          '@/hooks': path.resolve(__dirname, './hooks'),
          '@/contexts': path.resolve(__dirname, './contexts'),
          '@/types': path.resolve(__dirname, './types'),
          '@/lib': path.resolve(__dirname, './lib')
        },
        dedupe: ['react', 'react-dom']
      },
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom'],
        exclude: ['@vite/client', '@vite/env']
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'router-vendor': ['react-router-dom'],
              'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
              'ui-vendor': ['framer-motion', 'lucide-react'],
              'chart-vendor': ['recharts'],
              'supabase-vendor': ['@supabase/supabase-js']
            }
          }
        },
        chunkSizeWarningLimit: 1000
      }
    };
});
