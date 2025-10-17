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

          // Monitoring & Observability (Sentry + OpenTelemetry)
          if (id.includes('node_modules/@sentry') ||
              id.includes('node_modules/@opentelemetry')) {
            return 'vendor-monitoring';
          }

          // AWS SDK & Dependencies (@aws-sdk, @smithy)
          if (id.includes('node_modules/@aws-sdk') ||
              id.includes('node_modules/@smithy')) {
            return 'vendor-aws';
          }

          // React Ecosystem Extras (@tanstack, @floating-ui)
          if (id.includes('node_modules/@tanstack') ||
              id.includes('node_modules/@floating-ui') ||
              id.includes('node_modules/react-toastify')) {
            return 'vendor-react-extras';
          }

          // Crypto & Security (@noble, uuid, crypto-js)
          if (id.includes('node_modules/@noble') ||
              id.includes('node_modules/uuid') ||
              id.includes('node_modules/crypto-js')) {
            return 'vendor-crypto';
          }

          // CONSOLIDAR todos os outros node_modules em um único chunk
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }

          // NÃO consolidar páginas - deixar React Lazy Loading fazer o trabalho
          // Páginas serão code-split automaticamente via React.lazy()

          // CATEGORIZAR serviços por domínio (68 serviços divididos em 6 categorias)
          if (id.includes('/services/')) {
            // Serviços de IA - pesados, ficam separados
            if (id.includes('geminiService') ||
                id.includes('groqService') ||
                id.includes('xaiService') ||
                id.includes('clinicalContentService')) {
              return; // Não consolidar - permitir lazy loading
            }

            // Serviços de pacientes e clínica (~150KB)
            if (id.includes('patientService') ||
                id.includes('bodyMapService') ||
                id.includes('acompanhamentoService') ||
                id.includes('sessionService') ||
                id.includes('treatmentService') ||
                id.includes('soapNoteService')) {
              return 'services-patient';
            }

            // Serviços de exercícios e protocolos (~120KB)
            if (id.includes('exerciseService') ||
                id.includes('exerciseProtocolService') ||
                id.includes('exerciseLibraryService') ||
                id.includes('integratedExerciseService') ||
                id.includes('integratedProtocolsService') ||
                id.includes('integratedAssessmentService')) {
              return 'services-exercise';
            }

            // Serviços de comunicação (~80KB)
            if (id.includes('whatsappService') ||
                id.includes('whatsappLogService') ||
                id.includes('emailService') ||
                id.includes('notificationService') ||
                id.includes('commentService')) {
              return 'services-communication';
            }

            // Serviços financeiros e administrativos (~100KB)
            if (id.includes('financialService') ||
                id.includes('voucherService') ||
                id.includes('inventoryService') ||
                id.includes('suppliesService') ||
                id.includes('partnershipService')) {
              return 'services-admin';
            }

            // Serviços de agendamento (~80KB)
            if (id.includes('appointmentService') ||
                id.includes('availabilityService') ||
                id.includes('waitlistService') ||
                id.includes('schedulingService')) {
              return 'services-scheduling';
            }

            // Todos os outros serviços compartilhados (utils, auth, etc)
            return 'services-utils';
          }

          // CONSOLIDAR apenas componentes UI PEQUENOS (não páginas ou features)
          if (id.includes('/components/')) {
            // Componentes pesados ficam separados
            if (id.includes('BodyMapContainer') ||
                id.includes('TiptapEditor') ||
                id.includes('ConsolidatedAITools') ||
                id.includes('MedicalRecordsDashboard') ||
                id.includes('ClinicalReportsGenerator')) {
              return; // Não consolidar - permitir lazy loading
            }
            // Apenas componentes UI pequenos
            if (id.includes('/components/ui/') || id.includes('/components/layout/')) {
              return 'app-ui-components';
            }
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