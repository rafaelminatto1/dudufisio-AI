// hooks/useProtocolsData.ts
import { useState, useEffect, useCallback } from 'react';
import * as protocolsService from '../services/protocolsService';
import { integratedProtocolsService } from '../services/integratedProtocolsService';
export function useProtocolsData(filters) {
    const [protocols, setProtocols] = useState([]);
    const [analytics, setAnalytics] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [integratedStats, setIntegratedStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
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
        }
        catch (err) {
            setError(err);
        }
        finally {
            setIsLoading(false);
        }
    }, [filters]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    const prescribeProtocol = useCallback(async (protocolId, patientId) => {
        try {
            await protocolsService.prescribeProtocol(protocolId, patientId, 'current-user');
            await fetchData();
            return true;
        }
        catch (err) {
            setError(err);
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
