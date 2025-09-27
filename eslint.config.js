import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  // Base configuration for all files
  {
    ignores: ['dist/**', 'node_modules/**', '*.log', 'coverage/**']
  },
  
  // JavaScript/TypeScript base configuration
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
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
        project: './tsconfig.json',
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
      'no-console': 'error', // Prevent sensitive data logging
      'no-debugger': 'error',
      'no-alert': 'error',

      // TypeScript strict rules for data safety
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',

      // Security rules
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',

      // LGPD compliance rules
      'no-unused-vars': 'error',
      '@typescript-eslint/no-unused-vars': 'error',

      // React best practices for healthcare apps
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Performance rules
      'prefer-const': 'error',
      'no-var': 'error'
    }
  },

  // Test files configuration
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': 'off' // Allow console in tests
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
