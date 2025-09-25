import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
  ],
  esbuild: {
    // Temporarily enable console logs for debugging
    // drop: ['console', 'debugger']
  },
  define: {
    'process.env': 'import.meta.env',
    'process.env.NODE_ENV': JSON.stringify('development'), // Force development mode for debugging
    '__DEV__': true
  },
  server: {
    port: 5174,
    host: 'localhost',
    hmr: {
      port: 5174,
      host: 'localhost',
      clientPort: 5174,
      overlay: true
    },
    watch: {
      usePolling: false,
      interval: 100
    },
    cors: true,
    strictPort: false
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    alias: {
      '@': path.resolve(__dirname, '.'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime'),
      '@/components': path.resolve(__dirname, './components'),
      '@/pages': path.resolve(__dirname, './pages'),
      '@/services': path.resolve(__dirname, './services'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/contexts': path.resolve(__dirname, './contexts'),
      '@/types': path.resolve(__dirname, './types'),
      '@/lib': path.resolve(__dirname, './lib')
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime'
    ],
    exclude: ['@playwright/test'],
    force: true
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      external: (id) => {
        // Previne múltiplas instâncias do React
        if (id.includes('react') && !id.startsWith('./') && !id.startsWith('../')) {
          return false;
        }
        return false;
      },
      output: {
        manualChunks: (id) => {
          // Força todos os módulos React no mesmo chunk
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          if (id.includes('@radix-ui') || id.includes('lucide-react')) {
            return 'ui-vendor';
          }
          if (id.includes('@google/generative-ai')) {
            return 'ai-vendor';
          }
          if (id.includes('@supabase')) {
            return 'supabase-vendor';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    minify: false, // Disable minification to help debug React error #310
    chunkSizeWarningLimit: 1000
  }
});
