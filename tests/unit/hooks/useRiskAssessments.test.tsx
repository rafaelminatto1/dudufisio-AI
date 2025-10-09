/**
 * Testes Unitários - useRiskAssessments Hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRiskAssessments, useCreateRiskAssessment } from '../../../hooks/useRiskAssessments';
import { riskStratificationServiceSupabase } from '../../../services/clinical/riskStratificationServiceSupabase';
import type { ReactNode } from 'react';

// Mock do serviço
vi.mock('../../../services/clinical/riskStratificationServiceSupabase');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useRiskAssessments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve buscar avaliações de risco', async () => {
    const mockData = [
      {
        id: '1',
        patient_id: 'patient-1',
        risk_type: 'fall',
        risk_level: 'moderate',
        score: 75,
      },
    ];

    vi.mocked(riskStratificationServiceSupabase.getAssessments).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useRiskAssessments('patient-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(riskStratificationServiceSupabase.getAssessments).toHaveBeenCalledWith('patient-1');
  });

  it('não deve buscar se patientId é undefined', () => {
    vi.mocked(riskStratificationServiceSupabase.getAssessments).mockResolvedValue([] as any);

    const { result } = renderHook(() => useRiskAssessments(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(riskStratificationServiceSupabase.getAssessments).not.toHaveBeenCalled();
  });

  it('deve tratar erro corretamente', async () => {
    const mockError = new Error('Database error');
    vi.mocked(riskStratificationServiceSupabase.getAssessments).mockRejectedValue(mockError);

    const { result } = renderHook(() => useRiskAssessments('patient-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(mockError);
  });
});

describe('useCreateRiskAssessment', () => {
  it('deve criar avaliação e invalidar cache', async () => {
    const mockNewAssessment = {
      patient_id: 'patient-1',
      risk_type: 'fall',
      score: 80,
    };

    const mockResult = {
      id: '1',
      ...mockNewAssessment,
      created_at: new Date().toISOString(),
    };

    vi.mocked(riskStratificationServiceSupabase.createAssessment).mockResolvedValue(mockResult as any);

    const { result } = renderHook(() => useCreateRiskAssessment(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockNewAssessment as any);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockResult);
    expect(riskStratificationServiceSupabase.createAssessment).toHaveBeenCalledWith(mockNewAssessment);
  });
});



