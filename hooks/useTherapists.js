// hooks/useTherapists.ts
import { useState, useEffect, useCallback } from 'react';
import * as therapistService from '../services/therapistService';
import { useToast } from '../contexts/ToastContext';
export const useTherapists = () => {
    const [therapists, setTherapists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const fetchTherapists = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedTherapists = await therapistService.getTherapists();
            setTherapists(fetchedTherapists);
            setError(null);
        }
        catch (err) {
            setError(err);
            showToast("Falha ao carregar lista de terapeutas.", "error");
        }
        finally {
            setIsLoading(false);
        }
    }, [showToast]);
    useEffect(() => {
        fetchTherapists();
    }, [fetchTherapists]);
    return { therapists, isLoading, error };
};
