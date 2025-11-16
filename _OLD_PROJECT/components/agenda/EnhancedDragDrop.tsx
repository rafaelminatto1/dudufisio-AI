/**
 * EnhancedDragDrop Component
 * 
 * Sistema de drag & drop aprimorado com preview visual, snap inteligente e undo/redo
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnrichedAppointment } from '../../types';

interface DragState {
  appointment: EnrichedAppointment;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
}

interface HistoryState {
  appointment: EnrichedAppointment;
  oldStartTime: Date;
  oldEndTime: Date;
  newStartTime: Date;
  newEndTime: Date;
}

interface EnhancedDragDropProps {
  children: React.ReactNode;
  onMove: (appointmentId: string, newStartTime: Date, newEndTime: Date) => Promise<void>;
  snapInterval?: number; // minutos
}

export const EnhancedDragDrop: React.FC<EnhancedDragDropProps> = ({
  children,
  onMove,
  snapInterval = 15
}) => {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [previewTime, setPreviewTime] = useState<{ start: Date; end: Date } | null>(null);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calcular novo horário baseado na posição do mouse
  const calculateNewTime = (y: number): Date | null => {
    if (!dragState || !containerRef.current) return null;

    const rect = containerRef.current.getBoundingClientRect();
    const relativeY = y - rect.top;
    const minutesFromStart = Math.floor(relativeY / 2); // 2px por minuto
    const snappedMinutes = Math.round(minutesFromStart / snapInterval) * snapInterval;

    const originalDuration = dragState.appointment.endTime.getTime() - dragState.appointment.startTime.getTime();
    const newStartTime = new Date(dragState.appointment.startTime);
    newStartTime.setHours(6, snappedMinutes, 0, 0); // Assumindo que começa às 6h

    return newStartTime;
  };

  const handleDragStart = (e: React.DragEvent, appointment: EnrichedAppointment) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', appointment.id);

    setDragState({
      appointment,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      isDragging: true
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    if (!dragState) return;

    setDragState(prev => prev ? {
      ...prev,
      currentX: e.clientX,
      currentY: e.clientY
    } : null);

    const newTime = calculateNewTime(e.clientY);
    if (newTime) {
      const duration = dragState.appointment.endTime.getTime() - dragState.appointment.startTime.getTime();
      const newEndTime = new Date(newTime.getTime() + duration);
      setPreviewTime({ start: newTime, end: newEndTime });
    }
  };

  const handleDragEnd = async (e: React.DragEvent) => {
    if (!dragState || !previewTime) {
      setDragState(null);
      setPreviewTime(null);
      return;
    }

    // Salvar no histórico para undo
    const historyEntry: HistoryState = {
      appointment: dragState.appointment,
      oldStartTime: dragState.appointment.startTime,
      oldEndTime: dragState.appointment.endTime,
      newStartTime: previewTime.start,
      newEndTime: previewTime.end
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(historyEntry);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Aplicar mudança
    try {
      await onMove(dragState.appointment.id, previewTime.start, previewTime.end);
    } catch (error) {
      console.error('Erro ao mover agendamento:', error);
      // Reverter no histórico
      setHistoryIndex(historyIndex);
    }

    setDragState(null);
    setPreviewTime(null);
  };

  const handleUndo = async () => {
    if (historyIndex < 0) return;

    const historyEntry = history[historyIndex];
    if (!historyEntry) return;

    try {
      await onMove(
        historyEntry.appointment.id,
        historyEntry.oldStartTime,
        historyEntry.oldEndTime
      );
      setHistoryIndex(historyIndex - 1);
    } catch (error) {
      console.error('Erro ao desfazer:', error);
    }
  };

  const handleRedo = async () => {
    if (historyIndex >= history.length - 1) return;

    const historyEntry = history[historyIndex + 1];
    if (!historyEntry) return;

    try {
      await onMove(
        historyEntry.appointment.id,
        historyEntry.newStartTime,
        historyEntry.newEndTime
      );
      setHistoryIndex(historyIndex + 1);
    } catch (error) {
      console.error('Erro ao refazer:', error);
    }
  };

  // Atalhos de teclado para undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  return (
    <div ref={containerRef} className="relative">
      {/* Preview do agendamento sendo arrastado */}
      <AnimatePresence>
        {previewTime && dragState && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute z-50 pointer-events-none"
            style={{
              top: `${(previewTime.start.getHours() - 6) * 60 * 2 + previewTime.start.getMinutes() * 2}px`,
              left: '0',
              right: '0',
              height: `${(previewTime.end.getTime() - previewTime.start.getTime()) / (1000 * 60) * 2}px`
            }}
          >
            <div className="bg-blue-500/30 border-2 border-blue-500 border-dashed rounded-lg p-2">
              <div className="text-xs font-semibold text-blue-700">
                {dragState.appointment.patientName}
              </div>
              <div className="text-xs text-blue-600">
                {previewTime.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {' '}
                {previewTime.end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de snap */}
      {previewTime && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute left-0 right-0 border-t-2 border-dashed border-blue-400 z-40"
          style={{
            top: `${(previewTime.start.getHours() - 6) * 60 * 2 + previewTime.start.getMinutes() * 2}px`
          }}
        />
      )}

      {/* Renderizar children com props de drag */}
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            draggable: true,
            onDragStart: (e: React.DragEvent) => handleDragStart(e, child.props.appointment),
            onDrag: handleDrag,
            onDragEnd: handleDragEnd
          } as any);
        }
        return child;
      })}

      {/* Botões de undo/redo */}
      {(historyIndex >= 0 || historyIndex < history.length - 1) && (
        <div className="fixed bottom-4 right-4 flex gap-2 z-50">
          <button
            onClick={handleUndo}
            disabled={historyIndex < 0}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Desfazer (Ctrl+Z)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Desfazer
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Refazer (Ctrl+Y)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
            Refazer
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedDragDrop;

