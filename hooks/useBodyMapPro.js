/**
 * useBodyMapPro.ts
 * Professional-grade body map state management hook
 * Simplified version compatible with current project structure
 *
 * @author DuduFisio-AI Engineering Team
 * @version 2.0.0
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import * as bodyMapService from '../services/bodyMapService';
import { useToast } from '../contexts/ToastContext';
/**
 * Professional body map hook with advanced features
 */
export const useBodyMapPro = (patientId, sessionId) => {
    const { showToast } = useToast();
    // State management
    const [state, setState] = useState({
        points: [],
        selectedPoint: null,
        activeSide: 'front',
        timelineDate: new Date(),
        isLoading: false,
        error: null
    });
    const [analytics, setAnalytics] = useState({
        totalPoints: 0,
        averagePainLevel: 0,
        painTrends: [],
        regionDistribution: {},
        painTypeDistribution: {},
        symptomFrequency: {}
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    /**
     * Fetch body points and analytics
     */
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [points, analyticsData] = await Promise.all([
                bodyMapService.getBodyPointsByPatientId(patientId),
                bodyMapService.getBodyMapAnalytics(patientId)
            ]);
            setState(prev => ({
                ...prev,
                points,
                isLoading: false,
                error: null
            }));
            setAnalytics(analyticsData);
        }
        catch (err) {
            const errorMessage = err.message || 'Failed to fetch body map data';
            setError(errorMessage);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage
            }));
        }
        finally {
            setIsLoading(false);
        }
    }, [patientId]);
    /**
     * Load data on mount and when patientId changes
     */
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    /**
     * Action creators with optimistic updates
     */
    const actions = useMemo(() => ({
        addPoint: async (point) => {
            setIsLoading(true);
            try {
                const newPoint = await bodyMapService.addBodyPoint(point);
                setState(prev => ({
                    ...prev,
                    points: [newPoint, ...prev.points]
                }));
                // Refresh analytics
                const newAnalytics = await bodyMapService.getBodyMapAnalytics(patientId);
                setAnalytics(newAnalytics);
                showToast('Ponto adicionado com sucesso!', 'success');
            }
            catch (error) {
                showToast(error.message || 'Erro ao adicionar ponto', 'error');
                throw error;
            }
            finally {
                setIsLoading(false);
            }
        },
        updatePoint: async (id, data) => {
            setIsLoading(true);
            try {
                const updatedPoint = await bodyMapService.updateBodyPoint(id, data);
                setState(prev => ({
                    ...prev,
                    points: prev.points.map(point => point.id === id ? updatedPoint : point)
                }));
                // Refresh analytics
                const newAnalytics = await bodyMapService.getBodyMapAnalytics(patientId);
                setAnalytics(newAnalytics);
                showToast('Ponto atualizado com sucesso!', 'success');
            }
            catch (error) {
                showToast(error.message || 'Erro ao atualizar ponto', 'error');
                throw error;
            }
            finally {
                setIsLoading(false);
            }
        },
        deletePoint: async (id) => {
            setIsLoading(true);
            try {
                await bodyMapService.deleteBodyPoint(id);
                setState(prev => ({
                    ...prev,
                    points: prev.points.filter(point => point.id !== id),
                    selectedPoint: prev.selectedPoint?.id === id ? null : prev.selectedPoint
                }));
                // Refresh analytics
                const newAnalytics = await bodyMapService.getBodyMapAnalytics(patientId);
                setAnalytics(newAnalytics);
                showToast('Ponto removido com sucesso!', 'success');
            }
            catch (error) {
                showToast(error.message || 'Erro ao remover ponto', 'error');
                throw error;
            }
            finally {
                setIsLoading(false);
            }
        },
        selectPoint: (point) => {
            setState(prev => ({ ...prev, selectedPoint: point }));
        },
        clearSelection: () => {
            setState(prev => ({ ...prev, selectedPoint: null }));
        },
        switchSide: (side) => {
            setState(prev => ({
                ...prev,
                activeSide: side,
                selectedPoint: null
            }));
        },
        setTimelineDate: (date) => {
            setState(prev => ({ ...prev, timelineDate: date }));
        },
        refreshData: async () => {
            await fetchData();
        },
        undoLastAction: () => {
            // Placeholder for undo functionality
            console.log('Undo functionality would be implemented here');
        },
        redoLastAction: () => {
            // Placeholder for redo functionality
            console.log('Redo functionality would be implemented here');
        }
    }), [patientId, showToast, fetchData]);
    return {
        state,
        analytics,
        actions,
        isLoading,
        error
    };
};
