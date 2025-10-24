import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, User, Clock, FileText, Calendar, Activity } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useData } from '../contexts/AppContext';
import * as appointmentService from '../services/appointmentService';
import * as patientService from '../services/patientService';
import * as soapNoteService from '../services/soapNoteService';
import * as surgeryService from '../services/surgeryService';
import * as patientGoalsService from '../services/patientGoalsService';
import * as pathologyService from '../services/pathologyService';
import * as sessionEvolutionService from '../services/sessionEvolutionService';
import * as mandatoryTestAlertService from '../services/mandatoryTestAlertService';
import * as medicalReportSuggestionsService from '../services/medicalReportSuggestionsService';
import { 
  Patient, 
  EnrichedAppointment, 
  SoapNote,
  Surgery,
  PatientGoal,
  Pathology,
  MandatoryTestAlert,
  MedicalInsight,
  AppointmentStatus,
} from '../types';

// Components
import PageLoader from '../components/ui/PageLoader';
import { SOAPFormPanel } from '../components/session/SOAPFormPanel';
import { SessionHistoryPanel } from '../components/session/SessionHistoryPanel';
import { SurgeryTimeline } from '../components/session/SurgeryTimeline';
import { TreatmentDurationCard } from '../components/session/TreatmentDurationCard';
import { TestEvolutionPanel } from '../components/session/TestEvolutionPanel';
import { MandatoryTestAlert as MandatoryTestAlertComponent } from '../components/session/MandatoryTestAlert';
import { PathologyManager } from '../components/session/PathologyManager';
import { PatientGoalsPanel } from '../components/session/PatientGoalsPanel';
import PatientOverview from '../components/session/PatientOverview';
import PatientMetrics from '../components/session/PatientMetrics';
import { MedicalReportSuggestions } from '../components/session/MedicalReportSuggestions';
import { SaveBlockingDialog } from '../components/session/SaveBlockingDialog';
import { ConductReplicationDialog } from '../components/session/ConductReplicationDialog';

/**
 * OPÇÃO 1: Página Nova para Evolução de Sessão
 * Rota: /atendimento/:appointmentId/evolucao
 * Layout fullscreen com navegação por abas
 */

const SessionEvolutionPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { therapists } = useData();

  // Data states
  const [appointment, setAppointment] = useState<EnrichedAppointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [previousNote, setPreviousNote] = useState<SoapNote | null>(null);
  const [patientNotes, setPatientNotes] = useState<SoapNote[]>([]);
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [goals, setGoals] = useState<PatientGoal[]>([]);
  const [pathologies, setPathologies] = useState<Pathology[]>([]);
  const [mandatoryAlerts, setMandatoryAlerts] = useState<MandatoryTestAlert[]>([]);
  const [medicalInsights, setMedicalInsights] = useState<MedicalInsight[]>([]);

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'soap' | 'history' | 'tests' | 'summary'>('all');
  const [showBlockingDialog, setShowBlockingDialog] = useState(false);
  const [showReplicationDialog, setShowReplicationDialog] = useState(false);
  const [pendingCriticalTests, setPendingCriticalTests] = useState<MandatoryTestAlert[]>([]);

  // Load all data
  useEffect(() => {
    if (appointmentId) {
      loadAllData();
    }
  }, [appointmentId]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      if (!appointmentId) throw new Error('ID do agendamento não fornecido');

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

      // Carregar dados em paralelo
      const [
        notesData,
        surgeriesData,
        goalsData,
        pathologiesData,
      ] = await Promise.all([
        soapNoteService.getNotesByPatientId(foundAppointment.patientId),
        surgeryService.getSurgeriesByPatientId(foundAppointment.patientId),
        patientGoalsService.getGoalsByPatientId(foundAppointment.patientId),
        pathologyService.getPathologiesByPatientId(foundAppointment.patientId),
      ]);

      setPatientNotes(notesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setPreviousNote(notesData[0] || null);
      setSurgeries(surgeriesData);
      setGoals(goalsData);
      setPathologies(pathologiesData);

      // Gerar alertas e insights
      const sessionNumber = notesData.length + 1;
      const [alerts, insights] = await Promise.all([
        mandatoryTestAlertService.generateMandatoryTestAlerts(
          foundAppointment.patientId,
          sessionNumber
        ),
        medicalReportSuggestionsService.generateMedicalInsights(foundAppointment.patientId),
      ]);

      setMandatoryAlerts(alerts);
      setMedicalInsights(insights);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showToast('Erro ao carregar dados da sessão', 'error');
      navigate('/agenda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNote = async (noteData: Omit<SoapNote, 'id' | 'patientId' | 'therapist'>) => {
    if (!patient) return;

    // Verificar testes obrigatórios críticos
    const criticalAlerts = mandatoryAlerts.filter(
      a => a.severity === 'critical' && !a.isCompleted
    );

    if (criticalAlerts.length > 0) {
      setPendingCriticalTests(criticalAlerts);
      setShowBlockingDialog(true);
      return;
    }

    await performSave(noteData);
  };

  const performSave = async (noteData: Omit<SoapNote, 'id' | 'patientId' | 'therapist'>) => {
    if (!patient || !appointment) return;

    setIsSaving(true);
    try {
      // Salvar nota SOAP
      await soapNoteService.addNote(patient.id, noteData);

      // Atualizar status do agendamento
      await appointmentService.saveAppointment({
        ...appointment,
        status: AppointmentStatus.Completed,
      });

      // Recarregar notas
      const notes = await soapNoteService.getNotesByPatientId(patient.id);
      setPatientNotes(notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

      showToast('Sessão registrada com sucesso!', 'success');
      
      // Redirecionar para agenda
    navigate('/agenda');
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      showToast('Erro ao salvar sessão', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAnyway = async () => {
    // Registrar não conformidade e salvar mesmo assim
    // Lógica já implementada no SaveBlockingDialog
    setShowBlockingDialog(false);
  };

  const handleCancel = () => {
    if (window.confirm('Deseja realmente cancelar? Dados não salvos serão perdidos.')) {
      navigate('/agenda');
    }
  };

  const therapist = therapists.find(t => t.id === appointment?.therapistId);
  const sessionNumber = patientNotes.length + 1;

  if (isLoading) {
    return <PageLoader />;
  }

  if (!appointment || !patient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Dados da sessão não encontrados</p>
          <button
            onClick={() => navigate('/agenda')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar para Agenda
          </button>
        </div>
      </div>
    );
  }

  // Mostrar todas as colunas se activeTab === 'all'
  const showAll = activeTab === 'all';

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/agenda')}
                className="p-2 rounded-full hover:bg-white/50 transition-colors"
                title="Voltar para Agenda"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Evolução de Sessão - {patient.name}
              </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Sessão #{sessionNumber} • {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-lg transition-colors flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
              <button
                onClick={() => {/* Salvar será chamado pelo SOAPFormPanel */}}
                disabled={isSaving}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-2 disabled:bg-green-300 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
              <Save className="w-4 h-4" />
                    <span>Salvar e Finalizar</span>
                  </>
                )}
              </button>
          </div>
        </div>

          {/* Info cards */}
          <div className="flex items-center space-x-6 text-sm text-slate-600">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{patient.name}</span>
              </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(appointment.startTime).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{new Date(appointment.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {therapist && (
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>{therapist.name}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>{appointment.type}</span>
            </div>
          </div>

          {/* Navigation Tabs (Mobile/Tablet) */}
          <div className="mt-4 flex space-x-2 lg:hidden overflow-x-auto">
            <TabButton
              active={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
              label="Visualização Completa"
            />
            <TabButton
              active={activeTab === 'soap'}
              onClick={() => setActiveTab('soap')}
              label="Formulário"
            />
            <TabButton
              active={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
              label="Histórico"
            />
            <TabButton
              active={activeTab === 'tests'}
              onClick={() => setActiveTab('tests')}
              label="Testes"
            />
            <TabButton
              active={activeTab === 'summary'}
              onClick={() => setActiveTab('summary')}
              label="Resumo"
            />
          </div>
        </div>
      </header>

      {/* Alertas Críticos Globais */}
      {mandatoryAlerts.filter(a => a.severity === 'critical').length > 0 && (
        <div className="flex-shrink-0 bg-red-50 border-b border-red-200 px-6 py-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-sm">!</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">
                {mandatoryAlerts.filter(a => a.severity === 'critical').length} teste(s) obrigatório(s) pendente(s)
              </p>
              <p className="text-xs text-red-600 mt-1">
                Realize as medições obrigatórias antes de finalizar a sessão
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - 4 Colunas */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-[30%_25%_25%_20%] gap-0">
          
          {/* Coluna 1: Formulário SOAP (30%) */}
          {(showAll || activeTab === 'soap') && (
            <div className="overflow-y-auto border-r border-slate-200 bg-white">
              <div className="p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Formulário SOAP</span>
                </h2>
                
                <SOAPFormPanel
                  patientId={patient.id}
                  sessionNumber={sessionNumber}
                  previousNote={previousNote}
                  onSave={handleSaveNote}
                  onCancel={handleCancel}
                  isLoading={isSaving}
                />
              </div>
            </div>
          )}

          {/* Coluna 2: Histórico & Cirurgias (25%) */}
          {(showAll || activeTab === 'history') && (
            <div className="overflow-y-auto border-r border-slate-200 bg-slate-50">
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Histórico de Sessões</h2>
                  <SessionHistoryPanel
                    patientId={patient.id}
                    limit={10}
                    onReplicateConduct={(note) => {/* Implementar */}}
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Cirurgias</h2>
                  <SurgeryTimeline
                    patientId={patient.id}
                  />
                </div>

                <TreatmentDurationCard
                  patient={patient}
                />
              </div>
            </div>
          )}

          {/* Coluna 3: Testes & Evolução (25%) */}
          {(showAll || activeTab === 'tests') && (
            <div className="overflow-y-auto border-r border-slate-200 bg-white">
              <div className="p-6 space-y-6">
                      {/* Alertas de Testes Obrigatórios */}
                      {mandatoryAlerts.length > 0 && (
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 mb-4">Alertas</h2>
                          <MandatoryTestAlertComponent
                            alerts={mandatoryAlerts}
                          />
                        </div>
                      )}

                {/* Patologias */}
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Patologias</h2>
                  <PathologyManager
                    patientId={patient.id}
                  />
                </div>

                {/* Evolução de Testes */}
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Evolução</h2>
                  <TestEvolutionPanel
                    patientId={patient.id}
                    sessionNumber={sessionNumber}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Coluna 4: Resumo & Objetivos (20%) */}
          {(showAll || activeTab === 'summary') && (
            <div className="overflow-y-auto bg-slate-50">
              <div className="p-6 space-y-6">
                {/* Visão Geral do Paciente */}
                <PatientOverview patient={patient} />

                {/* Objetivos com Countdown */}
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Objetivos</h2>
                        <PatientGoalsPanel
                          patient={patient}
                        />
                      </div>

                {/* Métricas Rápidas */}
                <PatientMetrics
                  patient={patient}
                  appointments={[appointment]}
                />

                {/* Insights para Laudo */}
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Insights para Laudo</h2>
                  <MedicalReportSuggestions
                    patientId={patient.id}
                    isCollapsible={true}
                    defaultExpanded={true}
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Dialogs */}
      <SaveBlockingDialog
        isOpen={showBlockingDialog}
        onClose={() => setShowBlockingDialog(false)}
        onSaveAnyway={handleSaveAnyway}
        onCancel={() => setShowBlockingDialog(false)}
        pendingTests={pendingCriticalTests.map(alert => ({
          id: alert.id,
          testName: alert.testName,
          testType: alert.testType,
          frequencyType: 'every_session',
        }))}
      />

      <ConductReplicationDialog
        isOpen={showReplicationDialog}
        onClose={() => setShowReplicationDialog(false)}
        onConfirm={() => {/* Implementar */}}
        previousSessions={patientNotes.slice(0, 10)}
        patientName={patient.name}
      />
    </div>
  );
};

// Helper component para tabs
const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
}> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
      ${active 
        ? 'bg-white text-blue-600 shadow-sm' 
        : 'text-slate-600 hover:bg-white/50'
      }
    `}
  >
    {label}
  </button>
);

export default SessionEvolutionPage;
