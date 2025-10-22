import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useToast } from '../contexts/ToastContext';
import SessionEvolutionContainer from '../components/session/SessionEvolutionContainer';
import { Patient, EnrichedAppointment } from '../types';
import * as appointmentService from '../services/appointmentService';
import * as patientService from '../services/patientService';
import PageLoader from '../components/ui/PageLoader';

/**
 * OPÇÃO 1: Página Nova para Evolução de Sessão
 * Rota: /atendimento/:appointmentId
 * Layout fullscreen com navegação
 */

const SessionEvolutionPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [appointment, setAppointment] = useState<EnrichedAppointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [appointmentId]);

  const loadData = async () => {
    if (!appointmentId) {
      showToast('ID do agendamento não fornecido', 'error');
      navigate('/agenda');
      return;
    }

    setIsLoading(true);
    try {
      // Buscar agendamento
      const appointments = await appointmentService.getAppointments();
      const foundAppointment = appointments.find(a => a.id === appointmentId);

      if (!foundAppointment) {
        showToast('Agendamento não encontrado', 'error');
        navigate('/agenda');
        return;
      }

      setAppointment(foundAppointment as EnrichedAppointment);

      // Buscar paciente
      const patientData = await patientService.getPatientById(foundAppointment.patientId);
      if (!patientData) {
        showToast('Paciente não encontrado', 'error');
        navigate('/agenda');
        return;
      }

      setPatient(patientData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showToast('Erro ao carregar dados da sessão', 'error');
      navigate('/agenda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/agenda');
  };

  const handleSave = async () => {
    showToast('Sessão salva com sucesso!', 'success');
    // TODO: Implementar lógica de salvamento
  };

  if (isLoading) {
    return <PageLoader message="Carregando sessão..." />;
  }

  if (!appointment || !patient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-slate-600 mb-4">Dados não encontrados</p>
          <Button onClick={handleClose}>
            Voltar para Agenda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left: Back button and title */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar para Agenda</span>
            </Button>

            <div className="border-l border-slate-300 pl-4">
              <h1 className="text-xl font-bold text-slate-900">
                Evolução de Sessão
              </h1>
              <p className="text-sm text-slate-600">
                {patient.name} • Sessão #{appointment.sessionNumber || 'Nova'}
              </p>
            </div>
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Cancelar</span>
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Salvar Sessão</span>
            </Button>
          </div>
        </div>

        {/* Sub-header com informações da sessão */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div>
                <span className="text-slate-500">Data:</span>
                <span className="ml-2 font-medium text-slate-900">
                  {new Date(appointment.startTime).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Horário:</span>
                <span className="ml-2 font-medium text-slate-900">
                  {new Date(appointment.startTime).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Tipo:</span>
                <span className="ml-2 font-medium text-slate-900">
                  {appointment.type}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                appointment.status === 'Realizado'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {appointment.status}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Session Evolution Container */}
      <main className="flex-1 overflow-hidden">
        <SessionEvolutionContainer
          appointmentId={appointmentId!}
          patient={patient}
          appointment={appointment}
          onClose={handleClose}
          onSave={handleSave}
          layout="4-columns"
          soapFormSlot={
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Formulário SOAP</h2>
              <p className="text-slate-600">Componente SOAPFormPanel será inserido aqui</p>
            </div>
          }
          historySlot={
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Histórico & Condutas</h2>
              <p className="text-slate-600">Componente SessionHistoryPanel será inserido aqui</p>
            </div>
          }
          evolutionSlot={
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Testes & Evolução</h2>
              <p className="text-slate-600">Componente TestEvolutionPanel será inserido aqui</p>
            </div>
          }
          summarySlot={
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Resumo Paciente</h2>
              <p className="text-slate-600">Componente PatientGoalsPanel será inserido aqui</p>
            </div>
          }
        />
      </main>
    </div>
  );
};

export default SessionEvolutionPage;
