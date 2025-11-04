// components/atendimento/metrics/BodyMapInteractive.tsx
import React, { useState, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import type { AttendanceFormData } from '../../../schemas/attendanceFormValidation';

interface PainPoint {
  id: string;
  label: string;
  x: number; // Posição X em %
  y: number; // Posição Y em %
  intensity?: number; // 0-10
}

// Definição de pontos anatômicos clicáveis (vista frontal)
const ANATOMICAL_POINTS_FRONT: Record<string, { x: number; y: number; label: string }> = {
  // Cabeça e pescoço
  head: { x: 50, y: 8, label: 'Cabeça' },
  neck_front: { x: 50, y: 14, label: 'Pescoço (Anterior)' },

  // Ombros
  shoulder_left: { x: 38, y: 20, label: 'Ombro Esquerdo' },
  shoulder_right: { x: 62, y: 20, label: 'Ombro Direito' },

  // Tórax e abdômen
  chest_upper: { x: 50, y: 26, label: 'Tórax Superior' },
  chest_lower: { x: 50, y: 32, label: 'Tórax Inferior' },
  abdomen_upper: { x: 50, y: 38, label: 'Abdômen Superior' },
  abdomen_lower: { x: 50, y: 44, label: 'Abdômen Inferior' },

  // Membros superiores
  arm_left_upper: { x: 30, y: 28, label: 'Braço Esquerdo (Superior)' },
  arm_right_upper: { x: 70, y: 28, label: 'Braço Direito (Superior)' },
  elbow_left: { x: 26, y: 36, label: 'Cotovelo Esquerdo' },
  elbow_right: { x: 74, y: 36, label: 'Cotovelo Direito' },
  forearm_left: { x: 22, y: 42, label: 'Antebraço Esquerdo' },
  forearm_right: { x: 78, y: 42, label: 'Antebraço Direito' },
  wrist_left: { x: 20, y: 48, label: 'Punho Esquerdo' },
  wrist_right: { x: 80, y: 48, label: 'Punho Direito' },
  hand_left: { x: 18, y: 52, label: 'Mão Esquerda' },
  hand_right: { x: 82, y: 52, label: 'Mão Direita' },

  // Quadril e região pélvica
  hip_left: { x: 44, y: 50, label: 'Quadril Esquerdo' },
  hip_right: { x: 56, y: 50, label: 'Quadril Direito' },

  // Membros inferiores
  thigh_left: { x: 44, y: 60, label: 'Coxa Esquerda' },
  thigh_right: { x: 56, y: 60, label: 'Coxa Direita' },
  knee_left: { x: 44, y: 70, label: 'Joelho Esquerdo' },
  knee_right: { x: 56, y: 70, label: 'Joelho Direito' },
  leg_left: { x: 44, y: 80, label: 'Perna Esquerda' },
  leg_right: { x: 56, y: 80, label: 'Perna Direita' },
  ankle_left: { x: 44, y: 90, label: 'Tornozelo Esquerdo' },
  ankle_right: { x: 56, y: 90, label: 'Tornozelo Direito' },
  foot_left: { x: 44, y: 96, label: 'Pé Esquerdo' },
  foot_right: { x: 56, y: 96, label: 'Pé Direito' },
};

// Pontos anatômicos clicáveis (vista posterior)
const ANATOMICAL_POINTS_BACK: Record<string, { x: number; y: number; label: string }> = {
  // Cabeça e pescoço
  head_back: { x: 50, y: 8, label: 'Cabeça (Posterior)' },
  neck_back: { x: 50, y: 14, label: 'Pescoço (Posterior)' },

  // Ombros e escápulas
  shoulder_left_back: { x: 38, y: 20, label: 'Ombro Esquerdo (Posterior)' },
  shoulder_right_back: { x: 62, y: 20, label: 'Ombro Direito (Posterior)' },
  scapula_left: { x: 40, y: 24, label: 'Escápula Esquerda' },
  scapula_right: { x: 60, y: 24, label: 'Escápula Direita' },

  // Coluna vertebral
  cervical_spine: { x: 50, y: 16, label: 'Coluna Cervical' },
  thoracic_spine: { x: 50, y: 28, label: 'Coluna Torácica' },
  lumbar_spine: { x: 50, y: 42, label: 'Coluna Lombar' },
  sacrum: { x: 50, y: 50, label: 'Sacro' },

  // Membros superiores (posterior)
  arm_left_back: { x: 30, y: 28, label: 'Braço Esquerdo (Posterior)' },
  arm_right_back: { x: 70, y: 28, label: 'Braço Direito (Posterior)' },
  elbow_left_back: { x: 26, y: 36, label: 'Cotovelo Esquerdo (Posterior)' },
  elbow_right_back: { x: 74, y: 36, label: 'Cotovelo Direito (Posterior)' },

  // Região glútea
  gluteal_left: { x: 44, y: 52, label: 'Região Glútea Esquerda' },
  gluteal_right: { x: 56, y: 52, label: 'Região Glútea Direita' },

  // Membros inferiores (posterior)
  hamstring_left: { x: 44, y: 62, label: 'Posterior da Coxa Esquerda' },
  hamstring_right: { x: 56, y: 62, label: 'Posterior da Coxa Direita' },
  knee_left_back: { x: 44, y: 70, label: 'Joelho Esquerdo (Posterior)' },
  knee_right_back: { x: 56, y: 70, label: 'Joelho Direito (Posterior)' },
  calf_left: { x: 44, y: 80, label: 'Panturrilha Esquerda' },
  calf_right: { x: 56, y: 80, label: 'Panturrilha Direita' },
  ankle_left_back: { x: 44, y: 90, label: 'Tornozelo Esquerdo (Posterior)' },
  ankle_right_back: { x: 56, y: 90, label: 'Tornozelo Direito (Posterior)' },
};

export const BodyMapInteractive: React.FC = () => {
  const { setValue, watch } = useFormContext<AttendanceFormData>();
  const painPoints = watch('painPoints') || [];

  const [view, setView] = useState<'front' | 'back'>('front');
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [intensityMode, setIntensityMode] = useState(false);

  const currentPoints = view === 'front' ? ANATOMICAL_POINTS_FRONT : ANATOMICAL_POINTS_BACK;

  // Toggle ponto de dor
  const handlePointClick = useCallback(
    (pointId: string) => {
      const point = currentPoints[pointId];
      if (!point) return;

      const isAlreadySelected = painPoints.includes(point.label);

      let newPainPoints: string[];
      if (isAlreadySelected) {
        // Remover ponto
        newPainPoints = painPoints.filter((p) => p !== point.label);
      } else {
        // Adicionar ponto
        newPainPoints = [...painPoints, point.label];
      }

      setValue('painPoints', newPainPoints, { shouldDirty: true, shouldValidate: true });

      // Mostrar modal de intensidade (opcional)
      if (!isAlreadySelected && intensityMode) {
        setSelectedPoint(pointId);
      }
    },
    [currentPoints, painPoints, setValue, intensityMode]
  );

  // Verificar se ponto está selecionado
  const isPointSelected = useCallback(
    (pointId: string) => {
      const point = currentPoints[pointId];
      return point && painPoints.includes(point.label);
    },
    [currentPoints, painPoints]
  );

  // Remover ponto da lista
  const handleRemovePoint = useCallback(
    (label: string) => {
      const newPainPoints = painPoints.filter((p) => p !== label);
      setValue('painPoints', newPainPoints, { shouldDirty: true });
    },
    [painPoints, setValue]
  );

  // Limpar todos os pontos
  const handleClearAll = useCallback(() => {
    setValue('painPoints', [], { shouldDirty: true });
  }, [setValue]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-900">Mapa Corporal Interativo</h3>
          <div className="group relative">
            <Info className="w-4 h-4 text-slate-400 cursor-help" />
            <div className="absolute left-0 top-6 w-64 bg-slate-800 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl">
              Clique nas áreas do corpo para marcar pontos de dor. Use o toggle para alternar entre
              vista frontal e posterior.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {painPoints.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-slate-500 hover:text-red-600 transition-colors"
            >
              Limpar Todos
            </button>
          )}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setView('front')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            view === 'front'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Vista Frontal
        </button>
        <button
          onClick={() => setView('back')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            view === 'back'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Vista Posterior
        </button>
      </div>

      {/* Body Map SVG */}
      <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-8 border border-slate-200">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md mx-auto"
          >
            {/* SVG Container */}
            <svg viewBox="0 0 100 100" className="w-full h-auto">
              {/* Silhueta simples do corpo (frontal) */}
              {view === 'front' && (
                <g opacity="0.2" fill="#475569">
                  {/* Cabeça */}
                  <ellipse cx="50" cy="8" rx="6" ry="7" />
                  {/* Pescoço */}
                  <rect x="48" y="12" width="4" height="4" />
                  {/* Torso */}
                  <path d="M 40 20 Q 50 18 60 20 L 58 50 Q 50 52 42 50 Z" />
                  {/* Braços */}
                  <path d="M 40 20 L 30 28 L 26 36 L 22 42 L 20 48 L 18 52" stroke="#475569" strokeWidth="2" fill="none" />
                  <path d="M 60 20 L 70 28 L 74 36 L 78 42 L 80 48 L 82 52" stroke="#475569" strokeWidth="2" fill="none" />
                  {/* Pernas */}
                  <path d="M 44 50 L 44 60 L 44 70 L 44 80 L 44 90 L 44 96" stroke="#475569" strokeWidth="3" fill="none" />
                  <path d="M 56 50 L 56 60 L 56 70 L 56 80 L 56 90 L 56 96" stroke="#475569" strokeWidth="3" fill="none" />
                </g>
              )}

              {/* Silhueta simples do corpo (posterior) */}
              {view === 'back' && (
                <g opacity="0.2" fill="#475569">
                  {/* Cabeça */}
                  <ellipse cx="50" cy="8" rx="6" ry="7" />
                  {/* Pescoço */}
                  <rect x="48" y="12" width="4" height="4" />
                  {/* Torso com coluna */}
                  <path d="M 40 20 Q 50 18 60 20 L 58 50 Q 50 52 42 50 Z" />
                  <line x1="50" y1="16" x2="50" y2="50" stroke="#475569" strokeWidth="1.5" />
                  {/* Braços */}
                  <path d="M 40 20 L 30 28 L 26 36" stroke="#475569" strokeWidth="2" fill="none" />
                  <path d="M 60 20 L 70 28 L 74 36" stroke="#475569" strokeWidth="2" fill="none" />
                  {/* Pernas */}
                  <path d="M 44 50 L 44 60 L 44 70 L 44 80 L 44 90 L 44 96" stroke="#475569" strokeWidth="3" fill="none" />
                  <path d="M 56 50 L 56 60 L 56 70 L 56 80 L 56 90 L 56 96" stroke="#475569" strokeWidth="3" fill="none" />
                </g>
              )}

              {/* Pontos clicáveis */}
              {Object.entries(currentPoints).map(([pointId, point]) => {
                const selected = isPointSelected(pointId);
                return (
                  <g key={pointId}>
                    {/* Círculo clicável */}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="3"
                      className={`cursor-pointer transition-all ${
                        selected
                          ? 'fill-red-500 stroke-red-700 stroke-2'
                          : 'fill-blue-400 fill-opacity-40 stroke-blue-600 stroke-1 hover:fill-blue-500 hover:fill-opacity-60'
                      }`}
                      onClick={() => handlePointClick(pointId)}
                    >
                      <title>{point.label}</title>
                    </circle>

                    {/* Label ao hover */}
                    {selected && (
                      <motion.g
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <rect
                          x={point.x - 15}
                          y={point.y - 12}
                          width="30"
                          height="6"
                          rx="2"
                          fill="#dc2626"
                          opacity="0.9"
                        />
                        <text
                          x={point.x}
                          y={point.y - 8}
                          textAnchor="middle"
                          fontSize="2.5"
                          fill="white"
                          fontWeight="600"
                        >
                          Dor
                        </text>
                      </motion.g>
                    )}
                  </g>
                );
              })}
            </svg>
          </motion.div>
        </AnimatePresence>

        {/* Legenda */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400 border-2 border-blue-600" />
            <span className="text-slate-600">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-700" />
            <span className="text-slate-600">Com Dor</span>
          </div>
        </div>
      </div>

      {/* Lista de Pontos Selecionados */}
      {painPoints.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
            <span>Pontos de Dor Registrados</span>
            <span className="text-sm font-normal text-red-700">({painPoints.length})</span>
          </h4>

          <div className="flex flex-wrap gap-2">
            {painPoints.map((label) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 bg-white border border-red-300 rounded-lg px-3 py-1.5 text-sm"
              >
                <span className="text-red-800 font-medium">{label}</span>
                <button
                  onClick={() => handleRemovePoint(label)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Info adicional */}
      {painPoints.length === 0 && (
        <div className="text-center text-sm text-slate-500 py-4">
          Clique nos pontos azuis no mapa corporal para registrar áreas de dor
        </div>
      )}
    </div>
  );
};
