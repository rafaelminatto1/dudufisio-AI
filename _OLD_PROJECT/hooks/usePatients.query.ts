/**
 * hooks/usePatients.query.ts
 * 
 * Hooks React Query otimizados para gestão de pacientes
 * Utiliza TanStack Query v5 com TypeScript
 */

import { useQuery, useMutation, useQueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { supabasePatientService } from '../services/supabase/patientService';
import { Patient, PatientFormData, PatientFilters } from '../types/patient';
import { toast } from 'sonner';

// ============================================================================
// QUERY KEYS (Centralizados para invalidação consistente)
// ============================================================================

export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters?: PatientFilters) => [...patientKeys.lists(), { filters }] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
  kpis: (id: string) => [...patientKeys.detail(id), 'kpis'] as const,
  timeline: (id: string) => [...patientKeys.detail(id), 'timeline'] as const,
  documents: (id: string) => [...patientKeys.detail(id), 'documents'] as const,
  notes: (id: string) => [...patientKeys.detail(id), 'notes'] as const,
  summary: (id: string) => [...patientKeys.detail(id), 'summary'] as const,
  search: (query: string) => [...patientKeys.all, 'search', query] as const,
};

// ============================================================================
// HOOKS DE QUERY (Leitura de dados)
// ============================================================================

/**
 * Hook para listar pacientes com filtros e paginação
 */
export function usePatients(filters?: PatientFilters) {
  return useQuery({
    queryKey: patientKeys.list(filters),
    queryFn: () => supabasePatientService.getAllPatients(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos (anteriormente cacheTime)
  });
}

/**
 * Hook para buscar um paciente específico
 */
export function usePatient(id: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: patientKeys.detail(id!),
    queryFn: () => supabasePatientService.getPatient(id!),
    enabled: Boolean(id) && enabled,
    staleTime: 1000 * 60 * 3, // 3 minutos
  });
}

/**
 * Hook para buscar KPIs de um paciente
 */
export function usePatientKPIs(patientId: string | undefined) {
  return useQuery({
    queryKey: patientKeys.kpis(patientId!),
    queryFn: () => supabasePatientService.getPatientKPIs(patientId!),
    enabled: Boolean(patientId),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para buscar timeline de um paciente
 */
export function usePatientTimeline(patientId: string | undefined, limit: number = 50) {
  return useQuery({
    queryKey: [...patientKeys.timeline(patientId!), { limit }],
    queryFn: () => supabasePatientService.getPatientTimeline(patientId!, limit),
    enabled: Boolean(patientId),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para buscar documentos de um paciente
 */
export function usePatientDocuments(patientId: string | undefined) {
  return useQuery({
    queryKey: patientKeys.documents(patientId!),
    queryFn: () => supabasePatientService.getPatientDocuments(patientId!),
    enabled: Boolean(patientId),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar notas de um paciente
 */
export function usePatientNotes(patientId: string | undefined) {
  return useQuery({
    queryKey: patientKeys.notes(patientId!),
    queryFn: () => supabasePatientService.getPatientNotes(patientId!),
    enabled: Boolean(patientId),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para buscar resumo completo de um paciente
 */
export function usePatientSummary(patientId: string | undefined) {
  return useQuery({
    queryKey: patientKeys.summary(patientId!),
    queryFn: () => supabasePatientService.getPatientSummary(patientId!),
    enabled: Boolean(patientId),
    staleTime: 1000 * 60 * 3, // 3 minutos
  });
}

/**
 * Hook para busca full-text de pacientes
 */
export function useSearchPatients(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: patientKeys.search(query),
    queryFn: () => supabasePatientService.searchPatients(query),
    enabled: Boolean(query) && enabled && query.length >= 3,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// ============================================================================
// HOOKS DE MUTATION (Modificação de dados)
// ============================================================================

/**
 * Hook para criar um novo paciente
 */
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PatientFormData) => supabasePatientService.createPatient(data),
    onMutate: async (newPatient) => {
      // Otimistic update (opcional)
      await queryClient.cancelQueries({ queryKey: patientKeys.lists() });
      
      // Snapshot do estado anterior
      const previousPatients = queryClient.getQueryData(patientKeys.lists());
      
      return { previousPatients };
    },
    onSuccess: (data, variables, context) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
      
      // Mostrar toast de sucesso
      toast.success('Paciente criado com sucesso!', {
        description: `${data.name} foi adicionado ao sistema.`,
      });
    },
    onError: (error, variables, context) => {
      // Reverter otimistic update se houver erro
      if (context?.previousPatients) {
        queryClient.setQueryData(patientKeys.lists(), context.previousPatients);
      }
      
      // Mostrar toast de erro
      toast.error('Erro ao criar paciente', {
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde.',
      });
    },
  });
}

/**
 * Hook para atualizar um paciente existente
 */
export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PatientFormData> }) =>
      supabasePatientService.updatePatient(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: patientKeys.detail(id) });
      
      // Snapshot
      const previousPatient = queryClient.getQueryData(patientKeys.detail(id));
      
      // Optimistic update
      if (previousPatient) {
        queryClient.setQueryData(patientKeys.detail(id), (old: any) => ({
          ...old,
          ...data,
        }));
      }
      
      return { previousPatient };
    },
    onSuccess: (data, variables) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.summary(variables.id) });
      queryClient.invalidateQueries({ queryKey: patientKeys.kpis(variables.id) });
      
      toast.success('Paciente atualizado!', {
        description: `Dados de ${data.name} foram atualizados.`,
      });
    },
    onError: (error, variables, context) => {
      // Rollback
      if (context?.previousPatient) {
        queryClient.setQueryData(patientKeys.detail(variables.id), context.previousPatient);
      }
      
      toast.error('Erro ao atualizar paciente', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
    },
  });
}

/**
 * Hook para excluir um paciente (soft delete)
 */
export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => supabasePatientService.deletePatient(id),
    onMutate: async (id) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: patientKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: patientKeys.lists() });
      
      // Snapshot
      const previousPatient = queryClient.getQueryData(patientKeys.detail(id));
      
      return { previousPatient };
    },
    onSuccess: (_, id) => {
      // Remover dos caches
      queryClient.removeQueries({ queryKey: patientKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      
      toast.success('Paciente removido', {
        description: 'O paciente foi excluído do sistema.',
      });
    },
    onError: (error, id, context) => {
      // Restaurar dados
      if (context?.previousPatient) {
        queryClient.setQueryData(patientKeys.detail(id), context.previousPatient);
      }
      
      toast.error('Erro ao excluir paciente', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
    },
  });
}

/**
 * Hook para upload de documentos
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, file, metadata }: {
      patientId: string;
      file: File;
      metadata: {
        document_type: string;
        title: string;
        description?: string;
        document_date?: string;
      };
    }) => supabasePatientService.uploadDocument(patientId, file, metadata),
    onSuccess: (data, variables) => {
      // Invalidar lista de documentos
      queryClient.invalidateQueries({ queryKey: patientKeys.documents(variables.patientId) });
      queryClient.invalidateQueries({ queryKey: patientKeys.timeline(variables.patientId) });
      
      toast.success('Documento enviado!', {
        description: `${variables.metadata.title} foi anexado ao paciente.`,
      });
    },
    onError: (error) => {
      toast.error('Erro ao enviar documento', {
        description: error instanceof Error ? error.message : 'Arquivo muito grande ou formato inválido.',
      });
    },
  });
}

/**
 * Hook para adicionar nota ao paciente
 */
export function useAddPatientNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, note }: {
      patientId: string;
      note: {
        note_type: string;
        title?: string;
        content: string;
        is_important?: boolean;
        is_alert?: boolean;
      };
    }) => supabasePatientService.addPatientNote(patientId, note),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.notes(variables.patientId) });
      queryClient.invalidateQueries({ queryKey: patientKeys.timeline(variables.patientId) });
      
      toast.success('Nota adicionada!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar nota', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
    },
  });
}

/**
 * Hook para adicionar evento na timeline
 */
export function useAddTimelineEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, event }: {
      patientId: string;
      event: {
        event_type: string;
        title: string;
        description?: string;
        importance?: string;
        metadata?: any;
      };
    }) => supabasePatientService.addTimelineEvent(patientId, event),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.timeline(variables.patientId) });
      queryClient.invalidateQueries({ queryKey: patientKeys.summary(variables.patientId) });
    },
    onError: (error) => {
      console.error('Erro ao adicionar evento na timeline:', error);
    },
  });
}

// ============================================================================
// HOOKS COMPOSTOS (Múltiplas operações)
// ============================================================================

/**
 * Hook que retorna todos os dados relevantes de um paciente
 * (Dados, KPIs, Timeline, Documentos, Notas)
 */
export function usePatientComplete(patientId: string | undefined) {
  const patient = usePatient(patientId);
  const kpis = usePatientKPIs(patientId);
  const timeline = usePatientTimeline(patientId, 20);
  const documents = usePatientDocuments(patientId);
  const notes = usePatientNotes(patientId);

  return {
    patient: patient.data,
    kpis: kpis.data,
    timeline: timeline.data,
    documents: documents.data,
    notes: notes.data,
    isLoading: patient.isLoading || kpis.isLoading || timeline.isLoading || documents.isLoading || notes.isLoading,
    isError: patient.isError || kpis.isError || timeline.isError || documents.isError || notes.isError,
    error: patient.error || kpis.error || timeline.error || documents.error || notes.error,
  };
}

// ============================================================================
// TYPES HELPERS
// ============================================================================

export type PatientQueryResult = UseQueryResult<Patient | null, Error>;
export type PatientsQueryResult = UseQueryResult<{ patients: Patient[]; total: number }, Error>;
export type CreatePatientMutation = UseMutationResult<Patient, Error, PatientFormData>;
export type UpdatePatientMutation = UseMutationResult<Patient, Error, { id: string; data: Partial<PatientFormData> }>;
export type DeletePatientMutation = UseMutationResult<void, Error, string>;

