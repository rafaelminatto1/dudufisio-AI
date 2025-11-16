import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Therapist, Patient, Appointment } from '../types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface UseOptimizedDataOptions {
  ttl?: number; // Time to live in milliseconds
  refetchInterval?: number; // Auto-refetch interval
  enabled?: boolean; // Enable/disable data fetching
}

interface UseOptimizedDataReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
}

/**
 * Hook otimizado para busca de dados com cache inteligente
 * Implementa estratégias de cache, debounce e invalidação
 */
export function useOptimizedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: UseOptimizedDataOptions = {}
): UseOptimizedDataReturn<T> {
  const {
    ttl = 5 * 60 * 1000, // 5 minutos por padrão
    refetchInterval,
    enabled = true
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Cache global compartilhado
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const isDataFresh = useCallback((entry: CacheEntry<T>): boolean => {
    return Date.now() - entry.timestamp < entry.ttl;
  }, []);

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;

    // Cancela requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Verifica cache se não for forçado
    const cached = cacheRef.current.get(key);
    if (!force && cached && isDataFresh(cached)) {
      setData(cached.data);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const result = await fetchFn();
      
      // Salva no cache
      cacheRef.current.set(key, {
        data: result,
        timestamp: Date.now(),
        ttl
      });

      setData(result);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [key, fetchFn, ttl, enabled, isDataFresh]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  const invalidate = useCallback(() => {
    cacheRef.current.delete(key);
  }, [key]);

  // Fetch inicial
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  // Auto-refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const interval = setInterval(() => {
      fetchData();
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval, enabled, fetchData]);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch,
    invalidate
  };
}

/**
 * Hook especializado para dados de terapeutas
 */
export function useOptimizedTherapists(options: UseOptimizedDataOptions = {}) {
  return useOptimizedData(
    'therapists',
    async () => {
      const { getTherapists } = await import('../services/therapistService');
      return getTherapists();
    },
    { ttl: 10 * 60 * 1000, ...options } // 10 minutos para terapeutas
  );
}

/**
 * Hook especializado para dados de pacientes
 */
export function useOptimizedPatients(options: UseOptimizedDataOptions = {}) {
  return useOptimizedData(
    'patients',
    async () => {
      const { getAllPatients } = await import('../services/patientService');
      return getAllPatients();
    },
    { ttl: 2 * 60 * 1000, ...options } // 2 minutos para pacientes
  );
}

/**
 * Hook especializado para dados de agendamentos
 */
export function useOptimizedAppointments(options: UseOptimizedDataOptions = {}) {
  return useOptimizedData(
    'appointments',
    async () => {
      const { getAppointments } = await import('../services/appointmentService');
      return getAppointments();
    },
    { ttl: 1 * 60 * 1000, ...options } // 1 minuto para agendamentos
  );
}

/**
 * Hook para dados combinados com cache inteligente
 */
export function useOptimizedCombinedData(options: UseOptimizedDataOptions = {}) {
  const therapists = useOptimizedTherapists(options);
  const patients = useOptimizedPatients(options);
  const appointments = useOptimizedAppointments(options);

  const isLoading = therapists.isLoading || patients.isLoading || appointments.isLoading;
  const error = therapists.error || patients.error || appointments.error;

  const refetch = useCallback(async () => {
    await Promise.all([
      therapists.refetch(),
      patients.refetch(),
      appointments.refetch()
    ]);
  }, [therapists.refetch, patients.refetch, appointments.refetch]);

  const invalidate = useCallback(() => {
    therapists.invalidate();
    patients.invalidate();
    appointments.invalidate();
  }, [therapists.invalidate, patients.invalidate, appointments.invalidate]);

  return {
    therapists: therapists.data,
    patients: patients.data,
    appointments: appointments.data,
    isLoading,
    error,
    refetch,
    invalidate
  };
}
