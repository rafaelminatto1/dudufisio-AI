/**
 * Testes para useSupabaseQuery Hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery';

describe('useSupabaseQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve iniciar com estado de loading', () => {
    const queryFn = vi.fn().mockResolvedValue({ data: 'test' });
    
    const { result } = renderHook(() => 
      useSupabaseQuery(queryFn, { enabled: false })
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('deve executar query automaticamente quando enabled=true', async () => {
    const queryFn = vi.fn().mockResolvedValue(['item1', 'item2']);
    
    const { result } = renderHook(() => 
      useSupabaseQuery(queryFn, { enabled: true })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(['item1', 'item2']);
    expect(result.current.error).toBe(null);
  });

  it('deve setar erro quando query falha', async () => {
    const error = new Error('Query failed');
    const queryFn = vi.fn().mockRejectedValue(error);
    
    const { result } = renderHook(() => 
      useSupabaseQuery(queryFn, { enabled: true })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBe(null);
  });

  it('deve permitir refetch manual', async () => {
    const queryFn = vi.fn()
      .mockResolvedValueOnce(['initial'])
      .mockResolvedValueOnce(['refetched']);
    
    const { result } = renderHook(() => 
      useSupabaseQuery(queryFn, { enabled: true })
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(['initial']);
    });

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.data).toEqual(['refetched']);
    });

    expect(queryFn).toHaveBeenCalledTimes(2);
  });

  it('deve manter dados anteriores durante refetch quando configurado', async () => {
    const queryFn = vi.fn()
      .mockResolvedValueOnce(['data1'])
      .mockRejectedValueOnce(new Error('Failed'));
    
    const { result } = renderHook(() => 
      useSupabaseQuery(queryFn, { 
        enabled: true,
        keepPreviousData: true 
      })
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(['data1']);
    });

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    // Dados anteriores devem permanecer
    expect(result.current.data).toEqual(['data1']);
  });

  it('deve limpar dados quando clear() é chamado', async () => {
    const queryFn = vi.fn().mockResolvedValue(['data']);
    
    const { result } = renderHook(() => 
      useSupabaseQuery(queryFn, { enabled: true })
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(['data']);
    });

    result.current.clear();

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('deve indicar isEmpty corretamente', async () => {
    const queryFn = vi.fn().mockResolvedValue([]);
    
    const { result } = renderHook(() => 
      useSupabaseQuery(queryFn, { enabled: true })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isEmpty).toBe(true);
  });

  it('deve indicar hasError corretamente', async () => {
    const queryFn = vi.fn().mockRejectedValue(new Error('Error'));
    
    const { result } = renderHook(() => 
      useSupabaseQuery(queryFn, { enabled: true })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasError).toBe(true);
  });

  it('deve fazer refetch automático com intervalo', async () => {
    vi.useFakeTimers();
    
    const queryFn = vi.fn().mockResolvedValue(['data']);
    
    renderHook(() => 
      useSupabaseQuery(queryFn, { 
        enabled: true,
        refetchInterval: 1000 
      })
    );

    // Aguardar primeira execução
    await vi.advanceTimersByTimeAsync(100);
    expect(queryFn).toHaveBeenCalledTimes(1);

    // Avançar para próximo refetch
    await vi.advanceTimersByTimeAsync(1000);
    expect(queryFn).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it('deve re-executar query quando deps mudam', async () => {
    const queryFn = vi.fn().mockResolvedValue(['data']);
    let dep = 'value1';
    
    const { rerender } = renderHook(() => 
      useSupabaseQuery(queryFn, { 
        enabled: true,
        deps: [dep]
      })
    );

    await waitFor(() => {
      expect(queryFn).toHaveBeenCalledTimes(1);
    });

    dep = 'value2';
    rerender();

    await waitFor(() => {
      expect(queryFn).toHaveBeenCalledTimes(2);
    });
  });
});

