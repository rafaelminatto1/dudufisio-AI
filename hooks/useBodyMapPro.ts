/**
 * useBodyMapPro.ts
 * Professional-grade body map state management hook
 * Simplified version compatible with current project structure
 *
 * @author DuduFisio-AI Engineering Team
 * @version 2.0.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BodyPoint, BodyMapState, BodyMapAnalytics } from '../types';
import * as bodyMapService from '../services/bodyMapService';
import { useToast } from '../contexts/ToastContext';

/**
 * Return type for useBodyMapPro hook
 */
interface UseBodyMapProReturn {
  state: BodyMapState;
  analytics: BodyMapAnalytics;
  actions: {
    addPoint: (point: Omit<BodyPoint, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updatePoint: (id: string, data: Partial<BodyPoint>) => Promise<void>;
    deletePoint: (id: string) => Promise<void>;
    selectPoint: (point: BodyPoint | null) => void;
    clearSelection: () => void;
    switchSide: (side: 'front' | 'back') => void;
    setTimelineDate: (date: Date) => void;
    refreshData: () => Promise<void>;
    undoLastAction: () => void;
    redoLastAction: () => void;
  };
  isLoading: boolean;
  error: string | null;
}

/**
 * Professional body map hook with advanced features
 */
export const useBodyMapPro = (
  patientId: string,
  sessionId?: string
): UseBodyMapProReturn => {
  const { showToast } = useToast();

  // State management
  const [state, setState] = useState<BodyMapState>({
    points: [],
    selectedPoint: null,
    activeSide: 'front',
    timelineDate: new Date(),
    isLoading: false,
    error: null
  });

  const [analytics, setAnalytics] = useState<BodyMapAnalytics>({
    totalPoints: 0,
    averagePainLevel: 0,
    painTrends: [],
    regionDistribution: {},
    painTypeDistribution: {},
    symptomFrequency: {}
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch body map data';
      setError(errorMessage);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    } finally {
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
    addPoint: async (point: Omit<BodyPoint, 'id' | 'createdAt' | 'updatedAt'>) => {
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
      } catch (error: any) {
        showToast(error.message || 'Erro ao adicionar ponto', 'error');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },

    updatePoint: async (id: string, data: Partial<BodyPoint>) => {
      setIsLoading(true);

      try {
        const updatedPoint = await bodyMapService.updateBodyPoint(id, data);

        setState(prev => ({
          ...prev,
          points: prev.points.map(point =>
            point.id === id ? updatedPoint : point
          )
        }));

        // Refresh analytics
        const newAnalytics = await bodyMapService.getBodyMapAnalytics(patientId);
        setAnalytics(newAnalytics);

        showToast('Ponto atualizado com sucesso!', 'success');
      } catch (error: any) {
        showToast(error.message || 'Erro ao atualizar ponto', 'error');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },

    deletePoint: async (id: string) => {
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
      } catch (error: any) {
        showToast(error.message || 'Erro ao remover ponto', 'error');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },

    selectPoint: (point: BodyPoint | null) => {
      setState(prev => ({ ...prev, selectedPoint: point }));
    },

    clearSelection: () => {
      setState(prev => ({ ...prev, selectedPoint: null }));
    },

    switchSide: (side: 'front' | 'back') => {
      setState(prev => ({
        ...prev,
        activeSide: side,
        selectedPoint: null
      }));
    },

    setTimelineDate: (date: Date) => {
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