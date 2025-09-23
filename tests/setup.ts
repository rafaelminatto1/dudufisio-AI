// Test setup file for Jest
import { jest } from '@jest/globals';

// Mock crypto.randomUUID for consistent testing
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid-123'),
  },
});

// Mock fetch for API calls in tests
global.fetch = jest.fn();

// Mock Date.now for consistent date testing
const mockDateNow = jest.fn(() => new Date('2024-01-01T00:00:00Z').getTime());
global.Date.now = mockDateNow;

// Setup console methods for testing
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.STRIPE_RETURN_URL = 'https://test.com/payment/return';

// Setup Jest matchers for custom assertions
expect.extend({
  toBeValidMoney(received, expectedAmount: number, expectedCurrency: string = 'BRL') {
    const pass = received && 
                 typeof received.toNumber === 'function' &&
                 typeof received.toString === 'function' &&
                 received.toNumber() === expectedAmount &&
                 received.toString().includes(expectedCurrency);

    if (pass) {
      return {
        message: () => `expected ${received} not to be valid money with ${expectedAmount} ${expectedCurrency}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be valid money with ${expectedAmount} ${expectedCurrency}`,
        pass: false,
      };
    }
  },

  toBeValidTransaction(received) {
    const pass = received &&
                 typeof received.getId === 'function' &&
                 typeof received.getPatientId === 'function' &&
                 typeof received.getAmount === 'function' &&
                 typeof received.getStatus === 'function';

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid transaction`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid transaction`,
        pass: false,
      };
    }
  },

  toBeValidPackage(received) {
    const pass = received &&
                 typeof received.getId === 'function' &&
                 typeof received.getPatientId === 'function' &&
                 typeof received.getTotalSessions === 'function' &&
                 typeof received.getUsedSessions === 'function' &&
                 typeof received.getRemainingSessions === 'function';

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid package`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid package`,
        pass: false,
      };
    }
  }
});

// Extend Jest matchers type definitions
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidMoney(expectedAmount: number, expectedCurrency?: string): R;
      toBeValidTransaction(): R;
      toBeValidPackage(): R;
    }
  }
}

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Reset modules after each test to ensure clean state
afterEach(() => {
  jest.resetModules();
});