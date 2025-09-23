/**
 * BodyMapContainer.tsx
 * Professional-grade interactive body map container component
 * Implements Clean Architecture patterns with optimized state management
 *
 * @author DuduFisio-AI Engineering Team
 * @version 2.0.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { BodyPoint, BodyMapState, BodyMapAnalytics, Patient } from '../../../types';
import { useBodyMapPro } from '../../../hooks/useBodyMapPro';
import { useToast } from '../../../contexts/ToastContext';
import BodyMapSVG from './BodyMapSVG';
import PainPointModal from './PainPointModal';
import BodyMapTimeline from './BodyMapTimeline';
import BodyMapLegend from './BodyMapLegend';
import PainScaleSelector from './PainScaleSelector';

/**
 * Props interface for BodyMapContainer
 */
interface BodyMapContainerProps {
  /** Patient data for context */
  patient: Patient;
  /** Optional session ID for linking points */
  sessionId?: string;
  /** Container CSS classes */
  className?: string;
  /** Read-only mode flag */
  readOnly?: boolean;
  /** Show timeline controls */
  showTimeline?: boolean;
  /** Show analytics panel */
  showAnalytics?: boolean;
}

/**
 * Main container component for interactive body mapping
 * Implements professional UX patterns and performance optimizations
 */
const BodyMapContainer: React.FC<BodyMapContainerProps> = ({
  patient,
  sessionId,
  className = '',
  readOnly = false,
  showTimeline = true,
  showAnalytics = true
}) => {
  // Professional state management with useBodyMapPro hook
  const {
    state,
    actions: {
      addPoint,
      updatePoint,
      deletePoint,
      selectPoint,
      clearSelection,
      switchSide,
      setTimelineDate,
      refreshData
    },
    analytics,
    isLoading,
    error
  } = useBodyMapPro(patient.id, sessionId);

  const { showToast } = useToast();

  // Local UI state
  const [showModal, setShowModal] = useState(false);
  const [newPointCoordinates, setNewPointCoordinates] = useState<{ x: number; y: number } | null>(null);

  /**
   * Handle SVG click for adding new points
   * Uses normalized coordinates (0-1) for responsiveness
   */
  const handleSVGClick = useCallback((coordinates: { x: number; y: number }, region: string) => {
    if (readOnly) return;

    setNewPointCoordinates(coordinates);
    setShowModal(true);
  }, [readOnly]);

  /**
   * Handle point selection with optimistic updates
   */
  const handlePointClick = useCallback((point: BodyPoint) => {
    selectPoint(point);
    setShowModal(true);
  }, [selectPoint]);

  /**
   * Handle point save with error handling
   */
  const handleSavePoint = useCallback(async (pointData: Partial<BodyPoint>) => {
    try {
      if (state.selectedPoint) {
        // Update existing point
        await updatePoint(state.selectedPoint.id, pointData);
        showToast('Ponto atualizado com sucesso!', 'success');
      } else if (newPointCoordinates) {
        // Add new point
        const newPoint: Omit<BodyPoint, 'id' | 'createdAt' | 'updatedAt'> = {
          patientId: patient.id,
          coordinates: newPointCoordinates,
          bodySide: state.activeSide,
          createdBy: 'current-user', // TODO: Get from auth context
          sessionId,
          ...pointData as Required<Partial<BodyPoint>>
        };

        await addPoint(newPoint);
        showToast('Ponto adicionado com sucesso!', 'success');
      }

      setShowModal(false);
      setNewPointCoordinates(null);
      clearSelection();
    } catch (error: any) {
      showToast(error.message || 'Erro ao salvar ponto', 'error');
    }
  }, [state.selectedPoint, newPointCoordinates, state.activeSide, patient.id, sessionId, updatePoint, addPoint, clearSelection, showToast]);

  /**
   * Handle point deletion with confirmation
   */
  const handleDeletePoint = useCallback(async (pointId: string) => {
    try {
      await deletePoint(pointId);
      showToast('Ponto removido com sucesso!', 'success');
      setShowModal(false);
      clearSelection();
    } catch (error: any) {
      showToast(error.message || 'Erro ao remover ponto', 'error');
    }
  }, [deletePoint, clearSelection, showToast]);

  /**
   * Memoized analytics summary
   */
  const analyticsSummary = useMemo(() => ({
    totalPoints: analytics.totalPoints,
    averagePain: analytics.averagePainLevel,
    highPainPoints: state.points.filter(p => p.painLevel >= 7).length,
    recentTrend: analytics.painTrends.length >= 2
      ? analytics.painTrends[analytics.painTrends.length - 1].averagePain -
        analytics.painTrends[analytics.painTrends.length - 2].averagePain
      : 0
  }), [analytics, state.points]);

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <Activity className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Erro no Mapa Corporal</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Analytics Summary */}
      {showAnalytics && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-slate-800">{analyticsSummary.totalPoints}</div>
            <div className="text-sm text-slate-600">Pontos Total</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{analyticsSummary.averagePain.toFixed(1)}</div>
            <div className="text-sm text-blue-600">Dor Média</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{analyticsSummary.highPainPoints}</div>
            <div className="text-sm text-red-600">Dor Intensa (7+)</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className={`w-5 h-5 ${analyticsSummary.recentTrend > 0 ? 'text-red-500' : 'text-green-500'}`} />
              <span className={`text-lg font-bold ${analyticsSummary.recentTrend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {analyticsSummary.recentTrend > 0 ? '+' : ''}{analyticsSummary.recentTrend.toFixed(1)}
              </span>
            </div>
            <div className="text-sm text-slate-600">Tendência</div>
          </div>
        </motion.div>
      )}

      {/* Side Toggle Controls */}
      <div className="flex justify-center">
        <div className="bg-white rounded-xl border border-slate-200 p-1 flex">
          <button
            onClick={() => switchSide('front')}
            className={`px-6 py-2 rounded-lg transition-all ${
              state.activeSide === 'front'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Vista Frontal
          </button>
          <button
            onClick={() => switchSide('back')}
            className={`px-6 py-2 rounded-lg transition-all ${
              state.activeSide === 'back'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Vista das Costas
          </button>
        </div>
      </div>

      {/* Main Body Map SVG */}
      <motion.div
        key={state.activeSide}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-slate-200 p-6"
      >
        <BodyMapSVG
          side={state.activeSide}
          points={state.points}
          onPointClick={handlePointClick}
          onSVGClick={handleSVGClick}
          selectedPointId={state.selectedPoint?.id}
          isLoading={isLoading}
          readOnly={readOnly}
        />
      </motion.div>

      {/* Legend */}
      <BodyMapLegend />

      {/* Timeline Component */}
      {showTimeline && (
        <BodyMapTimeline
          points={state.points}
          selectedDate={state.timelineDate}
          onDateChange={setTimelineDate}
          analytics={analytics}
        />
      )}

      {/* Point Modal */}
      <AnimatePresence>
        {showModal && (
          <PainPointModal
            point={state.selectedPoint}
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setNewPointCoordinates(null);
              clearSelection();
            }}
            onSave={handleSavePoint}
            onDelete={state.selectedPoint ? () => handleDeletePoint(state.selectedPoint!.id) : undefined}
            coordinates={newPointCoordinates}
            bodyRegion="other" // TODO: Auto-detect region from coordinates
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BodyMapContainer;