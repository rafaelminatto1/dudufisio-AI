/** @type {import('jest').Config} */
module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts'
  ],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'lib/financial/**/*.ts',
    'components/financial/**/*.tsx',
    '!lib/financial/**/*.d.ts',
    '!lib/financial/**/*.test.ts',
    '!lib/financial/**/*.spec.ts'
  ],
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './lib/financial/domain/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },

  // Module resolution
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1'
  },

  // Transform configuration
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        compilerOptions: {
          jsx: 'react-jsx'
        }
      }
    }]
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Timeout for tests
  testTimeout: 10000,

  // Error handling
  errorOnDeprecated: true,

  // Watch mode configuration
  watchPathIgnorePatterns: [
    '<rootDir>/coverage/',
    '<rootDir>/.next/',
    '<rootDir>/node_modules/'
  ],

  // Reporter configuration
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'coverage',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ],

  // Global setup/teardown
  globalSetup: undefined,
  globalTeardown: undefined,

  // Snapshot configuration
  updateSnapshot: false,

  // Test result processor
  testResultsProcessor: undefined,

  // Custom resolver
  resolver: undefined,

  // Runner
  runner: 'jest-runner',

  // Max workers
  maxWorkers: '50%',

  // Cache
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',

  // Bail configuration
  bail: 0,

  // Notify configuration
  notify: false,
  notifyMode: 'failure-change',

  // Silent mode
  silent: false,

  // Roots
  roots: ['<rootDir>/lib', '<rootDir>/tests', '<rootDir>/components'],

  // Test environment options
  testEnvironmentOptions: {},

  // Extensions to treat as ESM
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // Globals
  globals: {
    'ts-jest': {
      useESM: false
    }
  }
};