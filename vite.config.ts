import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      babel: {
        plugins: [],
      },
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
    exclude: ['@playwright/test', 'lucide-react'],
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
        // Exclui pacotes backend que foram removidos
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
        // Code splitting otimizado - CONSOLIDADO para reduzir número de chunks
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

          // CONSOLIDAR todos os outros node_modules em um único chunk
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }

          // CONSOLIDAR todas as páginas em chunks maiores por funcionalidade
          if (id.includes('/pages/')) {
            // Páginas de pacientes
            if (id.includes('Patient') || id.includes('Acompanhamento') || id.includes('Session') || id.includes('Atendimento')) {
              return 'pages-patients';
            }
            // Páginas de agenda
            if (id.includes('Agenda') || id.includes('Event') || id.includes('Teleconsulta')) {
              return 'pages-scheduling';
            }
            // Páginas de exercícios e protocolos
            if (id.includes('Exercise') || id.includes('Protocol') || id.includes('Assessment') || id.includes('Treatment')) {
              return 'pages-clinical';
            }
            // Páginas financeiras e administrativas
            if (id.includes('Financial') || id.includes('Inventory') || id.includes('Supplies') || id.includes('Backup') || id.includes('Audit')) {
              return 'pages-admin';
            }
            // Páginas de dashboard e relatórios
            if (id.includes('Dashboard') || id.includes('Report') || id.includes('Analytics') || id.includes('Performance')) {
              return 'pages-dashboards';
            }
            // Páginas de parceiros e comunicação
            if (id.includes('Partner') || id.includes('Communication') || id.includes('WhatsApp') || id.includes('Notification')) {
              return 'pages-communication';
            }
            // Todas as outras páginas
            return 'pages-other';
          }

          // CONSOLIDAR serviços
          if (id.includes('/services/')) {
            return 'app-services';
          }

          // CONSOLIDAR componentes
          if (id.includes('/components/')) {
            return 'app-components';
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