// hooks/useProtocolsData.ts
import { useState, useEffect, useCallback } from 'react';
import { Protocol, ProtocolCategory, EvidenceLevel, ProtocolAnalytics, ProtocolPrescription } from '../types';
import * as protocolsService from '../services/protocolsService';
import { integratedProtocolsService } from '../services/integratedProtocolsService';

interface ProtocolFilters {
  category?: ProtocolCategory;
  evidenceLevel?: EvidenceLevel;
  isActive?: boolean;
  searchTerm?: string;
  specialty?: string;
  includeClinical?: boolean;
  includeSystem?: boolean;
}

export function useProtocolsData(filters: ProtocolFilters) {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [analytics, setAnalytics] = useState<ProtocolAnalytics[]>([]);
  const [prescriptions, setPrescriptions] = useState<ProtocolPrescription[]>([]);
  const [integratedStats, setIntegratedStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [protocolsData, analyticsData, prescriptionsData, statsData] = await Promise.all([
        integratedProtocolsService.getAllProtocols(filters),
        protocolsService.getProtocolAnalytics(),
        protocolsService.getProtocolPrescriptions(),
        integratedProtocolsService.getIntegratedStats(),
      ]);

      setProtocols(protocolsData);
      setAnalytics(analyticsData);
      setPrescriptions(prescriptionsData);
      setIntegratedStats(statsData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const prescribeProtocol = useCallback(async (protocolId: string, patientId: string) => {
    try {
      await protocolsService.prescribeProtocol(protocolId, patientId, 'current-user');
      await fetchData();
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  }, [fetchData]);

  return {
    protocols,
    analytics,
    prescriptions,
    integratedStats,
    isLoading,
    error,
    prescribeProtocol,
    refresh: fetchData,
  };
}
