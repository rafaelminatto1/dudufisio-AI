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
import PatientContextPanel from '../components/session/PatientContextPanel';
import ConductReplicationDialog, { ConductFields } from '../components/session/ConductReplicationDialog';
import SaveBlockingDialog from '../components/session/SaveBlockingDialog';
import { getMandatoryAssessmentsForSession } from '../services/patientTrackingService';
import { logNonCompliance } from '../services/complianceService';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

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
  const [isReplicateModalOpen, setIsReplicateModalOpen] = useState(false);
  const [isSaveBlockingDialogOpen, setIsSaveBlockingDialogOpen] = useState(false);
  const [pendingMandatoryTests, setPendingMandatoryTests] = useState<any[]>([]);
  const [replicatedPlan, setReplicatedPlan] = useState<string | null>(null);
  
  const { therapists } = useData();
  const { showToast } = useToast();
  const { user } = useSupabaseAuth();

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

    // Validar testes obrigatórios (Nível B: Bloqueio)
    try {
      const pendingTests = await getMandatoryAssessmentsForSession(
        patient.id,
        patientNotes.length + 1,
        'mid_session'
      );

      if (pendingTests.length > 0) {
        setPendingMandatoryTests(pendingTests);
        setIsSaveBlockingDialogOpen(true);
        return;
      }
    } catch (error) {
      console.error('Erro ao verificar testes obrigatórios:', error);
    }

    // Se não houver testes pendentes, salvar normalmente
    await performSave(newNoteData);
  };

  const performSave = async (newNoteData: Omit<SoapNote, 'id' | 'patientId' | 'therapist'>) => {
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

  const handleSaveAnyway = async () => {
    if (!patient || !user) return;

    try {
      // Registrar não conformidade (Nível C)
      await logNonCompliance(
        patient.id,
        appointmentId, // Usando appointmentId como sessionId temporariamente
        pendingMandatoryTests.map(test => ({
          testName: test.testName,
          testType: test.testType,
          testConfigId: test.id
        })),
        user.id,
        'Profissional optou por salvar sem realizar medições obrigatórias'
      );

      showToast('Sessão salva sem medições obrigatórias. Não conformidade registrada.', 'info');
      setIsSaveBlockingDialogOpen(false);
    } catch (error) {
      console.error('Erro ao registrar não conformidade:', error);
      showToast('Erro ao registrar não conformidade', 'error');
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

  const handleReplicateConduct = async (fields: ConductFields) => {
    // Formatar os campos replicados em uma string estruturada para o campo Plan
    const planParts: string[] = [];
    
    if (fields.techniques && fields.techniques.length > 0) {
      planParts.push(`**Técnicas Aplicadas:**\n${fields.techniques.map(t => `- ${t}`).join('\n')}`);
    }
    
    if (fields.exercises && fields.exercises.length > 0) {
      planParts.push(`**Exercícios Prescritos:**\n${fields.exercises.map(e => `- ${e}`).join('\n')}`);
    }
    
    if (fields.equipment && fields.equipment.length > 0) {
      planParts.push(`**Equipamentos Utilizados:**\n${fields.equipment.map(eq => `- ${eq}`).join('\n')}`);
    }
    
    if (fields.homeExercises && fields.homeExercises.length > 0) {
      planParts.push(`**Exercícios Domiciliares:**\n${fields.homeExercises.map(he => `- ${he}`).join('\n')}`);
    }
    
    if (fields.recommendations) {
      planParts.push(`**Recomendações:**\n${fields.recommendations}`);
    }
    
    if (fields.duration) {
      planParts.push(`**Duração da Sessão:** ${fields.duration} minutos`);
    }
    
    if (fields.frequency) {
      planParts.push(`**Frequência de Retorno:** ${fields.frequency}`);
    }
    
    const formattedPlan = planParts.join('\n\n');
    
    // Atualizar o campo plan do formulário
    setReplicatedPlan(formattedPlan);
    setIsReplicateModalOpen(false);
    showToast('Conduta replicada com sucesso!', 'success');
  };

  const therapist = therapists.find(t => t.id === appointment?.therapistId);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-lg flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-neutral-textSecondary">Carregando dados da sessão...</span>
        </div>
      </div>
    );
  }

  if (!appointment || !patient) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-md">
        <div className="bg-white rounded-cardLarge shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between p-lg border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-sm rounded-full hover:bg-white/50 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-neutral-textSecondary" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-neutral-text">
                  Nova Sessão de Atendimento
                </h1>
                <div className="flex items-center space-x-4 mt-sm text-sm text-neutral-textSecondary">
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
              className="p-sm rounded-full hover:bg-white/50 transition-colors"
            >
              <X className="w-6 h-6 text-neutral-textSecondary" />
            </button>
          </header>

          {/* Content - Layout 4 Colunas (EXPANDIDO) */}
          <div className="flex-1 overflow-hidden flex flex-row">
            {/* Coluna 1 (30%): Formulário SOAP */}
            <div className="w-[30%] p-lg overflow-y-auto border-r border-neutral-border">
              <SessionForm
                patient={patient}
                onSave={handleSaveNote}
                onCancel={onClose}
                isLoading={isSaving}
                previousNote={patientNotes[0] || null}
                onRepeatConduct={() => patientNotes[0] && handleRepeatConduct(patientNotes[0])}
                onReplicateConduct={() => setIsReplicateModalOpen(true)}
                externalPlanUpdate={replicatedPlan}
              />
            </div>

            {/* Coluna 2 (25%): Histórico & Condutas */}
            <div className="w-[25%] p-lg overflow-y-auto border-r border-neutral-border bg-neutral-bgAlt">
              <div className="space-y-xl">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-text mb-md">Histórico de Sessões</h3>
              <PatientContextPanel 
                patient={patient}
                sessionNumber={patientNotes.length + 1}
                timing="during"
              />
                </div>
              </div>
            </div>

            {/* Coluna 3 (25%): Testes & Evolução */}
            <div className="w-[25%] p-lg overflow-y-auto border-r border-neutral-border bg-white">
              <div className="space-y-xl">
                {/* Alertas e Testes */}
                {pendingMandatoryTests.length > 0 && (
                  <div className="bg-error-light border-2 border-error rounded-lg p-md">
                    <p className="text-sm font-semibold text-error mb-sm">
                      ⚠️ {pendingMandatoryTests.length} teste(s) obrigatório(s)
                    </p>
                    <ul className="text-xs text-error space-y-1">
                      {pendingMandatoryTests.map((test, idx) => (
                        <li key={idx}>• {test.testName}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Coluna 4 (20%): Resumo Paciente */}
            <div className="w-[20%] p-lg overflow-y-auto bg-neutral-bgAlt">
              <div className="space-y-xl">
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
          <div className="border-t border-neutral-border bg-white">
            <div className="p-lg">
              <SessionHistory
                patientNotes={patientNotes}
                onRepeatConduct={handleRepeatConduct}
              />
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

      {/* Modal de Replicar Conduta */}
      <ConductReplicationDialog
        isOpen={isReplicateModalOpen}
        onClose={() => setIsReplicateModalOpen(false)}
        onConfirm={handleReplicateConduct}
        previousSessions={patientNotes.slice(0, 10)}
        patientName={patient.name}
      />

      {/* Diálogo de Bloqueio de Salvamento (Nível B) */}
      <SaveBlockingDialog
        isOpen={isSaveBlockingDialogOpen}
        onClose={() => setIsSaveBlockingDialogOpen(false)}
        onSaveAnyway={handleSaveAnyway}
        onCancel={() => setIsSaveBlockingDialogOpen(false)}
        pendingTests={pendingMandatoryTests}
      />
    </>
  );
};

export default SessionFormPage;
