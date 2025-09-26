import React, { useState, useEffect } from 'react';
import { X, Save, User, Clock, FileText, ArrowLeft } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useData } from '../contexts/AppContext';
import * as appointmentService from '../services/appointmentService';
import * as patientService from '../services/patientService';
import * as soapNoteService from '../services/soapNoteService';
import { Appointment, Patient, SoapNote, EnrichedAppointment } from '../types';
import PageLoader from '../components/ui/PageLoader';

// Componentes da sessão
import SessionForm from '../components/session/SessionForm';
import PatientOverview from '../components/session/PatientOverview';
import PatientMetrics from '../components/session/PatientMetrics';
import SessionHistory from '../components/session/SessionHistory';
import RepeatConductModal from '../components/session/RepeatConductModal';

interface SessionFormPageProps {
  appointmentId: string;
  onClose: () => void;
}

const SessionFormPage: React.FC<SessionFormPageProps> = ({ appointmentId, onClose }) => {
  const [appointment, setAppointment] = useState<EnrichedAppointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientNotes, setPatientNotes] = useState<SoapNote[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRepeatModalOpen, setIsRepeatModalOpen] = useState(false);
  const [selectedNoteForRepeat, setSelectedNoteForRepeat] = useState<SoapNote | null>(null);
  
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
      
      // Opcional: fechar a página após salvar
      // onClose();
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      showToast('Erro ao salvar sessão', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRepeatConduct = (note: SoapNote) => {
    setSelectedNoteForRepeat(note);
    setIsRepeatModalOpen(true);
  };

  const handleConfirmRepeatConduct = async (noteData: Omit<SoapNote, 'id' | 'patientId' | 'therapist'>) => {
    await handleSaveNote(noteData);
    setIsRepeatModalOpen(false);
    setSelectedNoteForRepeat(null);
  };

  const therapist = therapists.find(t => t.id === appointment?.therapistId);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-slate-600">Carregando dados da sessão...</span>
        </div>
      </div>
    );
  }

  if (!appointment || !patient) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/50 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Nova Sessão de Atendimento
                </h1>
                <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{patient.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(appointment.startTime).toLocaleString('pt-BR')}</span>
                  </div>
                  {therapist && (
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4" />
                      <span>{therapist.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/50 transition-colors"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col lg:flex-row">
              {/* Lado Esquerdo - Formulário de Sessão */}
              <div className="lg:w-2/3 p-6 overflow-y-auto border-r border-slate-200">
                <SessionForm
                  patient={patient}
                  onSave={handleSaveNote}
                  onCancel={onClose}
                  isLoading={isSaving}
                  previousNote={patientNotes[0] || null}
                  onRepeatConduct={() => patientNotes[0] && handleRepeatConduct(patientNotes[0])}
                />
              </div>

              {/* Lado Direito - Visão Geral do Paciente */}
              <div className="lg:w-1/3 p-6 overflow-y-auto bg-slate-50">
                <div className="space-y-6">
                  {/* Visão Geral do Paciente */}
                  <PatientOverview patient={patient} />

                  {/* Métricas */}
                  <PatientMetrics 
                    patient={patient} 
                    appointments={allAppointments} 
                  />
                </div>
              </div>
            </div>

            {/* Seção Inferior - Histórico de Sessões */}
            <div className="border-t border-slate-200 bg-white">
              <div className="p-6">
                <SessionHistory
                  patientNotes={patientNotes}
                  onRepeatConduct={handleRepeatConduct}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Repetir Conduta */}
      {selectedNoteForRepeat && (
        <RepeatConductModal
          isOpen={isRepeatModalOpen}
          onClose={() => {
            setIsRepeatModalOpen(false);
            setSelectedNoteForRepeat(null);
          }}
          onConfirm={handleConfirmRepeatConduct}
          previousNote={selectedNoteForRepeat}
          patientName={patient.name}
        />
      )}
    </>
  );
};

export default SessionFormPage;
