'use client';

import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseAutoSaveOptions {
  data: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  interval?: number; // em milissegundos (padrão 45s)
  enabled?: boolean;
  onSaveStart?: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

export function useAutoSave({
  data,
  onSave,
  interval = 45000, // 45 segundos
  enabled = true,
  onSaveStart,
  onSaveSuccess,
  onSaveError,
}: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<Record<string, unknown>>({});
  const isSavingRef = useRef(false);
  const hasChangesRef = useRef(false);

  // Verifica se há mudanças
  const hasChanges = useCallback(() => {
    return JSON.stringify(data) !== JSON.stringify(lastSavedRef.current);
  }, [data]);

  // Função de salvamento
  const save = useCallback(async () => {
    if (isSavingRef.current || !hasChanges()) {
      return;
    }

    isSavingRef.current = true;
    hasChangesRef.current = false;
    onSaveStart?.();

    try {
      await onSave(data);
      lastSavedRef.current = JSON.parse(JSON.stringify(data));
      onSaveSuccess?.();
    } catch (error: unknown) {
      hasChangesRef.current = true; // Marca como não salvo em caso de erro
      const err = error instanceof Error ? error : new Error('Erro desconhecido no auto-save');
      onSaveError?.(err);
      console.error('Erro no auto-save:', err);
    } finally {
      isSavingRef.current = false;
    }
  }, [data, onSave, onSaveStart, onSaveSuccess, onSaveError, hasChanges]);

  // Configura o auto-save
  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Verifica mudanças a cada segundo
    const checkInterval = setInterval(() => {
      if (hasChanges() && !isSavingRef.current) {
        hasChangesRef.current = true;
      }
    }, 1000);

    // Salva automaticamente após o intervalo
    const scheduleSave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (hasChangesRef.current && !isSavingRef.current) {
          save();
        }
        scheduleSave(); // Agenda próximo salvamento
      }, interval);
    };

    scheduleSave();

    return () => {
      clearInterval(checkInterval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, interval, save, hasChanges]);

  // Salva manualmente
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    await save();
  }, [save]);

  // Limpa o auto-save
  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    lastSavedRef.current = JSON.parse(JSON.stringify(data));
    hasChangesRef.current = false;
  }, [data]);

  return {
    saveNow,
    reset,
    isSaving: isSavingRef.current,
    hasUnsavedChanges: hasChangesRef.current,
  };
}