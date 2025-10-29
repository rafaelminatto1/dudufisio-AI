/**
 * Testes para Supabase Error Handler
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  withSupabaseErrorHandling, 
  withSupabaseQuery, 
  withSupabaseMutation,
  withSupabaseCritical 
} from '../../../lib/supabase/errorHandler';

describe('withSupabaseErrorHandling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve executar operação com sucesso', async () => {
    const operation = vi.fn().mockResolvedValue({ data: 'success' });
    const wrapped = withSupabaseErrorHandling(operation, {
      operation: 'testOperation',
      fallbackMessage: 'Test error'
    });

    const result = await wrapped();
    
    expect(result).toEqual({ data: 'success' });
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('deve lançar erro quando operação falha', async () => {
    const error = new Error('Database error');
    const operation = vi.fn().mockRejectedValue(error);
    
    const wrapped = withSupabaseErrorHandling(operation, {
      operation: 'testOperation',
      fallbackMessage: 'Test error',
      retryable: false
    });

    await expect(wrapped()).rejects.toThrow();
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('deve fazer retry em erros retryable', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: 'success after retry' });
    
    const wrapped = withSupabaseErrorHandling(operation, {
      operation: 'testOperation',
      fallbackMessage: 'Test error',
      retryable: true,
      maxRetries: 3,
      retryDelay: 10 // Delay pequeno para testes
    });

    const result = await wrapped();
    
    expect(result).toEqual({ data: 'success after retry' });
    expect(operation).toHaveBeenCalledTimes(3); // 1 inicial + 2 retries
  });

  it('não deve fazer retry após max tentativas', async () => {
    const error = new Error('Failed to fetch');
    const operation = vi.fn().mockRejectedValue(error);
    
    const wrapped = withSupabaseErrorHandling(operation, {
      operation: 'testOperation',
      fallbackMessage: 'Test error',
      retryable: true,
      maxRetries: 2,
      retryDelay: 10
    });

    await expect(wrapped()).rejects.toThrow();
    expect(operation).toHaveBeenCalledTimes(3); // 1 inicial + 2 retries
  });

  it('não deve fazer retry em erros não-retryable', async () => {
    const error = new Error('Validation error');
    error.code = '400';
    const operation = vi.fn().mockRejectedValue(error);
    
    const wrapped = withSupabaseErrorHandling(operation, {
      operation: 'testOperation',
      fallbackMessage: 'Test error',
      retryable: true,
      maxRetries: 3
    });

    await expect(wrapped()).rejects.toThrow();
    expect(operation).toHaveBeenCalledTimes(1); // Sem retry
  });
});

describe('withSupabaseQuery', () => {
  it('deve criar wrapper com retry habilitado', async () => {
    const operation = vi.fn().mockResolvedValue({ data: 'query result' });
    const wrapped = withSupabaseQuery(operation, {
      operation: 'testQuery'
    });

    const result = await wrapped();
    
    expect(result).toEqual({ data: 'query result' });
  });

  it('deve fazer retry em queries', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: 'success' });
    
    const wrapped = withSupabaseQuery(operation, {
      operation: 'testQuery',
      fallbackMessage: 'Query failed'
    });

    const result = await wrapped();
    
    expect(result).toEqual({ data: 'success' });
    expect(operation).toHaveBeenCalledTimes(2);
  });
});

describe('withSupabaseMutation', () => {
  it('deve criar wrapper sem retry', async () => {
    const operation = vi.fn().mockResolvedValue({ data: 'mutation result' });
    const wrapped = withSupabaseMutation(operation, {
      operation: 'testMutation'
    });

    const result = await wrapped();
    
    expect(result).toEqual({ data: 'mutation result' });
  });

  it('não deve fazer retry em mutations', async () => {
    const error = new Error('Failed to fetch');
    const operation = vi.fn().mockRejectedValue(error);
    
    const wrapped = withSupabaseMutation(operation, {
      operation: 'testMutation'
    });

    await expect(wrapped()).rejects.toThrow();
    expect(operation).toHaveBeenCalledTimes(1); // Sem retry
  });
});

describe('withSupabaseCritical', () => {
  it('deve criar wrapper com mais retries', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValueOnce({ data: 'success' });
    
    const wrapped = withSupabaseCritical(operation, {
      operation: 'criticalOperation',
      fallbackMessage: 'Critical operation failed'
    });

    const result = await wrapped();
    
    expect(result).toEqual({ data: 'success' });
    expect(operation).toHaveBeenCalledTimes(5); // 1 inicial + 4 retries
  });
});

