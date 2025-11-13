import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  fetchPainMapHistory,
  type PainMapSnapshot,
  buildPainEvolutionSeries,
  type PainEvolutionPoint,
} from '@/src/services/painMaps';

interface UsePainMapHistoryResult {
  history: PainMapSnapshot[];
  points: PainEvolutionPoint[];
  isLoading: boolean;
  isError: boolean;
  refetch: UseQueryResult<PainMapSnapshot[]>['refetch'];
}

export function usePainMapHistory(patientId: string, enabled = true): UsePainMapHistoryResult {
  const query = useQuery({
    queryKey: ['pain-map-history', patientId],
    queryFn: () => fetchPainMapHistory(patientId),
    enabled: enabled && Boolean(patientId),
  });

  const history = query.data ?? [];
  const points = buildPainEvolutionSeries(history);

  return {
    history,
    points,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

