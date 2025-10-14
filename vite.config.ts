import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic',
    jsxImportSource: 'react',
    babel: {
      plugins: [],
    },
  }), // Sentry plugin para upload de source maps
  visualizer({
    filename: './dist/stats.html',
    open: false,
    gzipSize: true,
    brotliSize: true,
  }), sentryVitePlugin({
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    sourcemaps: {
      assets: './dist/assets/**',
      filesToDeleteAfterUpload: './dist/assets/**/*.map'
    },
    telemetry: false,
    silent: true,
  }), sentryVitePlugin({
    org: "activity-fisioterapia",
    project: "dudu-aiok"
  }), sentryVitePlugin({
    org: "activity-fisioterapia",
    project: "dudu-aiok"
  })],
  esbuild: {
    // Mantém console logs para debugging
    logLevel: 'warning',
    jsx: 'automatic'
  },
  define: {
    'process.env': 'import.meta.env',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    '__DEV__': process.env.NODE_ENV !== 'production'
  },
  server: {
    port: 5176,
    host: 'localhost',
    hmr: {
      port: 5176,
      host: 'localhost',
      clientPort: 5176,
      overlay: true
    },
    watch: {
      usePolling: false,
      interval: 100
    },
    cors: true,
    strictPort: true,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: {
      // 🔥 FIX: Força uso de apenas uma instância do React
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, './node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve(__dirname, './node_modules/react/jsx-dev-runtime'),
      
      // Aliases do projeto
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
      'framer-motion',
      'lucide-react',
      '@radix-ui/react-slot',
      'clsx',
      'tailwind-merge',
      'recharts',
      '@radix-ui/react-tabs',
      'react-hook-form',
      '@hookform/resolvers/zod',
      'zod',
      'react-icons/md',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-slider',
      '@radix-ui/react-select',
      '@radix-ui/react-label',
      '@radix-ui/react-dialog',
      'react-toastify'
    ],
    exclude: ['@playwright/test'],
    // Otimização forçada apenas quando necessário
    force: false,
    esbuildOptions: {
      jsx: 'automatic',
      // Garante que React seja tratado como ESM
      mainFields: ['module', 'main'],
    }
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    reportCompressedSize: true,
    rollupOptions: {
      external: (id) => {
        // Previne múltiplas instâncias do React
        if (id.includes('react') && !id.startsWith('./') && !id.startsWith('../')) {
          return false;
        }
        // Exclui scripts de build
        if (id.includes('/scripts/') || id.includes('\\scripts\\')) {
          return true;
        }
        return false;
      },
      output: {
        // Code splitting otimizado para reduzir tamanho dos chunks
        manualChunks: (id) => {
          // Vendor chunks - React ecosystem
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }
          
          // UI libraries
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/framer-motion')) {
            return 'vendor-ui';
          }
          
          // Forms
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/zod') || id.includes('node_modules/@hookform')) {
            return 'vendor-forms';
          }
          
          // Charts
          if (id.includes('node_modules/recharts')) {
            return 'vendor-charts';
          }
          
          // Heavy libraries - Editor
          if (id.includes('node_modules/@tiptap') || id.includes('node_modules/prosemirror')) {
            return 'lib-editor';
          }
          
          // Heavy libraries - PDF
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) {
            return 'lib-pdf';
          }
          
          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          
          // Date utilities
          if (id.includes('node_modules/date-fns')) {
            return 'vendor-date';
          }
          
          // Radix UI
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix';
          }
          
          // Feature chunks baseados em paths
          if (id.includes('/services/crm/') || id.includes('/components/crm/')) {
            return 'feature-crm';
          }
          
          if (id.includes('/services/whatsapp/') || id.includes('/components/whatsapp/')) {
            return 'feature-whatsapp';
          }
          
          if (id.includes('/services/analytics/') || id.includes('/components/analytics/')) {
            return 'feature-analytics';
          }
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      // Tree shaking agressivo
      treeshake: {
        moduleSideEffects: (id) => {
          // Preserve side effects apenas onde necessário
          return id.includes('index.css') ||
                 id.includes('.css') ||
                 id.includes('react-toastify');
        },
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      }
    },
    minify: 'esbuild',
    chunkSizeWarningLimit: 500, // Mais restritivo
    cssCodeSplit: true, // Split CSS
    assetsInlineLimit: 4096, // Inline assets < 4kb
  }
});