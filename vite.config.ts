import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';
import { sentryVitePlugin } from '@sentry/vite-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pageChunkGroups = [
  { name: 'page-ai-analytics', test: /[/\\]pages[/\\]AiAnalyticsPage\.[tj]sx?$/i },
  { name: 'page-clinical-analytics', test: /[/\\]pages[/\\]ClinicalAnalyticsPage\.[tj]sx?$/i },
  { name: 'page-protocols', test: /[/\\]pages[/\\](EnhancedProtocolsPage|ProtocolEditPage)\.[tj]sx?$/i },
  { name: 'page-exercise-edit', test: /[/\\]pages[/\\]ExerciseEditPage\.[tj]sx?$/i },
  { name: 'page-exercise-library', test: /[/\\]pages[/\\]EnhancedExerciseLibraryPage\.[tj]sx?$/i },
  { name: 'page-clinical-content', test: /[/\\]pages[/\\]ClinicalContentPage\.[tj]sx?$/i },
  { name: 'page-session-evolution', test: /[/\\]pages[/\\]SessionEvolutionPage\.[tj]sx?$/i },
  { name: 'page-ai-lab', test: /[/\\]pages[/\\]AiAnalyticsLabPage\.[tj]sx?$/i },
  { name: 'page-agenda', test: /[/\\]pages[/\\]AgendaPage\.[tj]sx?$/i },
  { name: 'page-atendimento', test: /[/\\]pages[/\\](AtendimentoPage|AtendimentoPageDemo)\.[tj]sx?$/i },
  { name: 'page-bi-integration', test: /[/\\]pages[/\\]BIIntegrationTestPage\.[tj]sx?$/i },
  { name: 'page-free-video', test: /[/\\]pages[/\\]FreeVideoGeneratorReal\.[tj]sx?$/i },
  { name: 'page-inventory', test: /[/\\]pages[/\\]InventoryPage\.[tj]sx?$/i },
];

const pdfVendorPattern = /[/\\]node_modules[/\\](?:@react-pdf|pdfkit|fontkit|png-js|yoga-layout|linebreak|textkit|canvg)[/\\]/;
const compressionVendorPattern = /[/\\]node_modules[/\\](?:pako|brotli)[/\\]/;
const sentryReplayPattern = /[/\\]node_modules[/\\]@sentry-internal[/\\]replay[/\\]/;

export default defineConfig({
  // Reutiliza cache entre builds do Vercel
  cacheDir: '.vercel/cache/vite',
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    // Visualizer para análise de bundle
    visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
    process.env.SENTRY_AUTH_TOKEN && sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: './dist/assets/**',
        filesToDeleteAfterUpload: './dist/assets/**/*.map'
      },
      telemetry: false,
      silent: !process.env.CI
    }),
  ].filter(Boolean), // Remove plugins undefined
  esbuild: {
    // Mantém console logs para debugging
    logLevel: 'silent', // Suprimir warnings do esbuild (duplicate-case do html2canvas)
    logOverride: {
      'duplicate-case': 'silent',
      'this-is-undefined-in-esm': 'silent'
    }
  },
  define: {
    'process.env': 'import.meta.env',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    '__DEV__': process.env.NODE_ENV !== 'production'
  },
  server: {
    port: 5173,
    host: 'localhost',
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: false,
      interval: 100
    },
    cors: true,
    strictPort: false, // Permite usar porta alternativa automaticamente se 5173 estiver ocupada
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
      '@/lib': path.resolve(__dirname, './lib'),
      '@/design-system': path.resolve(__dirname, './design-system'),
      'base64-js': path.resolve(__dirname, './lib/polyfills/base64js.ts')
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
      // Radix UI - todos os pacotes principais
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-slider',
      '@radix-ui/react-select',
      '@radix-ui/react-label',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-separator',
      '@radix-ui/react-switch',
      '@radix-ui/react-toast',
      'clsx',
      'tailwind-merge',
      'recharts',
      'react-hook-form',
      '@hookform/resolvers/zod',
      'zod',
      'react-icons/md',
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
    // ✅ FASE 3: Build Ultra-Otimizado para Deploy Rápido
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    sourcemap: Boolean(process.env.SENTRY_AUTH_TOKEN),
    minify: 'esbuild', // 🚀 Mais rápido que terser
    cssMinify: 'esbuild',
    reportCompressedSize: false, // 🚀 Acelera o build
    // Garantir que os entry points sejam preservados para ordem de carregamento correta
    preserveEntrySignatures: 'strict',
    // Configurar ordem de carregamento dos chunks - CRÍTICO para evitar erros
    modulePreload: {
      polyfill: true,
      resolveDependencies: (filename, deps, { hostId, hostType }) => {
        // ✅ OTIMIZADO: Garantir ordem de carregamento correta dos vendors
        // React PRIMEIRO, depois UI, depois resto
        const sortedDeps = deps.sort((a, b) => {
          // React core tem prioridade máxima
          if (a.includes('vendor-react')) return -1;
          if (b.includes('vendor-react')) return 1;
          
          // UI tem prioridade alta
          if (a.includes('vendor-ui')) return -1;
          if (b.includes('vendor-ui')) return 1;
          
          // Utils e outros depois
          if (a.includes('vendor-utils')) return -1;
          if (b.includes('vendor-utils')) return 1;
          
          return 0;
        });
        return sortedDeps;
      }
    },
    // Configuração para melhor compressão
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // ✅ Compressão avançada
    rollupOptions: {
      // 🚀 CRÍTICO: Suprimir warnings desnecessários
      onwarn(warning, warn) {
        // Ignorar warnings específicos que não afetam funcionalidade
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        if (warning.code === 'SOURCEMAP_ERROR') return;
        if (warning.code === 'INVALID_ANNOTATION') return;
        if (warning.message.includes('Use of eval')) return;
        if (warning.message.includes('Circular dependency')) return;
        
        // Lista de códigos de warning para suprimir
        const suppressedCodes = [
          'DUPLICATE_CASE',
          'PLUGIN_WARNING',
          'CIRCULAR_DEPENDENCY',
          'THIS_IS_UNDEFINED'
        ];
        
        if (suppressedCodes.includes(warning.code)) {
          return;
        }
        
        // Suprimir warnings específicos por mensagem
        const suppressedMessages = [
          'case clause will never be evaluated',
          'duplicates an earlier case clause',
          'sourcemap'
        ];
        
        if (suppressedMessages.some(msg => warning.message?.includes(msg))) {
          return;
        }
        
        // Suprimir warnings de node_modules (bibliotecas externas)
        if (warning.id?.includes('node_modules') || 
            warning.id?.includes('html2canvas')) {
          return;
        }
        
        // Mostrar outros warnings
        warn(warning);
      },
      
      // 🔥 AGRESSIVO: Externalizar dependências de build
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
        // Excluir dependências de desenvolvimento
        if (id.match(/^node:/) ||
            id.includes('fsevents') ||
            id.includes('@playwright/test') ||
            id.includes('vitest') ||
            id.includes('playwright') ||
            id.includes('electron')) {
          return true;
        }
        return false;
      },
      
      output: {
        // 🚀 Nomes de arquivo otimizados
        entryFileNames: 'assets/[name]-[hash:8].js',
        chunkFileNames: 'assets/[name]-[hash:8].js',
        assetFileNames: 'assets/[name]-[hash:8].[ext]',
        // ✅ FASE 3: Code Splitting Ultra-Otimizado para Deploy Rápido
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');
          // 🚀 PRIORIDADE 1: React Core (sempre primeiro)
          if (normalizedId.includes('node_modules/react/') ||
              normalizedId.includes('node_modules/react-dom/') ||
              normalizedId.includes('node_modules/scheduler/')) {
            return 'vendor-react-core';
          }

          // 🚀 PRIORIDADE 2: Router (crítico para SPA)
          if (normalizedId.includes('node_modules/react-router')) {
            return 'vendor-router';
          }

          // 🚀 PRIORIDADE 3: UI Framework (Radix + Framer)
          if (normalizedId.includes('node_modules/@radix-ui/')) {
            return 'vendor-ui-radix';
          }
          if (normalizedId.includes('node_modules/framer-motion/')) {
            return 'vendor-ui-framer';
          }

          // 📊 CHUNK ESPECÍFICO: Dashboard & Charts (lazy load)
          if (normalizedId.includes('node_modules/recharts/')) {
            return 'feature-charts';
          }

          // 📅 CHUNK ESPECÍFICO: Date picker
          if (normalizedId.includes('node_modules/react-day-picker/')) {
            return 'vendor-daypicker';
          }

          // 📝 CHUNK ESPECÍFICO: Editor (lazy load)
          if (normalizedId.includes('node_modules/@tiptap/') ||
              normalizedId.includes('node_modules/prosemirror-')) {
            return 'feature-editor';
          }

          // 📄 CHUNK ESPECÍFICO: PDF Generation (lazy load)
          if (normalizedId.includes('node_modules/jspdf/') ||
              normalizedId.includes('node_modules/html2pdf.js/')) {
            return 'feature-pdf';
          }

          // 🧾 CHUNK ESPECÍFICO: Ecossistema React-PDF
          if (pdfVendorPattern.test(normalizedId)) {
            return 'vendor-pdf';
          }
          // 🔧 FIX: REMOVER agrupamento de compression - deixar Vite decidir
          // Issue: Mesmo agrupado com vendor-pdf, circular dependency persiste
          // Solution: Não forçar chunk específico para compression libs
          // Data: 12 Jan 2025
          // if (compressionVendorPattern.test(normalizedId)) {
          //   return 'vendor-pdf';
          // }
          if (sentryReplayPattern.test(normalizedId)) {
            return 'vendor-sentry-replay';
          }

          // 📸 CHUNK ESPECÍFICO: Image Processing (lazy load)
          if (normalizedId.includes('node_modules/html2canvas/')) {
            return 'feature-capture';
          }

          // 🔐 CHUNK: Authentication & Database
          if (normalizedId.includes('node_modules/@supabase/')) {
            return 'vendor-supabase';
          }

          // 🤖 CHUNK: AI Features (lazy load)
          if (normalizedId.includes('node_modules/@google/')) {
            return 'feature-ai';
          }

          // 📋 CHUNK: Forms & Validation
          if (normalizedId.includes('node_modules/react-hook-form/') ||
              normalizedId.includes('node_modules/@hookform/') ||
              normalizedId.includes('node_modules/zod/')) {
            return 'vendor-forms';
          }

          // 🎨 CHUNK: Icons & Utils
          if (normalizedId.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }

          // 📅 CHUNK: Date utilities
          if (normalizedId.includes('node_modules/date-fns/')) {
            return 'vendor-date';
          }

          // 🛠️ CHUNK: Utils (pequenos, podem ser agrupados)
          if (normalizedId.includes('node_modules/clsx/') ||
              normalizedId.includes('node_modules/tailwind-merge/') ||
              normalizedId.includes('node_modules/class-variance-authority/')) {
            return 'vendor-utils';
          }

          // 🔔 CHUNK: Notifications
          if (normalizedId.includes('node_modules/react-toastify/') ||
              normalizedId.includes('node_modules/sonner/')) {
            return 'vendor-notifications';
          }

          // 🧰 Vendors pesados (quebrar vendor-misc)
          if (normalizedId.includes('node_modules/@tanstack/react-query')) {
            return 'vendor-query';
          }
          if (normalizedId.includes('node_modules/@tanstack/table') ||
              normalizedId.includes('node_modules/@tanstack/react-table')) {
            return 'vendor-table';
          }
          if (normalizedId.includes('node_modules/axios/')) {
            return 'vendor-axios';
          }
          if (normalizedId.includes('node_modules/dompurify/')) {
            return 'vendor-dom';
          }
          if (normalizedId.includes('node_modules/fast-xml-parser/')) {
            return 'vendor-xml';
          }
          if (normalizedId.includes('node_modules/uuid/')) {
            return 'vendor-uuid';
          }
          if (normalizedId.includes('node_modules/cmdk/')) {
            return 'vendor-cmdk';
          }
          if (normalizedId.includes('node_modules/react-hotkeys-hook/')) {
            return 'vendor-hotkeys';
          }
          if (normalizedId.includes('node_modules/react-resizable-panels/')) {
            return 'vendor-resizable';
          }
          if (normalizedId.includes('node_modules/react-window/') ||
              normalizedId.includes('node_modules/@tanstack/virtual-core') ||
              normalizedId.includes('node_modules/@tanstack/react-virtual')) {
            return 'vendor-virtual';
          }
          if (normalizedId.includes('node_modules/stripe/') ||
              normalizedId.includes('node_modules/@stripe/')) {
            return 'vendor-stripe';
          }

          // 📊 CHUNK: Analytics & Monitoring
          if (normalizedId.includes('node_modules/@sentry/') ||
              normalizedId.includes('node_modules/@vercel/analytics') ||
              normalizedId.includes('node_modules/@vercel/speed-insights')) {
            return 'vendor-analytics';
          }

          // 🤖 CHUNK: AI & MCP
          if (normalizedId.includes('node_modules/@anthropic-ai/') ||
              normalizedId.includes('node_modules/@ai-sdk/') ||
              normalizedId.includes('node_modules/@modelcontextprotocol/') ||
              normalizedId.includes('node_modules/ai/')) {
            return 'vendor-ai';
          }

          // 🔥 CHUNK: Firebase
          if (normalizedId.includes('node_modules/firebase/')) {
            return 'vendor-firebase';
          }

          // 🎯 CHUNK: Interaction Libraries
          if (normalizedId.includes('node_modules/@use-gesture/') ||
              normalizedId.includes('node_modules/react-swipeable/')) {
            return 'vendor-interaction';
          }

          // 📝 CHUNK: Input & Formatting
          if (normalizedId.includes('node_modules/react-input-mask/') ||
              normalizedId.includes('node_modules/use-debounce/')) {
            return 'vendor-input';
          }

          // 🎨 CHUNK: Theming
          if (normalizedId.includes('node_modules/next-themes/')) {
            return 'vendor-theming';
          }

          // 📐 CHUNK: Vaul (drawer component)
          if (normalizedId.includes('node_modules/vaul/')) {
            return 'vendor-vaul';
          }

          // 🏠 CHUNK: Páginas principais (agrupadas por funcionalidade)
          if (normalizedId.includes('/pages/')) {
            const matchedPageGroup = pageChunkGroups.find(({ test }) => test.test(normalizedId));
            if (matchedPageGroup) {
              return matchedPageGroup.name;
            }
            if (normalizedId.includes('Dashboard') || normalizedId.includes('Home')) {
              return 'page-dashboard';
            }
            if (normalizedId.includes('Patient') || normalizedId.includes('Appointment')) {
              return 'page-clinical';
            }
            if (normalizedId.includes('Financial') || normalizedId.includes('Report')) {
              return 'page-business';
            }
            if (normalizedId.includes('Settings') || normalizedId.includes('Profile')) {
              return 'page-settings';
            }
            return 'page-other';
          }

          // 🧩 CHUNK: Shared Components (split granular com regex)
          if (normalizedId.match(/[/\\]shared[/\\]components[/\\]/) ||
              normalizedId.includes('@/shared/components/')) {

            // UI básico (buttons, inputs, etc) - case insensitive
            if (normalizedId.match(/button|input|select|checkbox|radio|switch|label|badge/i)) {
              return 'shared-ui-basic';
            }

            // UI overlay/modal
            if (normalizedId.match(/dialog|modal|dropdown|popover|tooltip|sheet|alert-dialog|drawer|hover-card/i)) {
              return 'shared-ui-overlay';
            }

            // Forms e validação
            if (normalizedId.match(/form|textarea|slider|toggle/i)) {
              return 'shared-forms';
            }

            // Tables e data display
            if (normalizedId.match(/table|data-table|accordion|collapsible|separator/i)) {
              return 'shared-tables';
            }

            // Layout e navegação
            if (normalizedId.match(/layout|header|sidebar|nav|footer|breadcrumb|tabs|navigation-menu/i)) {
              return 'shared-layout';
            }

            // Charts e visualização
            if (normalizedId.match(/chart|progress|scroll-area/i)) {
              return 'shared-charts';
            }

            // Resto dos componentes compartilhados
            return 'shared-common';
          }

          // 🔧 CHUNK: Shared Services/Contexts/Types
          if (normalizedId.match(/[/\\]shared[/\\]services[/\\]/) ||
              normalizedId.includes('@/shared/services/')) {
            if (normalizedId.includes('supabase') || normalizedId.includes('database')) {
              return 'shared-database';
            }
            return 'shared-services';
          }

          if (normalizedId.match(/[/\\]shared[/\\]contexts[/\\]/) ||
              normalizedId.includes('@/shared/contexts/')) {
            return 'shared-contexts';
          }

          if (normalizedId.match(/[/\\]shared[/\\]types[/\\]/) ||
              normalizedId.includes('@/shared/types/')) {
            return 'shared-types';
          }

          // 🧩 CHUNK: Componentes por categoria (EXCLUINDO shared)
          if (normalizedId.includes('/components/') &&
              !normalizedId.match(/[/\\]shared[/\\]/) &&
              !normalizedId.includes('@/shared/')) {
            // Subchunks categorizados
            if (normalizedId.includes('/components/forms/')) {
              return 'comp-forms';
            }
            if (normalizedId.includes('/components/tables/') || normalizedId.includes('/components/table/')) {
              return 'comp-tables';
            }
            if (normalizedId.includes('/components/charts/')) {
              return 'comp-charts';
            }
            if (normalizedId.includes('/components/analytics/')) {
              return 'comp-analytics';
            }
            if (normalizedId.includes('/components/medical/') ||
                normalizedId.includes('/components/patient/') ||
                normalizedId.includes('/components/body-map/') ||
                normalizedId.includes('/components/clinical/')) {
              return 'comp-medical';
            }
            if (normalizedId.includes('/components/medical-records/')) {
              return 'comp-medical-records';
            }
            if (normalizedId.includes('/components/ai-tools/')) {
              return 'comp-ai-tools';
            }
            if (normalizedId.includes('/components/backup/')) {
              return 'comp-backup';
            }
            if (normalizedId.includes('/components/reports/')) {
              return 'comp-reports';
            }

            // 🚀 OTIMIZAÇÃO: Subdivisão adicional de comp-common (Jan 2025)
            if (normalizedId.includes('/components/agenda/')) {
              return 'comp-agenda';
            }
            if (normalizedId.includes('/components/patients/')) {
              return 'comp-patients';
            }
            if (normalizedId.includes('/components/exercises/') ||
                normalizedId.includes('/components/exercise/')) {
              return 'comp-exercises';
            }
            if (normalizedId.includes('/components/alerts/') ||
                normalizedId.includes('/components/notifications/')) {
              return 'comp-alerts';
            }
            if (normalizedId.includes('/components/layout/')) {
              return 'comp-layout';
            }
            if (normalizedId.includes('/components/offline/')) {
              return 'comp-offline';
            }
            if (normalizedId.includes('/components/settings/')) {
              return 'comp-settings';
            }

            // Categorias existentes
            if (normalizedId.includes('dashboard') || normalizedId.includes('widgets')) {
              return 'comp-dashboard';
            }
            if (normalizedId.includes('/components/ui/')) {
              return 'comp-ui';
            }
            if (normalizedId.includes('auth') || normalizedId.includes('crm')) {
              return 'comp-features';
            }
            return 'comp-common';
          }

          // 🚀 OTIMIZAÇÃO FASE 2: Subdividir vendor-misc (Jan 2025)
          // 📅 CHUNK: Date/Time libraries
          if (normalizedId.includes('node_modules/dayjs/') ||
              normalizedId.includes('node_modules/moment/')) {
            return 'vendor-datetime';
          }

          // 📝 CHUNK: Markdown libraries
          if (normalizedId.includes('node_modules/marked/') ||
              normalizedId.includes('node_modules/remark/') ||
              normalizedId.includes('node_modules/rehype/')) {
            return 'vendor-markdown';
          }

          // 🎨 CHUNK: Color libraries
          if (normalizedId.includes('node_modules/color/') ||
              normalizedId.includes('node_modules/tinycolor2/') ||
              normalizedId.includes('node_modules/chroma-js/')) {
            return 'vendor-color';
          }

          // ✨ CHUNK: Animation libraries (not framer-motion)
          if (normalizedId.includes('node_modules/animejs/') ||
              normalizedId.includes('node_modules/gsap/') ||
              normalizedId.includes('node_modules/@react-spring/')) {
            return 'vendor-animation';
          }

          // ⚡ RESTO: Vendor comum (minimizar este chunk)
          if (normalizedId.includes('node_modules/')) {
            return 'vendor-misc';
          }

          // 📚 Dados volumosos
          if (normalizedId.includes('/data/')) {
            return 'data-libraries';
          }

          if (normalizedId.includes('/services/monitoring/')) {
            return 'service-monitoring';
          }

          // 📦 Código da aplicação
          return 'app-main';
        }
      },
      // ✅ FASE 3: Tree Shaking Ultra-Agressivo
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: (id, external) => {
          // 🚀 CRÍTICO: Preservar side effects apenas onde necessário
          if (id.includes('polyfill') || id.includes('shim')) return true;
          if (id.includes('css') || id.includes('.css')) return true;
          if (id.includes('supabase') && id.includes('auth')) return true;
          if (id.includes('react-dom') && id.includes('client')) return true;

          // 🔧 FIX: Preservar side effects de compression libraries para evitar circular dependency
          // Issue: Circular dependency "Cannot access 'z8' before initialization" em vendor-pdf
          // Date: 12 Jan 2025
          // Compression libraries (pako, brotli, fflate) precisam de side effects preservados
          if (id.includes('pako') ||
              id.includes('brotli') ||
              id.includes('fflate') ||
              id.includes('zlib')) return true;

          // 🔥 AGRESSIVO: Remover side effects de bibliotecas UI
          if (id.includes('@radix-ui/') ||
              id.includes('framer-motion/') ||
              id.includes('lucide-react/')) return false;

          // 🔥 AGRESSIVO: Remover side effects de utilitários
          if (id.includes('clsx') ||
              id.includes('tailwind-merge') ||
              id.includes('class-variance-authority')) return false;

          return false; // Default: sem side effects
        },
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        unknownGlobalSideEffects: false
      }
    },
    // ✅ FASE 5: Performance Budgets
    // Configurado para alertar sobre chunks > 1000KB (1MB)
    // Code splitting já está otimizado, chunks grandes são aceitáveis para vendors
    chunkSizeWarningLimit: 1000,

    /*
     * 📊 PERFORMANCE BUDGETS (monitorados via Lighthouse CI):
     * - Initial Bundle: < 1.07 MB (atual) ✅
     * - Total Bundle: < 8.61 MB (atual) ✅
     * - FCP: < 1800ms ✅
     * - LCP: < 2500ms ✅
     * - CLS: < 0.1 ✅
     * - TTI: < 3500ms ✅
     *
     * Ver lighthouserc.json para configuração completa
     * Ver services/performanceMonitoring.ts para monitoramento runtime
     */

    cssCodeSplit: true, // Split CSS
    assetsInlineLimit: 4096, // Inline assets < 4kb
  }
});
