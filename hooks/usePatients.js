// hooks/usePatients.ts
import { useState, useCallback, useEffect } from 'react';
import * as patientService from '../services/patientService';
import { useToast } from '../contexts/ToastContext';
import { eventService } from '../services/eventService';
export const usePatients = () => {
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);
    const [currentFilters, setCurrentFilters] = useState({ searchTerm: '', statusFilter: 'All', startDate: '', endDate: '', therapistId: 'All' });
    const { showToast } = useToast();
    const fetchPatients = useCallback(async (filters, cursor) => {
        if (cursor) {
            setIsLoadingMore(true);
        }
        else {
            setIsLoading(true);
        }
        setError(null);
        try {
            const result = await patientService.getPatients({
                ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
                ...(filters.statusFilter && { statusFilter: filters.statusFilter }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate }),
                ...(filters.therapistId && { therapistId: filters.therapistId }),
                ...(cursor !== null && cursor !== undefined && { cursor }),
                limit: 15
            });
            setPatients(prev => cursor ? [...prev, ...result.patients] : result.patients);
            setNextCursor(result.nextCursor);
            setHasMore(!!result.nextCursor);
        }
        catch (err) {
            setError(err);
            showToast('Falha ao carregar pacientes.', 'error');
        }
        finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [showToast]);
    const fetchInitialPatients = useCallback((filters) => {
        setCurrentFilters(filters);
        fetchPatients(filters, null);
    }, [fetchPatients]);
    const fetchMorePatients = useCallback(() => {
        if (isLoadingMore || !hasMore)
            return;
        fetchPatients(currentFilters, nextCursor);
    }, [isLoadingMore, hasMore, nextCursor, fetchPatients, currentFilters]);
    const addPatient = async (patientData) => {
        try {
            await patientService.addPatient(patientData);
            showToast("Paciente adicionado com sucesso!", "success");
            // The event listener will handle the refetch
        }
        catch (err) {
            showToast("Falha ao adicionar paciente.", "error");
        }
    };
    // Listen for global patient changes to refresh the list
    useEffect(() => {
        const handlePatientsChanged = () => {
            fetchInitialPatients(currentFilters);
        };
        eventService.on('patients:changed', handlePatientsChanged);
        return () => {
            eventService.off('patients:changed', handlePatientsChanged);
        };
    }, [currentFilters, fetchInitialPatients]);
    return {
        patients,
        isLoading,
        isLoadingMore,
        hasMore,
        error,
        fetchInitialPatients,
        fetchMorePatients,
        addPatient,
    };
};
