// hooks/useMetricsWorker.ts
import { useEffect, useRef, useCallback } from 'react';
import { Patient, Appointment } from '../types';

/**
 * Hook para usar Web Worker de cálculos de métricas
 * Permite processar grandes volumes de dados sem bloquear a UI
 */
export function useMetricsWorker() {
  const workerRef = useRef<Worker | null>(null);
  const callbacksRef = useRef<Map<string, (data: any) => void>>(new Map());

  useEffect(() => {
    // Criar worker
    try {
      workerRef.current = new Worker(
        new URL('../workers/metricsCalculator.worker.ts', import.meta.url),
        { type: 'module' }
      );

      // Listener para respostas
      workerRef.current.onmessage = (event) => {
        const { type, payload } = event.data;
        const callback = callbacksRef.current.get(type);
        if (callback) {
          callback(payload);
          callbacksRef.current.delete(type);
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error);
      };
    } catch (error) {
      console.warn('Web Workers não suportados neste navegador:', error);
    }

    // Cleanup
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const calculateMetrics = useCallback(
    (
      patients: Patient[],
      appointments: Appointment[],
      onComplete: (results: any) => void
    ) => {
      if (!workerRef.current) {
        console.warn('Worker não disponível');
        return;
      }

      callbacksRef.current.set('METRICS_READY', onComplete);
      
      workerRef.current.postMessage({
        type: 'CALCULATE_METRICS',
        payload: { patients, appointments },
      });
    },
    []
  );

  const calculateRisk = useCallback(
    (
      consecutiveMisses: number,
      daysSinceLastSession: number,
      painChange: number | undefined,
      onComplete: (result: { level: string; reasons: string[] }) => void
    ) => {
      if (!workerRef.current) {
        console.warn('Worker não disponível');
        return;
      }

      callbacksRef.current.set('RISK_CALCULATED', onComplete);
      
      workerRef.current.postMessage({
        type: 'CALCULATE_RISK',
        payload: { consecutiveMisses, daysSinceLastSession, painChange },
      });
    },
    []
  );

  const exportData = useCallback(
    (
      patients: any[],
      format: 'csv' | 'excel',
      onComplete: (result: { data: string; filename: string }) => void
    ) => {
      if (!workerRef.current) {
        console.warn('Worker não disponível');
        return;
      }

      callbacksRef.current.set('EXPORT_READY', onComplete);
      
      workerRef.current.postMessage({
        type: 'EXPORT_DATA',
        payload: { patients, format },
      });
    },
    []
  );

  return {
    calculateMetrics,
    calculateRisk,
    exportData,
    isAvailable: !!workerRef.current,
  };
}


