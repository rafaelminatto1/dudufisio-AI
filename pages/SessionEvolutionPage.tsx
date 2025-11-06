import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, User, Clock, FileText, Calendar, Activity, History, Target } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useData } from '../contexts/AppContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import * as appointmentService from '../services/appointmentService';
import * as patientService from '../services/patientService';
import * as soapNoteService from '../services/soapNoteService';
import * as surgeryService from '../services/surgeryService';
import * as patientGoalsService from '../services/patientGoalsService';
import * as pathologyService from '../services/pathologyService';
import * as sessionEvolutionService from '../services/sessionEvolutionService';
import * as mandatoryTestAlertService from '../services/mandatoryTestAlertService';
import * as medicalReportSuggestionsService from '../services/medicalReportSuggestionsService';
import * as bodyMapService from '../services/bodyMapService';
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
import { BodyMapProfessional, BodyMapComparisonModal, type PainData, type PainModalData, BODY_REGIONS_FRONT, BODY_REGIONS_BACK } from '../components/body-map-pro';
import { H1, H2, H3, H4, Body, Small } from '../src/components/ui/Typography';

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
  const { user } = useSupabaseAuth();

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
  const [painData, setPainData] = useState<PainData[]>([]);
  const [previousSessionPainData, setPreviousSessionPainData] = useState<PainData[]>([]);

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'soap' | 'history' | 'tests' | 'summary'>('all');
  const [showBlockingDialog, setShowBlockingDialog] = useState(false);
  const [showReplicationDialog, setShowReplicationDialog] = useState(false);
  const [pendingCriticalTests, setPendingCriticalTests] = useState<MandatoryTestAlert[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Load all data
  useEffect(() => {
    if (appointmentId) {
      loadAllData();
    }
  }, [appointmentId]);

  const loadAllData = async () => {
    // Timeout global para evitar loading infinito
    const globalTimeoutId = setTimeout(() => {
      setIsLoading(false);
      showToast('Tempo limite excedido ao carregar dados', 'error');
      navigate('/agenda');
    }, 15000); // 15 segundos

    setIsLoading(true);
    
    try {
      if (!appointmentId) throw new Error('ID do agendamento não fornecido');

      // Helper para adicionar timeout em promises
      const withTimeout = <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
        return Promise.race([
          promise,
          new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms)
          ),
        ]);
      };

      // Buscar agendamento com timeout
      const appointments = await withTimeout(
        appointmentService.getAppointments(),
        5000,
        'getAppointments'
      );
      
      const foundAppointment = appointments.find(a => a.id === appointmentId);

      if (!foundAppointment) {
        clearTimeout(globalTimeoutId);
        showToast('Agendamento não encontrado', 'error');
        navigate('/agenda');
        return;
      }

      setAppointment(foundAppointment as EnrichedAppointment);

      // Buscar paciente com timeout
      const patientData = await withTimeout(
        patientService.getPatientById(foundAppointment.patientId),
        5000,
        'getPatientById'
      );
      
      if (!patientData) {
        clearTimeout(globalTimeoutId);
        showToast('Paciente não encontrado', 'error');
        navigate('/agenda');
        return;
      }
      setPatient(patientData);

      // Carregar dados em paralelo com timeout individual
      const [
        notesData,
        surgeriesData,
        goalsData,
        pathologiesData,
        bodyMapSessions,
      ] = await Promise.all([
        withTimeout(soapNoteService.getNotesByPatientId(foundAppointment.patientId), 5000, 'getNotes'),
        withTimeout(surgeryService.getSurgeriesByPatientId(foundAppointment.patientId), 5000, 'getSurgeries'),
        withTimeout(patientGoalsService.getGoalsByPatientId(foundAppointment.patientId), 5000, 'getGoals'),
        withTimeout(pathologyService.getPathologiesByPatientId(foundAppointment.patientId), 5000, 'getPathologies'),
        withTimeout(bodyMapService.getSessionsByPatient(foundAppointment.patientId), 5000, 'getBodyMapSessions'),
      ]);

      setPatientNotes(notesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setPreviousNote(notesData[0] || null);
      setSurgeries(surgeriesData);
      setGoals(goalsData);
      setPathologies(pathologiesData);

      // Processar dados de dor
      if (bodyMapSessions.length > 0) {
        // Sessão mais recente (para comparação)
        const latestSession = bodyMapSessions[0];
        if (latestSession && latestSession.painRegions) {
          const previousPainData: PainData[] = latestSession.painRegions.map(region => ({
            regionId: region.regionId,
            intensity: region.intensity,
            type: region.type as any,
            notes: region.notes || ''
          }));
          setPreviousSessionPainData(previousPainData);
        }
      }

      // Gerar alertas e insights
      const sessionNumber = notesData.length + 1;
      const [alerts, insights] = await Promise.all([
        withTimeout(
          mandatoryTestAlertService.generateMandatoryTestAlerts(
            foundAppointment.patientId,
            sessionNumber
          ),
          5000,
          'generateMandatoryTestAlerts'
        ),
        withTimeout(
          medicalReportSuggestionsService.generateMedicalInsights(foundAppointment.patientId),
          5000,
          'generateMedicalInsights'
        ),
      ]);

      setMandatoryAlerts(alerts);
      setMedicalInsights(insights);

      clearTimeout(globalTimeoutId);

    } catch (error: any) {
      clearTimeout(globalTimeoutId);
      
      // Log detalhado em desenvolvimento
      if (import.meta.env.DEV) {
        console.error('🔴 Erro detalhado em loadAllData:', {
          appointmentId,
          error,
          message: error?.message,
          stack: error?.stack,
        });
      }
      
      // Mensagem amigável baseada no erro
      const errorMessage = error?.message?.includes('Timeout')
        ? 'Tempo limite excedido. Verifique sua conexão.'
        : 'Erro ao carregar dados da sessão';
      
      showToast(errorMessage, 'error');
      
      // Dar tempo para toast aparecer antes de navegar
      setTimeout(() => navigate('/agenda'), 1000);
    } finally {
      // SEMPRE desabilitar loading
      setIsLoading(false);
    }
  };

  // Função para detectar pioras na dor
  const detectPainWorsening = () => {
    if (previousSessionPainData.length === 0 || painData.length === 0) {
      return { hasWorsening: false, alerts: [] };
    }

    const alerts: { region: string; previous: number; current: number; change: number }[] = [];
    const previousMap = new Map(previousSessionPainData.map(p => [p.regionId, p.intensity]));

    painData.forEach(current => {
      const previous = previousMap.get(current.regionId);
      if (previous !== undefined) {
        const change = current.intensity - previous;
        if (change >= 2) {
          // Buscar nome da região
          const region = [...BODY_REGIONS_FRONT, ...BODY_REGIONS_BACK].find(r => r.id === current.regionId);
          alerts.push({
            region: region?.name || current.regionId,
            previous,
            current: current.intensity,
            change
          });
        }
      } else if (current.intensity >= 5) {
        // Nova região com dor moderada/severa
        const region = [...BODY_REGIONS_FRONT, ...BODY_REGIONS_BACK].find(r => r.id === current.regionId);
        alerts.push({
          region: region?.name || current.regionId,
          previous: 0,
          current: current.intensity,
          change: current.intensity
        });
      }
    });

    return { hasWorsening: alerts.length > 0, alerts };
  };

  // Handlers para Body Map
  const handleSavePainData = async (data: PainModalData) => {
    if (!patient) return;

    try {
      // Atualizar state local
      setPainData(prev => {
        const existingIndex = prev.findIndex(p => p.regionId === data.regionId);

        if (existingIndex >= 0) {
          // Atualizar existente
          const updated = [...prev];
          updated[existingIndex] = {
            regionId: data.regionId,
            intensity: data.intensity,
            type: data.type,
            notes: data.notes
          };
          return updated;
        } else {
          // Adicionar novo
          return [
            ...prev,
            {
              regionId: data.regionId,
              intensity: data.intensity,
              type: data.type,
              notes: data.notes
            }
          ];
        }
      });

      showToast('Registro de dor atualizado', 'success');
    } catch (error) {
      console.error('Erro ao salvar dados de dor:', error);
      showToast('Erro ao salvar dados de dor', 'error');
    }
  };

  const handleDeletePainData = async (regionId: string) => {
    try {
      setPainData(prev => prev.filter(p => p.regionId !== regionId));
      showToast('Registro de dor removido', 'success');
    } catch (error) {
      console.error('Erro ao deletar dados de dor:', error);
      showToast('Erro ao deletar dados de dor', 'error');
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

      // Salvar dados do Body Map se houver
      if (painData.length > 0) {
        const sessionNumber = patientNotes.length + 1;
        await bodyMapService.saveBodyMapSession({
          patientId: patient.id,
          sessionNumber,
          date: new Date().toISOString(),
          painRegions: painData.map(p => ({
            regionId: p.regionId,
            intensity: p.intensity,
            type: p.type,
            notes: p.notes || undefined
          }))
        });
      }

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
          <p className="text-neutral-textSecondary mb-md">Dados da sessão não encontrados</p>
          <button
            onClick={() => navigate('/agenda')}
            className="px-md py-sm bg-primary text-white rounded-lg hover:bg-primary-hover"
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
    <div className="flex flex-col h-screen bg-neutral-bgAlt">
      {/* Header */}
      <header className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-neutral-border shadow-card">
        <div className="px-lg py-md">
          <div className="flex items-center justify-between mb-md">
          <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/agenda')}
                className="p-sm rounded-full hover:bg-white/50 transition-colors"
                title="Voltar para Agenda"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-textSecondary" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-neutral-text">
                  Evolução de Sessão - {patient.name}
              </h1>
                <p className="text-sm text-neutral-textSecondary mt-xs">
                  Sessão #{sessionNumber} • {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="px-md py-sm text-neutral-textSecondary hover:text-neutral-text hover:bg-white/50 rounded-lg transition-colors flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
              <button
                onClick={() => {/* Salvar será chamado pelo SOAPFormPanel */}}
                disabled={isSaving}
                className="px-lg py-sm bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-card transition-colors flex items-center space-x-2 disabled:bg-green-300 disabled:cursor-not-allowed"
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

          {/* Card do Profissional */}
          <div className="bg-primary-light border border-primary rounded-lg p-md mb-md">
            <div className="flex items-center gap-md">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                {user?.name?.charAt(0) || 'P'}
              </div>
              <div>
                <p className="font-medium text-neutral-text">{user?.name || 'Profissional'}</p>
                <p className="text-sm text-neutral-textSecondary">
                  CREFITO: {(user as any)?.crefito || 'Não informado'}
                </p>
              </div>
            </div>
          </div>

          {/* Info cards */}
          <div className="flex items-center space-x-6 text-sm text-neutral-textSecondary">
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
          <div className="mt-md flex space-x-2 lg:hidden overflow-x-auto">
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
        <div className="flex-shrink-0 bg-error-light border-b border-error px-lg py-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-error-light rounded-full flex items-center justify-center">
              <span className="text-error font-bold text-sm">!</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-error">
                {mandatoryAlerts.filter(a => a.severity === 'critical').length} teste(s) obrigatório(s) pendente(s)
              </p>
              <p className="text-xs text-error mt-xs">
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
            <div className="overflow-y-auto border-r border-neutral-border bg-white">
              <div className="p-lg">
                <h2 className="text-lg font-bold text-neutral-text mb-md flex items-center gap-sm border-b pb-3 border-neutral-border">
                  <FileText className="w-5 h-5 text-primary" />
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
            <div className="overflow-y-auto border-r border-neutral-border bg-neutral-bgAlt">
              <div className="p-lg space-y-xl">
                <div>
                  <h2 className="text-lg font-bold text-neutral-text mb-md flex items-center gap-sm border-b pb-3 border-neutral-border">
                    <History className="w-5 h-5 text-success" />
                    <span>Histórico de Sessões</span>
                  </h2>
                  <SessionHistoryPanel
                    patientId={patient.id}
                    limit={10}
                    onReplicateConduct={(note) => {/* Implementar */}}
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-neutral-text mb-md flex items-center gap-sm border-b pb-3 border-neutral-border">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <span>Cirurgias</span>
                  </h2>
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
            <div className="overflow-y-auto border-r border-neutral-border bg-white">
              <div className="p-lg space-y-xl">
                      {/* Alertas de Testes Obrigatórios */}
                      {mandatoryAlerts.length > 0 && (
                        <div>
                          <h2 className="text-lg font-bold text-neutral-text mb-md">Alertas</h2>
                          <MandatoryTestAlertComponent
                            alerts={mandatoryAlerts}
                          />
                        </div>
                      )}

                {/* Patologias */}
                <div>
                  <h2 className="text-lg font-bold text-neutral-text mb-md flex items-center gap-sm border-b pb-3 border-neutral-border">
                    <Activity className="w-5 h-5 text-warning" />
                    <span>Patologias</span>
                  </h2>
                  <PathologyManager
                    patientId={patient.id}
                  />
                </div>

                {/* Evolução de Testes */}
                <div>
                  <h2 className="text-lg font-bold text-neutral-text mb-md flex items-center gap-sm border-b pb-3 border-neutral-border">
                    <Target className="w-5 h-5 text-teal-600" />
                    <span>Evolução</span>
                  </h2>
                  <TestEvolutionPanel
                    patientId={patient.id}
                    sessionNumber={sessionNumber}
                  />
                </div>

                {/* Mapa de Dor */}
                <div>
                  <div className="flex items-center justify-between mb-md border-b pb-3 border-neutral-border">
                    <h2 className="text-lg font-bold text-neutral-text flex items-center gap-sm">
                      <Activity className="w-5 h-5 text-error" />
                      <span>Mapa de Dor</span>
                    </h2>
                    {previousSessionPainData.length > 0 && (
                      <button
                        onClick={() => setShowComparisonModal(true)}
                        className="px-md py-1.5 text-sm bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <span>📊 Comparar</span>
                      </button>
                    )}
                  </div>

                  {/* Alerta de Piora */}
                  {(() => {
                    const { hasWorsening, alerts } = detectPainWorsening();
                    if (hasWorsening) {
                      return (
                        <div className="mb-md bg-error-light border border-error rounded-lg p-md">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-error-light rounded-full flex items-center justify-center">
                              <span className="text-error font-bold text-sm">!</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-red-900 mb-sm">
                                ⚠️ Piora Detectada em {alerts.length} Região{alerts.length > 1 ? 'ões' : ''}
                              </h3>
                              <ul className="text-xs text-error space-y-1">
                                {alerts.slice(0, 3).map((alert, idx) => (
                                  <li key={idx}>
                                    • <strong>{alert.region}</strong>: {alert.previous === 0 ? 'Nova região' : `${alert.previous} → ${alert.current}`} (+{alert.change} pontos)
                                  </li>
                                ))}
                                {alerts.length > 3 && (
                                  <li className="text-error font-medium">
                                    ... e mais {alerts.length - 3} região{alerts.length - 3 > 1 ? 'ões' : ''}
                                  </li>
                                )}
                              </ul>
                              <button
                                onClick={() => setShowComparisonModal(true)}
                                className="mt-sm text-xs text-error hover:text-red-900 font-medium underline"
                              >
                                Ver comparação detalhada →
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <BodyMapProfessional
                    patientId={patient.id}
                    patientName={patient.name}
                    painData={painData}
                    onSavePainData={handleSavePainData}
                    onDeletePainData={handleDeletePainData}
                    onViewHistory={() => setShowComparisonModal(true)}
                    readOnly={false}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Coluna 4: Resumo & Objetivos (20%) */}
          {(showAll || activeTab === 'summary') && (
            <div className="overflow-y-auto bg-neutral-bgAlt">
              <div className="p-lg space-y-xl">
                {/* Visão Geral do Paciente */}
                <PatientOverview patient={patient} />

                {/* Objetivos com Countdown */}
                      <div>
                        <h2 className="text-lg font-bold text-neutral-text mb-md flex items-center gap-sm border-b pb-3 border-neutral-border">
                          <Target className="w-5 h-5 text-indigo-600" />
                          <span>Objetivos</span>
                        </h2>
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
                  <h2 className="text-lg font-bold text-neutral-text mb-md">Insights para Laudo</h2>
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

      {/* Modal de Comparação do Body Map */}
      <BodyMapComparisonModal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        patientName={patient.name}
        previousSessionNumber={sessionNumber - 1}
        currentSessionNumber={sessionNumber}
        previousPainData={previousSessionPainData}
        currentPainData={painData}
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
      px-md py-sm rounded-lg text-sm font-medium transition-colors whitespace-nowrap
      ${active 
        ? 'bg-white text-primary shadow-card' 
        : 'text-neutral-textSecondary hover:bg-white/50'
      }
    `}
  >
    {label}
  </button>
);

export default SessionEvolutionPage;
