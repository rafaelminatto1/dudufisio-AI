// components/atendimento/layout/AtendimentoContextPanel.tsx
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SessionHistoryCard } from '../context/SessionHistoryCard';
import { TreatmentPlanCard } from '../context/TreatmentPlanCard';
import { ExercisesCard } from '../context/ExercisesCard';
import type { Patient, SoapNote, TreatmentPlan, ExercisePrescription } from '../../../types';

interface AtendimentoContextPanelProps {
  patient: Patient;
  sessions: SoapNote[];
  treatmentPlan?: TreatmentPlan | null;
  exercises: ExercisePrescription[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onViewSession?: (session: SoapNote) => void;
  onRepeatSession?: (session: SoapNote) => void;
}

export const AtendimentoContextPanel: React.FC<AtendimentoContextPanelProps> = ({
  patient,
  sessions,
  treatmentPlan,
  exercises,
  isCollapsed,
  onToggleCollapse,
  onViewSession,
  onRepeatSession,
}) => {
  return (
    <AnimatePresence mode="wait">
      {isCollapsed ? (
        // Estado Colapsado
        <motion.div
          key="collapsed"
          initial={{ width: 0 }}
          animate={{ width: '48px' }}
          exit={{ width: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 bg-white border-l border-slate-200 overflow-hidden"
        >
          <div className="flex flex-col items-center py-4">
            <button
              onClick={onToggleCollapse}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Expandir painel de contexto"
              title="Expandir contexto (Ctrl+H)"
            >
              <ChevronRight className="w-5 h-5 text-slate-600 rotate-180" />
            </button>

            {/* Texto vertical */}
            <div className="mt-8 [writing-mode:vertical-lr] rotate-180">
              <span className="text-xs font-medium text-slate-500">CONTEXTO</span>
            </div>
          </div>
        </motion.div>
      ) : (
        // Estado Expandido
        <motion.div
          key="expanded"
          initial={{ width: 0 }}
          animate={{ width: '320px' }}
          exit={{ width: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 bg-white border-l border-slate-200 overflow-hidden"
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Contexto</h3>
              <button
                onClick={onToggleCollapse}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
                aria-label="Colapsar painel"
                title="Colapsar (Ctrl+H)"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Conteúdo Scrollável */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Dados do Paciente (compacto) */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-medium text-slate-900 mb-1">{patient.name}</p>
                <div className="space-y-0.5 text-xs text-slate-600">
                  <p>📞 {patient.phone}</p>
                  {patient.age && <p>🎂 {patient.age} anos</p>}
                  {patient.gender && (
                    <p>{patient.gender === 'male' ? '👨' : patient.gender === 'female' ? '👩' : '👤'} {patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Feminino' : 'Outro'}</p>
                  )}
                </div>
              </div>

              {/* Histórico de Sessões */}
              <SessionHistoryCard
                sessions={sessions}
                onViewSession={onViewSession}
                onRepeatSession={onRepeatSession}
              />

              {/* Plano de Tratamento */}
              {treatmentPlan && <TreatmentPlanCard plan={treatmentPlan} />}

              {/* Exercícios */}
              {exercises.length > 0 && <ExercisesCard exercises={exercises} />}

              {/* Espaço extra para scroll */}
              <div className="h-4" />
            </div>

            {/* Footer (opcional) */}
            <div className="border-t border-slate-200 p-3 bg-slate-50">
              <p className="text-xs text-slate-500 text-center">
                Use <kbd className="px-1 py-0.5 bg-white rounded text-[10px] border border-slate-300">Ctrl+H</kbd> para ocultar/mostrar
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
