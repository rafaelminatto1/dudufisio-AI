import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    // Visualizer para análise de bundle
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    // Sentry plugin - APENAS UMA instância, condicional para evitar erros sem token
    process.env.SENTRY_AUTH_TOKEN && sentryVitePlugin({
      org: process.env.SENTRY_ORG || "activity-fisioterapia",
      project: process.env.SENTRY_PROJECT || "dudu-aiok",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: './dist/assets/**',
        filesToDeleteAfterUpload: './dist/assets/**/*.map'
      },
      telemetry: false,
      silent: !process.env.CI, // Verbose em CI, silencioso localmente
    })
  ].filter(Boolean), // Remove plugins undefined
  esbuild: {
    // Mantém console logs para debugging
    logLevel: 'warning',
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
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'scheduler', 'use-sync-external-store'],
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: {
      // 🔥 FIX: Força uso de apenas uma instância do React - ABSOLUTO
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, './node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve(__dirname, './node_modules/react/jsx-dev-runtime'),
      'scheduler': path.resolve(__dirname, './node_modules/scheduler'),
      'use-sync-external-store': path.resolve(__dirname, './node_modules/use-sync-external-store'),
      
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
      'scheduler',
      'use-sync-external-store',
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
      'react-toastify',
      // Tiptap extensions para evitar conflitos de bundling
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/extension-history',
      '@tiptap/extension-text-style',
      '@tiptap/extension-color',
      '@tiptap/extension-text-align',
      '@tiptap/extension-underline',
      '@tiptap/extension-link',
      '@tiptap/extension-image',
      '@tiptap/extension-table',
      '@tiptap/extension-table-row',
      '@tiptap/extension-table-cell',
      '@tiptap/extension-table-header'
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
      // NUNCA externalizar React - sempre incluir no bundle
      // Isso previne múltiplas instâncias do React
      external: (id) => {
        // Excluir scripts de build
        if (id.includes('/scripts/') || id.includes('\\scripts\\')) {
          return true;
        }
        // Excluir pacotes backend que foram removidos
        if (id.includes('whatsapp-web.js') ||
            id.includes('nodemailer') ||
            id.includes('express') ||
            id.includes('bull') ||
            id.includes('redis')) {
          return true;
        }
        return false;
      },
      output: {
        // Estratégia agressiva de code splitting com ordem de carregamento garantida
        manualChunks: (id) => {
          // PRIORIDADE 1: React Core Foundation (carrega primeiro)
          if (id.includes('node_modules/react/') && !id.includes('node_modules/react-router') && !id.includes('node_modules/react-dom')) {
            return 'vendor-react-core';
          }
          
          if (id.includes('node_modules/react-dom/') || 
              id.includes('node_modules/scheduler/') ||
              id.includes('node_modules/use-sync-external-store/')) {
            return 'vendor-react-dom';
          }
          
          // PRIORIDADE 2: React Router (carrega depois do core)
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }
          
          // PRIORIDADE 3: React Libraries (dependem do core)
          if (id.includes('node_modules/@tanstack/react')) {
            return 'vendor-tanstack';
          }
          
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix';
          }
          
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/zod') || id.includes('node_modules/@hookform')) {
            return 'vendor-forms';
          }
          
          // Heavy Libraries - Separar em chunks individuais
          if (id.includes('node_modules/@tiptap') || id.includes('node_modules/prosemirror')) {
            return 'lib-editor';
          }
          
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas') || id.includes('node_modules/html2pdf')) {
            return 'lib-pdf';
          }
          
          if (id.includes('node_modules/recharts')) {
            return 'vendor-charts';
          }
          
          // Supabase & Auth
          if (id.includes('node_modules/@supabase') || id.includes('node_modules/@stripe')) {
            return 'vendor-backend';
          }
          
          // UI Libraries
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/framer-motion')) {
            return 'vendor-ui';
          }
          
          // Utilities
          if (id.includes('node_modules/date-fns')) {
            return 'vendor-date';
          }
          
          // Crypto & Security
          if (id.includes('node_modules/@noble') || id.includes('node_modules/uuid') || id.includes('node_modules/crypto-js') || id.includes('node_modules/jsonwebtoken')) {
            return 'vendor-crypto';
          }
          
          // AWS & Monitoring
          if (id.includes('node_modules/@aws-sdk') || id.includes('node_modules/@smithy')) {
            return 'vendor-aws';
          }
          
          if (id.includes('node_modules/@sentry') || id.includes('node_modules/@opentelemetry')) {
            return 'vendor-monitoring';
          }
          
          // Consolidar resto dos vendors
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
          
          // NÃO consolidar páginas - deixar React.lazy() gerenciar
          // NÃO consolidar serviços - permitir tree shaking
          
          // Consolidar apenas componentes UI pequenos
          if (id.includes('/components/ui/') || id.includes('/components/layout/')) {
            return 'app-ui-components';
          }
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name;
          
          // Ordem de prioridade com prefixos alfanuméricos
          const priorityMap: Record<string, string> = {
            'vendor-react-core': '00-',
            'vendor-react-dom': '01-',
            'vendor-router': '02-',
            'vendor-tanstack': '03-',
            'vendor-radix': '04-',
            'vendor-forms': '05-',
            'vendor-backend': '06-',
            'vendor-ui': '07-',
            'vendor-date': '08-',
            'vendor-crypto': '09-',
            'lib-editor': '10-',
            'lib-pdf': '11-',
            'vendor-charts': '12-',
            'vendor-aws': '13-',
            'vendor-monitoring': '14-',
            'vendor-misc': '15-',
            'app-ui-components': '16-'
          };
          
          const prefix = priorityMap[name] || '';
          return `assets/${prefix}${name}-[hash].js`;
        },
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      // Tree shaking agressivo - OTIMIZADO
      treeshake: {
        moduleSideEffects: false,
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