import React, { useState, useEffect } from 'react';
import { X, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useData } from '../contexts/AppContext';
import * as appointmentService from '../services/appointmentService';
import * as patientService from '../services/patientService';
import * as soapNoteService from '../services/soapNoteService';
import { Appointment, Patient, SoapNote, EnrichedAppointment } from '../types';
import PageLoader from '../components/ui/PageLoader';
import SessionEvolutionContainer from '../components/session/SessionEvolutionContainer';
import { Button } from '../components/ui/button';

/**
 * OPÇÃO 3: Expansão da SessionFormPage existente
 * Mantém estrutura atual mas adiciona novas funcionalidades
 * Usa o SessionEvolutionContainer com layout de 4 colunas
 */

interface SessionFormPageExpandedProps {
  appointmentId: string;
  onClose: () => void;
}

const SessionFormPageExpanded: React.FC<SessionFormPageExpandedProps> = ({ appointmentId, onClose }) => {
  const [appointment, setAppointment] = useState<EnrichedAppointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientNotes, setPatientNotes] = useState<SoapNote[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const { therapists } = useData();
  const { showToast } = useToast();

  useEffect(() => {
    const loadSessionData = async () => {
      setIsLoading(true);
      try {
        // Buscar dados do agendamento
        const appointments = await appointmentService.getAppointments();
        const foundAppointment = appointments.find(a => a.id === appointmentId);

        if (!foundAppointment) {
          showToast('Agendamento não encontrado', 'error');
          onClose();
          return;
        }

        setAppointment(foundAppointment as EnrichedAppointment);
        setAllAppointments(appointments);

        // Buscar dados do paciente
        const patientData = await patientService.getPatientById(foundAppointment.patientId);
        if (!patientData) {
          showToast('Paciente não encontrado', 'error');
          onClose();
          return;
        }
        setPatient(patientData);

        // Buscar histórico de sessões
        const notes = await soapNoteService.getNotesByPatientId(foundAppointment.patientId);
        setPatientNotes(notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

      } catch (error) {
        console.error('Erro ao carregar dados da sessão:', error);
        showToast('Erro ao carregar dados da sessão', 'error');
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionData();
  }, [appointmentId, onClose, showToast]);

  const handleSaveNote = async (newNoteData: Omit<SoapNote, 'id' | 'patientId' | 'therapist'>) => {
    if (!patient) return;

    setIsSaving(true);
    try {
      await soapNoteService.addNote(patient.id, newNoteData);

      // Recarregar notas
      const notes = await soapNoteService.getNotesByPatientId(patient.id);
      setPatientNotes(notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

      showToast('Sessão registrada com sucesso!', 'success');
      
      // Fechar após salvar
      onClose();
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      showToast('Erro ao salvar sessão', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const therapist = therapists.find(t => t.id === appointment?.therapistId);

  if (isLoading) {
    return <PageLoader message="Carregando dados da sessão..." />;
  }

  if (!appointment || !patient) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[98vw] max-h-[98vh] flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/50 transition-colors"
              title="Voltar"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Nova Sessão de Atendimento
              </h1>
              <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                <div className="flex items-center space-x-1">
                  <span>{patient.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>{new Date(appointment.startTime).toLocaleString('pt-BR')}</span>
                </div>
                {therapist && (
                  <div className="flex items-center space-x-1">
                    <span>{therapist.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={() => {/* handleSaveNote */}}
              disabled={isSaving}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Salvar Sessão'}
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/50 transition-colors"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>
          </div>
        </header>

        {/* Content - Usando SessionEvolutionContainer com layout 4 colunas */}
        <div className="flex-1 overflow-hidden">
          <SessionEvolutionContainer
            appointmentId={appointmentId}
            patient={patient}
            appointment={appointment}
            onClose={onClose}
            onSave={() => {/* handleSaveNote */}}
            layout="4-columns"
            className="h-full"
            soapFormSlot={
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  Formulário SOAP
                </h2>
                {/* Componente SessionForm existente será inserido aqui */}
                <div className="text-slate-600">
                  <p>O componente SessionForm existente será movido para cá</p>
                  <p className="mt-2 text-sm">
                    Este mantém toda a funcionalidade atual do formulário SOAP
                  </p>
                </div>
              </div>
            }
            historySlot={
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  Histórico & Condutas
                </h2>
                {/* Novos componentes: SessionHistory, SurgeryTimeline, TreatmentDuration */}
                <div className="text-slate-600">
                  <p>Componentes novos:</p>
                  <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                    <li>SessionHistoryPanel</li>
                    <li>SurgeryTimeline</li>
                    <li>TreatmentDurationCard</li>
                  </ul>
                </div>
              </div>
            }
            evolutionSlot={
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  Testes & Evolução
                </h2>
                {/* Novos componentes: MandatoryTestAlert, PathologyManager, EvolutionChart */}
                <div className="text-slate-600">
                  <p>Componentes novos:</p>
                  <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                    <li>MandatoryTestAlert (alertas vermelhos)</li>
                    <li>PathologyManager (patologias ativas/tratadas)</li>
                    <li>EvolutionChart (gráficos)</li>
                    <li>EvolutionTable (tabela com export)</li>
                  </ul>
                </div>
              </div>
            }
            summarySlot={
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  Resumo & Objetivos
                </h2>
                {/* Componentes: PatientOverview (existente) + PatientGoalsPanel (novo) */}
                <div className="text-slate-600">
                  <p>Componentes:</p>
                  <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                    <li>PatientOverview (existente)</li>
                    <li>PatientGoalsPanel (novo - com countdown)</li>
                    <li>PatientMetrics (existente)</li>
                  </ul>
                </div>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default SessionFormPageExpanded;

