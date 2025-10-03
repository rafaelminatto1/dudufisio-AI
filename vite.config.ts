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
    port: 5175,
    host: 'localhost',
    hmr: {
      port: 5175,
      host: 'localhost',
      clientPort: 5175,
      overlay: true
    },
    watch: {
      usePolling: false,
      interval: 100
    },
    cors: true,
    strictPort: false,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    alias: {
      '@': path.resolve(__dirname, '.'),
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
      'react/jsx-dev-runtime',
      'react-router-dom',
      'lucide-react',
      '@radix-ui/react-slot',
      'clsx',
      'tailwind-merge'
    ],
    exclude: ['@playwright/test']
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    reportCompressedSize: true,
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
          // Otimização de chunks para melhor cache e performance
          // Split React packages separately to reduce react-vendor size
          if (id.includes('react-dom')) {
            return 'react-dom-vendor';
          }
          if (id.includes('react-router')) {
            return 'react-router-vendor';
          }
          if (id.includes('node_modules/react/') && !id.includes('react-dom') && !id.includes('react-router')) {
            return 'react-core-vendor';
          }
          if (id.includes('@radix-ui')) {
            return 'radix-vendor';
          }
          if (id.includes('lucide-react')) {
            return 'lucide-vendor';
          }
          if (id.includes('framer-motion')) {
            return 'framer-vendor';
          }
          if (id.includes('@google/generative-ai') || id.includes('groq-sdk')) {
            return 'ai-vendor';
          }
          if (id.includes('@supabase')) {
            return 'supabase-vendor';
          }
          if (id.includes('axios') || id.includes('resend')) {
            return 'http-vendor';
          }
          if (id.includes('recharts')) {
            return 'recharts-vendor';
          }
          if (id.includes('date-fns')) {
            return 'date-vendor';
          }
          if (id.includes('html2canvas')) {
            return 'canvas-vendor';
          }
          // Split PDF libraries to reduce pdf-vendor size
          if (id.includes('jspdf')) {
            return 'jspdf-vendor';
          }
          if (id.includes('html2pdf')) {
            return 'html2pdf-vendor';
          }
          if (id.includes('ics')) {
            return 'ics-vendor';
          }
          if (id.includes('bull') || id.includes('redis')) {
            return 'queue-vendor';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          // Chunks por funcionalidade
          if (id.includes('/pages/patient-portal/')) {
            return 'patient-portal';
          }
          if (id.includes('/pages/partner-portal/')) {
            return 'partner-portal';
          }
          if (id.includes('/components/acompanhamento/')) {
            return 'acompanhamento';
          }
          if (id.includes('/services/')) {
            return 'services';
          }
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    minify: 'terser', // Re-enable minification for production
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 600
  }
});
