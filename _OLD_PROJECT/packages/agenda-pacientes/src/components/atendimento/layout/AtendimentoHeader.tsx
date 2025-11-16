// components/atendimento/layout/AtendimentoHeader.tsx
import React from 'react';
import { ArrowLeft, Play, Pause, Square, Save } from 'lucide-react';
import { SaveStatusBadge } from '../../ui/SaveStatusBadge';
import type { Patient, Appointment } from '../../../types';

interface AtendimentoHeaderProps {
  patient: Patient;
  appointment: Appointment;
  saveStatus: 'saved' | 'saving' | 'error' | 'unsaved';
  canFinish: boolean;
  onFinish: () => void;
  onBack?: () => void;
}

export const AtendimentoHeader: React.FC<AtendimentoHeaderProps> = ({
  patient,
  appointment,
  saveStatus,
  canFinish,
  onFinish,
  onBack,
}) => {
  const {
    duration,
    isActive,
    isPaused,
    start,
    pause,
    resume,
  } = useAtendimentoTimer();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Esquerda: Voltar + Info Paciente */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {patient.name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{patient.name}</h1>
              <p className="text-sm text-slate-600">
                {new Date(appointment.date).toLocaleDateString('pt-BR')} às{' '}
                {appointment.time}
              </p>
            </div>
          </div>
        </div>

        {/* Centro: Timer + Controles */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 ${isPaused ? 'bg-amber-50' : 'bg-slate-50'}`}>
            <span className="font-mono text-sm font-medium text-slate-700">
              {formatDuration(duration)}
            </span>
            {isActive && !isPaused && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>

          {!isActive ? (
            <button
              onClick={start}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              aria-label="Iniciar sessão"
              title="Iniciar sessão (ou pressione Ctrl+P)"
            >
              <Play className="w-4 h-4" />
            </button>
          ) : isPaused ? (
            <button
              onClick={resume}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              aria-label="Retomar sessão"
            >
              <Play className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={pause}
              className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              aria-label="Pausar sessão"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Direita: Status + Finalizar */}
        <div className="flex items-center gap-3">
          <SaveStatusBadge status={saveStatus} />

          <button
            onClick={onFinish}
            disabled={!canFinish || saveStatus === 'saving'}
            className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-sm transition-colors disabled:bg-green-300 disabled:cursor-not-allowed flex items-center gap-2"
            title={!canFinish ? 'Preencha todos os campos obrigatórios' : 'Finalizar sessão (Ctrl+Enter)'}
          >
            <Save className="w-5 h-5" />
            Finalizar Sessão
          </button>
        </div>
      </div>
    </header>
  );
};
