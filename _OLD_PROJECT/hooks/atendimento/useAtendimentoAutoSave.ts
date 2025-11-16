// hooks/atendimento/useAtendimentoAutoSave.ts
import { useEffect, useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { useFormContext } from 'react-hook-form';
import { useToast } from '../../contexts/ToastContext';
import * as soapNoteService from '../../services/soapNoteService';
import type { AttendanceFormData } from '../../schemas/attendanceFormValidation';

type SaveStatus = 'saved' | 'saving' | 'error' | 'unsaved';

export const useAtendimentoAutoSave = (patientId: string) => {
  const { watch, formState: { isDirty } } = useFormContext<AttendanceFormData>();
  const { showToast } = useToast();

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);

  const formData = watch();
  const [debouncedFormData] = useDebounce(formData, 2000); // 2s debounce

  // Auto-save quando debounced data mudar
  useEffect(() => {
    if (!isDirty || !patientId) return;

    const performAutoSave = async () => {
      setSaveStatus('saving');

      try {
        const noteData: any = {
          ...(currentNoteId && { id: currentNoteId }),
          patientId,
          date: new Date().toISOString(),
          subjective: debouncedFormData.subjective,
          objective: debouncedFormData.objective,
          assessment: debouncedFormData.assessment,
          plan: debouncedFormData.plan,
          ...(debouncedFormData.painScale !== undefined && {
            painScale: debouncedFormData.painScale,
          }),
          bodyParts: debouncedFormData.painPoints?.map((p) => p.part) || [],
          metricResults: debouncedFormData.metricResults?.filter(
            (m): m is { metricId: string; value: number } => !!m.metricId
          ) || [],
        };

        const savedNote = await soapNoteService.saveNote(noteData);
        setCurrentNoteId(savedNote.id);
        setSaveStatus('saved');
      } catch (error) {
        console.error('Erro ao salvar:', error);
        setSaveStatus('error');
        showToast('Falha no salvamento automático', 'error');
      }
    };

    performAutoSave();
  }, [debouncedFormData, isDirty, patientId, currentNoteId, showToast]);

  // Marca como não salvo quando há mudanças
  useEffect(() => {
    if (isDirty && saveStatus === 'saved') {
      setSaveStatus('unsaved');
    }
  }, [isDirty, saveStatus]);

  // Função para salvar manualmente
  const saveManually = useCallback(async () => {
    if (saveStatus === 'saving') return;
    setSaveStatus('saving');
    // Trigger auto-save imediatamente
  }, [saveStatus]);

  // Verifica se pode finalizar
  const canFinish =
    saveStatus === 'saved' &&
    !!formData.subjective?.trim() &&
    !!formData.objective?.trim() &&
    !!formData.assessment?.trim() &&
    !!formData.plan?.trim();

  return {
    saveStatus,
    saveManually,
    canFinish,
    currentNoteId,
  };
};
