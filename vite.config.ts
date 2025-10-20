import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
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
    }),
    // Plugin para garantir ordem de carregamento dos chunks
    {
      name: 'ensure-react-core-first',
      generateBundle(options, bundle) {
        // Este plugin garante que o vendor-react-core seja carregado primeiro
        // A ordem é determinada pelas dependências entre os módulos
        // Mas podemos garantir que o chunk seja referenciado primeiro no HTML
      },
      writeBundle() {
        // Modificar o HTML após o build para garantir ordem de carregamento
        const htmlPath = path.resolve(__dirname, 'dist/index.html');
        if (fs.existsSync(htmlPath)) {
          let html = fs.readFileSync(htmlPath, 'utf-8');
          
          // Extrair todos os modulepreload links
          const preloadRegex = /<link rel="modulepreload"[^>]*>/g;
          const preloads = html.match(preloadRegex) || [];
          
          // Separar vendor-react-core dos outros
          const reactCorePreload = preloads.find(p => p.includes('vendor-react-core'));
          const otherPreloads = preloads.filter(p => !p.includes('vendor-react-core'));
          
          // Remover todos os preloads
          html = html.replace(preloadRegex, '');
          
          // Reinserir na ordem correta: vendor-react-core primeiro
          if (reactCorePreload) {
            const insertPoint = html.indexOf('<script type="module"');
            if (insertPoint !== -1) {
              html = html.slice(0, insertPoint) + 
                     reactCorePreload + '\n' +
                     otherPreloads.join('\n') + '\n' +
                     html.slice(insertPoint);
            }
          }
          
          fs.writeFileSync(htmlPath, html);
        }
      }
    }
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
    target: 'es2020',
    sourcemap: true,
    reportCompressedSize: true,
    // Garantir que os entry points sejam preservados para ordem de carregamento correta
    preserveEntrySignatures: 'strict',
    // Configurar ordem de carregamento dos chunks
    modulePreload: {
      polyfill: true,
    },
    rollupOptions: {
      // Suprimir warnings de bibliotecas externas
      onwarn(warning, warn) {
        // Suprimir warning de case duplicado em libs externas
        if (warning.code === 'PLUGIN_WARNING' || warning.code === 'DUPLICATE_CASE') {
          if (warning.message && warning.message.includes('case clause will never be evaluated')) {
            return;
          }
        }
        // Mostrar outros warnings
        warn(warning);
      },
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
        // Garantir ordem de carregamento dos chunks
        // O chunk vendor-react-core deve ser carregado ANTES de todos os outros
        experimentalMinChunkSize: 20000,
        // Garantir que vendor-react-core seja carregado primeiro
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'index') {
            return 'assets/[name]-[hash].js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: (chunkInfo) => {
          // Garantir que vendor-react-core seja carregado primeiro
          if (chunkInfo.name === 'vendor-react-core') {
            return 'assets/vendor-react-core-[hash].js';
          }
          return 'assets/[name]-[hash].js';
        },
        // 🔥 ESTRATÉGIA SIMPLIFICADA: Consolidar TUDO do node_modules em vendor
        // Isso elimina problemas de ordem de carregamento entre chunks
        manualChunks: (id) => {
          // Se é do node_modules, vai para vendor
          if (id.includes('node_modules/')) {
            return 'vendor';
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
          
          // Google AI - separar em chunk próprio
          if (id.includes('node_modules/@google/generative-ai') || id.includes('node_modules/@google/genai')) {
            return 'vendor-google-ai';
          }
          
          // Supabase & Auth
          if (id.includes('node_modules/@supabase') || id.includes('node_modules/@stripe')) {
            return 'vendor-backend';
          }
          
          // UI Libraries (não dependem do React diretamente)
          // lucide-react e framer-motion já estão no vendor-react-core
          
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
          
          // Dividir vendor-misc em chunks menores por categoria
          if (id.includes('node_modules')) {
            // Google AI / Gemini
            if (id.includes('@google/generative-ai') || id.includes('@google/genai')) {
              return 'vendor-google-ai';
            }
            
            // WhatsApp / Communication
            if (id.includes('twilio') || id.includes('socket.io')) {
              return 'vendor-communication';
            }
            
            // PDF & Document processing
            if (id.includes('pdf-lib') || id.includes('pdfmake') || id.includes('pdfjs-dist')) {
              return 'vendor-pdf';
            }
            
            // Image processing
            if (id.includes('sharp') || id.includes('canvas') || id.includes('image-js')) {
              return 'vendor-images';
            }
            
            // HTTP & Fetch
            if (id.includes('axios') || id.includes('node-fetch') || id.includes('ky')) {
              return 'vendor-http';
            }
            
            // Lodash / Utilities
            if (id.includes('lodash') || id.includes('ramda')) {
              return 'vendor-utilities';
            }
            
            // Moment / Dayjs / Date libraries
            if (id.includes('moment') || id.includes('dayjs') || id.includes('luxon')) {
              return 'vendor-dates';
            }
            
            // Validation libraries
            if (id.includes('joi') || id.includes('yup') || id.includes('class-validator')) {
              return 'vendor-validation';
            }
            
            // File processing
            if (id.includes('multer') || id.includes('formidable') || id.includes('busboy')) {
              return 'vendor-files';
            }
            
            // Database drivers
            if (id.includes('pg') || id.includes('mysql2') || id.includes('mongodb')) {
              return 'vendor-database';
            }
            
            // WebRTC / Media
            if (id.includes('simple-peer') || id.includes('mediasoup')) {
              return 'vendor-media';
            }
            
            // Consolidar resto dos vendors
            return 'vendor-misc';
          }
          
          // NÃO consolidar páginas - deixar React.lazy() gerenciar
          // NÃO consolidar serviços - permitir tree shaking
          
          // Consolidar apenas componentes UI pequenos
          if (id.includes('/components/ui/') || id.includes('/components/layout/')) {
            return 'app-ui-components';
          }
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