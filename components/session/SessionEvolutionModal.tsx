import React, { useState, useEffect } from 'react';
import { X, Save, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../contexts/ToastContext';
import SessionEvolutionContainer from './SessionEvolutionContainer';
import { Patient, EnrichedAppointment } from '../../types';
import * as appointmentService from '../../services/appointmentService';
import * as patientService from '../../services/patientService';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * OPÇÃO 2: Modal Fullscreen para Evolução de Sessão
 * Abre sobre a agenda
 * z-index alto, cobre toda tela
 */

interface SessionEvolutionModalProps {
  isOpen: boolean;
  appointmentId: string;
  onClose: () => void;
  onSave?: () => void;
}

export const SessionEvolutionModal: React.FC<SessionEvolutionModalProps> = ({
  isOpen,
  appointmentId,
  onClose,
  onSave,
}) => {
  const { showToast } = useToast();
  
  const [appointment, setAppointment] = useState<EnrichedAppointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMaximized, setIsMaximized] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
      // Prevenir scroll do body quando modal está aberto
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, appointmentId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Buscar agendamento
      const appointments = await appointmentService.getAppointments();
      const foundAppointment = appointments.find(a => a.id === appointmentId);

      if (!foundAppointment) {
        showToast('Agendamento não encontrado', 'error');
        onClose();
        return;
      }

      setAppointment(foundAppointment as EnrichedAppointment);

      // Buscar paciente
      const patientData = await patientService.getPatientById(foundAppointment.patientId);
      if (!patientData) {
        showToast('Paciente não encontrado', 'error');
        onClose();
        return;
      }

      setPatient(patientData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showToast('Erro ao carregar dados da sessão', 'error');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    showToast('Sessão salva com sucesso!', 'success');
    if (onSave) {
      onSave();
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-[9999] bg-white shadow-2xl ${
              isMaximized
                ? 'inset-0'
                : 'inset-4 md:inset-8 lg:inset-16 rounded-2xl'
            }`}
            onKeyDown={handleKeyDown}
          >
            {/* Modal Header */}
            <div className="flex flex-col border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              {/* Title Row */}
              <div className="flex items-center justify-between px-6 py-4">
                {/* Left: Title and info */}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Evolução de Sessão
                  </h2>
                  {patient && appointment && (
                    <p className="text-sm text-slate-600 mt-1">
                      {patient.name} • {new Date(appointment.startTime).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(appointment.startTime).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-2">
                  {/* Maximize/Minimize */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMaximized(!isMaximized)}
                    className="hidden md:flex"
                    title={isMaximized ? 'Restaurar' : 'Maximizar'}
                  >
                    {isMaximized ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </Button>

                  {/* Save */}
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">Salvar</span>
                  </Button>

                  {/* Close */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="hover:bg-white/50"
                    title="Fechar (Esc)"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Info Row */}
              {patient && appointment && (
                <div className="px-6 py-3 bg-white/50 border-t border-slate-200">
                  <div className="flex items-center space-x-6 text-sm">
                    <div>
                      <span className="text-slate-500">Tipo:</span>
                      <span className="ml-2 font-medium text-slate-900">
                        {appointment.type}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Status:</span>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                        appointment.status === 'Realizado'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                    {appointment.sessionNumber && (
                      <div>
                        <span className="text-slate-500">Sessão:</span>
                        <span className="ml-2 font-medium text-slate-900">
                          #{appointment.sessionNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden" style={{ height: 'calc(100% - 140px)' }}>
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Carregando dados da sessão...</p>
                  </div>
                </div>
              ) : patient && appointment ? (
                <SessionEvolutionContainer
                  appointmentId={appointmentId}
                  patient={patient}
                  appointment={appointment}
                  onClose={onClose}
                  onSave={handleSave}
                  layout="4-columns"
                  soapFormSlot={
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Formulário SOAP</h3>
                      <p className="text-slate-600">Componente SOAPFormPanel será inserido aqui</p>
                    </div>
                  }
                  historySlot={
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Histórico & Condutas</h3>
                      <p className="text-slate-600">Componente SessionHistoryPanel será inserido aqui</p>
                    </div>
                  }
                  evolutionSlot={
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Testes & Evolução</h3>
                      <p className="text-slate-600">Componente TestEvolutionPanel será inserido aqui</p>
                    </div>
                  }
                  summarySlot={
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Resumo Paciente</h3>
                      <p className="text-slate-600">Componente PatientGoalsPanel será inserido aqui</p>
                    </div>
                  }
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-600">Dados não encontrados</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SessionEvolutionModal;

