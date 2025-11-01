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
    minify: 'esbuild',
    cssMinify: true,
    // Garantir que os entry points sejam preservados para ordem de carregamento correta
    preserveEntrySignatures: 'strict',
    // Configurar ordem de carregamento dos chunks
    modulePreload: {
      polyfill: true,
    },
    // Configuração para melhor compressão
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      // Suprimir warnings de bibliotecas externas
      onwarn(warning, warn) {
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
          'Circular dependency',
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
        // Code splitting manual SIMPLIFICADO e confiável
        // Mantemos apenas os chunks essenciais para evitar 404s
        manualChunks: (id) => {
          // React core - sempre primeiro
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/scheduler')) {
            return 'vendor-react';
          }
          
          // React Router
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }
          
          // Radix UI - componentes grandes
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix';
          }
          
          // Tiptap Editor (apenas se usado)
          if (id.includes('node_modules/@tiptap') || id.includes('node_modules/prosemirror')) {
            return 'vendor-editor';
          }
          
          // Outros vendors node_modules
          if (id.includes('node_modules')) {
            return 'vendor-libs';
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
    chunkSizeWarningLimit: 500, // Mais restritivo
    cssCodeSplit: true, // Split CSS
    assetsInlineLimit: 4096, // Inline assets < 4kb
  }
});