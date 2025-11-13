import { useCallback } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import {
  fetchLatestPainMap,
  fetchPainMapSession,
  savePainMapSnapshot,
  type PainMapSnapshot,
  type PainRegionEntry,
} from '@/src/services/painMaps';

interface UsePainMapOptions {
  patientId: string;
  sessionId?: string;
  professionalId?: string;
  enabled?: boolean;
}

interface SavePayload {
  regions: PainRegionEntry[];
  notes?: string;
  sessionDate?: Date;
}

interface UsePainMapResult {
  data: PainMapSnapshot | null | undefined;
  regions: PainRegionEntry[];
  isLoading: boolean;
  isError: boolean;
  isSaving: boolean;
  save: UseMutationResult<PainMapSnapshot, unknown, SavePayload>['mutateAsync'];
  refetch: UseQueryResult<PainMapSnapshot | null>['refetch'];
}

export function usePainMap(options: UsePainMapOptions): UsePainMapResult {
  const { patientId, sessionId, professionalId, enabled = true } = options;
  const queryClient = useQueryClient();

  const queryKey = ['pain-map', patientId, sessionId ?? 'latest'];

  const query = useQuery({
    queryKey,
    queryFn: () =>
      sessionId
        ? fetchPainMapSession(sessionId)
        : fetchLatestPainMap(patientId),
    enabled: enabled && Boolean(patientId),
  });

  const mutation = useMutation({
    mutationFn: async (payload: SavePayload) => {
      const snapshot = await savePainMapSnapshot({
        patientId,
        professionalId: professionalId ?? 'system',
        sessionId: sessionId ?? query.data?.session.id,
        sessionDate: payload.sessionDate,
        notes: payload.notes,
        regions: payload.regions,
      });

      return snapshot;
    },
    onSuccess: (snapshot) => {
      queryClient.setQueryData(queryKey, snapshot);
      queryClient.invalidateQueries({ queryKey: ['pain-map-history', patientId] });
    },
  });

  const save = useCallback(
    async (payload: SavePayload) => mutation.mutateAsync(payload),
    [mutation],
  );

  return {
    data: query.data,
    regions: query.data?.regions ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    isSaving: mutation.isPending,
    save,
    refetch: query.refetch,
  };
}

