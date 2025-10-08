/**
 * Vitest Setup File
 * Configuração global para todos os testes
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup após cada teste
afterEach(() => {
  cleanup();
});

// Mock do Supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      update: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      delete: vi.fn(() => Promise.resolve({ error: null })),
      eq: vi.fn(function() { return this; }),
      single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      order: vi.fn(function() { return this; }),
      limit: vi.fn(function() { return this; }),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signIn: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
    channel: vi.fn(() => ({
      on: vi.fn(function() { return this; }),
      subscribe: vi.fn(() => Promise.resolve({ status: 'SUBSCRIBED' })),
      unsubscribe: vi.fn(),
    })),
  },
}));

// Mock do React Router
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
  useParams: vi.fn(() => ({})),
  useLocation: vi.fn(() => ({ pathname: '/' })),
  Link: vi.fn(({ children }) => children),
  BrowserRouter: vi.fn(({ children }) => children),
}));

// Mock do toast
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  ToastContainer: vi.fn(() => null),
}));

// Suprimir console.error em testes (opcional)
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};
