import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  // Base configuration for all files
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.next/**',
      'out/**',
      'storybook-static/**',
      'public/build/**',
      'coverage/**',
      'reports/**',
      'playwright-report/**',
      'test-results/**',
      'generated/**',
      'tmp/**',
      'temp/**',
      '.vercel/**',
      '.turbo/**',
      '**/*.min.js',
      '*.log',
      '*.zip',
      '*.svg',
      'tests/**'
    ]
  },
  
  // TypeScript base configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.node,
        React: 'readonly',
        JSX: 'readonly'
      },
      parser: tsparser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@typescript-eslint': tseslint
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      
      // React Refresh rule
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],

      // Healthcare Data Privacy Rules
      // SEGURANÇA: Bloquear console.log mas permitir warn/error para debugging
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',

      // TypeScript strict rules for data safety
      // NOTA: Desabilitado temporariamente devido a 343+ usos existentes de 'any'
      // TODO: Habilitar após refatoração gradual
      '@typescript-eslint/no-explicit-any': 'warn', // Era 'error', agora 'warn' temporariamente
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',

      // Security rules
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',

      // LGPD compliance rules
      'no-unused-vars': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unused-vars': 'error',

      // React best practices for healthcare apps
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Performance rules
      'prefer-const': 'error',
      'no-var': 'error'
    }
  },

  // Supabase edge functions and serverless scripts (type-aware parsing desativado)
  {
    files: ['supabase/functions/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: null
      },
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off'
    }
  },

  // Tipos compartilhados extensos (catálogos/enums)
  {
    files: ['types.ts', 'types/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: null
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off'
    }
  },

  // JavaScript base configuration (sem TypeScript project)
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'error',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-unused-vars': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Scripts utilitários (root test-*.js, ferramentas de diagnóstico)
  {
    files: [
      'test-*.js',
      'testsprite_tests/**/*.ts',
      'test/**/*.ts',
      'workers/**/*.js'
    ],
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off'
    }
  },

  // Test files configuration
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': 'off' // Allow console in tests
    }
  },

  // CLI / maintenance scripts
  {
    files: ['scripts/**/*.{ts,js}', 'scripts/**/*.{tsx,jsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-console': 'off'
    }
  },

  // Configuration files
  {
    files: ['*.config.{js,ts}', 'vite.config.*', 'jest.config.*', 'workers/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: null
      },
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off'
    }
  }
];
