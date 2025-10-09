import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  esbuild: {
    // Remove console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    logLevel: 'warning'
  },
  define: {
    'process.env': 'import.meta.env',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    '__DEV__': process.env.NODE_ENV !== 'production'
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
    force: false
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
        // Exclui scripts de build
        if (id.includes('/scripts/') || id.includes('\\scripts\\')) {
          return true;
        }
        return false;
      },
      output: {
        manualChunks: (id) => {
          // 🚀 OTIMIZAÇÃO AVANÇADA DE CODE SPLITTING

          // 1. React Core (sempre necessário)
          if (id.includes('node_modules/react/') && !id.includes('react-dom') && !id.includes('react-router')) {
            return 'react-core';
          }
          if (id.includes('react-dom')) {
            return 'react-dom';
          }
          if (id.includes('react-router')) {
            return 'react-router';
          }

          // 2. UI Libraries (carregadas sob demanda)
          if (id.includes('@radix-ui')) {
            return 'ui-radix';
          }
          if (id.includes('lucide-react')) {
            return 'ui-icons';
          }
          if (id.includes('framer-motion')) {
            return 'ui-animation';
          }

          // 3. Charts (só para dashboards)
          if (id.includes('recharts')) {
            return 'charts';
          }

          // 4. AI & ML (grande, carregar lazy)
          if (id.includes('@google/generative-ai') || id.includes('groq-sdk')) {
            return 'ai-models';
          }

          // 5. Backend Services (grande)
          if (id.includes('@supabase')) {
            return 'backend-supabase';
          }

          // 6. Forms & Validation
          if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
            return 'forms';
          }

          // 7. PDF/Export (muito grande, lazy)
          if (id.includes('jspdf')) {
            return 'export-pdf';
          }
          if (id.includes('html2pdf')) {
            return 'export-html2pdf';
          }
          if (id.includes('html2canvas')) {
            return 'export-canvas';
          }

          // 8. Calendar/Date
          if (id.includes('date-fns') || id.includes('ics')) {
            return 'calendar';
          }

          // 9. HTTP/Network
          if (id.includes('axios') || id.includes('resend')) {
            return 'network';
          }

          // 10. Notifications
          if (id.includes('react-toastify')) {
            return 'notifications';
          }

          // 11. Feature-based chunks (pages lazy loaded)
          if (id.includes('/pages/patient-portal/')) {
            return 'feature-patient-portal';
          }
          if (id.includes('/pages/partner-portal/')) {
            return 'feature-partner-portal';
          }
          if (id.includes('/pages/') && id.includes('Dashboard')) {
            return 'feature-dashboards';
          }
          if (id.includes('/pages/') && id.includes('Report')) {
            return 'feature-reports';
          }

          // 12. Components by domain
          if (id.includes('/components/medical-records/')) {
            return 'domain-medical';
          }
          if (id.includes('/components/financial/')) {
            return 'domain-financial';
          }
          if (id.includes('/components/analytics/')) {
            return 'domain-analytics';
          }
          if (id.includes('/components/agenda/')) {
            return 'domain-agenda';
          }

          // 13. Services (small chunks)
          if (id.includes('/services/ai/')) {
            return 'service-ai';
          }
          if (id.includes('/services/supabase/')) {
            return 'service-db';
          }
          if (id.includes('/services/') && !id.includes('ai') && !id.includes('supabase')) {
            return 'services-core';
          }

          // 14. Utilities
          if (id.includes('/lib/') || id.includes('/utils/')) {
            return 'utilities';
          }

          // 15. Vendor fallback (pequenos pacotes)
          if (id.includes('node_modules')) {
            return 'vendor-misc';
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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2, // Mais agressivo
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove console calls
        pure_getters: true,
        unsafe_arrows: true,
        unsafe_methods: true,
      },
      mangle: {
        safari10: true, // Compatibilidade Safari
      },
      format: {
        comments: false, // Remove todos os comentários
      },
    },
    chunkSizeWarningLimit: 500, // Mais restritivo
    cssCodeSplit: true, // Split CSS
    assetsInlineLimit: 4096, // Inline assets < 4kb
  }
});
