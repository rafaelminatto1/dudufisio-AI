import React, { useState, useEffect } from 'react';
import { X, Save, Maximize2, Minimize2, LayoutGrid, Columns, List, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../contexts/ToastContext';
import { Patient, EnrichedAppointment, SoapNote, Surgery, PatientGoal, Pathology, MandatoryTestAlert, MedicalInsight, AppointmentStatus } from '../../types';
import * as appointmentService from '../../services/appointmentService';
import * as patientService from '../../services/patientService';
import * as soapNoteService from '../../services/soapNoteService';
import * as surgeryService from '../../services/surgeryService';
import * as patientGoalsService from '../../services/patientGoalsService';
import * as pathologyService from '../../services/pathologyService';
import * as mandatoryTestAlertService from '../../services/mandatoryTestAlertService';
import * as medicalReportSuggestionsService from '../../services/medicalReportSuggestionsService';
import * as bodyMapService from '../../services/bodyMapService';
import { AnimatePresence, motion } from 'framer-motion';
import { SessionLayoutA_Cards, SessionLayoutB_Columns, SessionLayoutC_Accordion, type SessionLayoutType } from './layouts';
import type { PainData, PainModalData } from '../body-map-pro';
import { handleError } from '../../lib/middleware/errorHandler';

// Import all column components
import { SOAPFormPanel } from './SOAPFormPanel';
import { SessionHistoryPanel } from './SessionHistoryPanel';
import { SurgeryTimeline } from './SurgeryTimeline';
import { TreatmentDurationCard } from './TreatmentDurationCard';
import { TestEvolutionPanel } from './TestEvolutionPanel';
import { MandatoryTestAlert as MandatoryTestAlertComponent } from './MandatoryTestAlert';
import { PathologyManager } from './PathologyManager';
import { PatientGoalsPanel } from './PatientGoalsPanel';
import PatientOverview from './PatientOverview';
import PatientMetrics from './PatientMetrics';
import { MedicalReportSuggestions } from './MedicalReportSuggestions';
import { SaveBlockingDialog } from './SaveBlockingDialog';

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
  const [patientNotes, setPatientNotes] = useState<SoapNote[]>([]);
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [goals, setGoals] = useState<PatientGoal[]>([]);
  const [pathologies, setPathologies] = useState<Pathology[]>([]);
  const [mandatoryAlerts, setMandatoryAlerts] = useState<MandatoryTestAlert[]>([]);
  const [medicalInsights, setMedicalInsights] = useState<MedicalInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('Iniciando...');
  const [isMaximized, setIsMaximized] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showBlockingDialog, setShowBlockingDialog] = useState(false);
  const [pendingCriticalTests, setPendingCriticalTests] = useState<MandatoryTestAlert[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<SessionLayoutType>('cards');
  const [painData, setPainData] = useState<PainData[]>([]);
  const [previousPainData, setPreviousPainData] = useState<PainData[]>([]);

  const loadData = React.useCallback(async (signal?: AbortSignal) => {
    if (signal?.aborted) return;
    
    setIsLoading(true);
    setLoadError(null);
    setLoadingMessage('Iniciando carregamento...');
    
    try {
      // 1. Buscar agendamento específico (otimizado)
      if (signal?.aborted) return;
      setLoadingMessage('Buscando agendamento...');
      const foundAppointment = await withTimeout(
        appointmentService.getAppointmentById(appointmentId),
        10000,
        'Timeout ao buscar agendamento. Verifique sua conexão.'
      );

      if (signal?.aborted) return;
      if (!foundAppointment) {
        setLoadError('Agendamento não encontrado.');
        showToast('Agendamento não encontrado', 'error');
        return;
      }

      setAppointment(foundAppointment as EnrichedAppointment);

      // 2. Buscar paciente
      if (signal?.aborted) return;
      setLoadingMessage('Carregando dados do paciente...');
      const patientData = await withTimeout(
        patientService.getPatientById(foundAppointment.patientId),
        10000,
        'Timeout ao buscar dados do paciente.'
      );
      
      if (signal?.aborted) return;
      if (!patientData) {
        setLoadError('Paciente não encontrado.');
        showToast('Paciente não encontrado', 'error');
        return;
      }

      setPatient(patientData);

      // 3. Carregar todos os dados em paralelo com timeout
      if (signal?.aborted) return;
      setLoadingMessage('Carregando histórico e dados clínicos...');
      const [
        notesData,
        surgeriesData,
        goalsData,
        pathologiesData,
        bodyMapSessions,
      ] = await withTimeout(
        Promise.all([
          soapNoteService.getNotesByPatientId(patientData.id),
          surgeryService.getSurgeriesByPatientId(patientData.id),
          patientGoalsService.getGoalsByPatientId(patientData.id),
          pathologyService.getPathologiesByPatientId(patientData.id),
          bodyMapService.getPatientBodyMapHistory(patientData.id),
        ]),
        15000, 
        'Timeout ao carregar dados clínicos do paciente.'
      );

      if (signal?.aborted) return;
      setPatientNotes(notesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setSurgeries(surgeriesData);
      setGoals(goalsData);
      setPathologies(pathologiesData);

      // 4. Processar dados de dor
      if (signal?.aborted) return;
      setLoadingMessage('Processando dados de dor...');
      if (bodyMapSessions.length > 0) {
        const latestSession = bodyMapSessions[0];
        if (latestSession && latestSession.painRegions) {
          const previousPain: PainData[] = latestSession.painRegions.map(region => ({
            regionId: region.regionId,
            intensity: region.intensity,
            type: region.type as any,
            notes: region.notes || ''
          }));
          setPreviousPainData(previousPain);
        }
      }

      // 5. Gerar alertas e insights
      if (signal?.aborted) return;
      setLoadingMessage('Gerando alertas e insights clínicos...');
      const sessionNumber = notesData.length + 1;
      const [alerts, insights] = await withTimeout(
        Promise.all([
          mandatoryTestAlertService.generateMandatoryTestAlerts(patientData.id, sessionNumber),
          medicalReportSuggestionsService.generateMedicalInsights(patientData.id),
        ]),
        10000,
        'Timeout ao gerar alertas e insights.'
      );

      if (signal?.aborted) return;
      setMandatoryAlerts(alerts);
      setMedicalInsights(insights);
      
      setLoadingMessage('Carregamento concluído!');

    } catch (error) {
      if (signal?.aborted) return;
      
      console.error('❌ Erro ao carregar dados da sessão:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao carregar dados';
      setLoadError(errorMessage);
      
      // Log detalhado apenas no console
      if (error instanceof Error) {
        console.error('Stack trace:', error.stack);
      }
      
      // Toast mais amigável ao usuário
      if (errorMessage.includes('Timeout')) {
        showToast('A operação demorou muito tempo. Por favor, tente novamente.', 'error');
      } else if (errorMessage.includes('não encontrado')) {
        showToast(errorMessage, 'error');
      } else {
        showToast('Erro ao carregar dados da sessão. Por favor, tente novamente.', 'error');
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [appointmentId, showToast]);

  useEffect(() => {
    const abortController = new AbortController();

    if (isOpen) {
      // Prevenir scroll do body quando modal está aberto
      document.body.style.overflow = 'hidden';
      
      // Carregar dados com AbortSignal para cancelamento
      loadData(abortController.signal);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      // Abortar requisições pendentes quando o modal fechar ou componente desmontar
      abortController.abort();
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, appointmentId, loadData]);

  // Handlers para Body Map
  const handleSavePainData = async (data: PainModalData) => {
    if (!patient) return;

    try {
      setPainData(prev => {
        const existingIndex = prev.findIndex(p => p.regionId === data.regionId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            regionId: data.regionId,
            intensity: data.intensity,
            type: data.type,
            notes: data.notes
          };
          return updated;
        } else {
          return [...prev, {
            regionId: data.regionId,
            intensity: data.intensity,
            type: data.type,
            notes: data.notes
          }];
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

      // Recarregar dados
      await loadData();

      showToast('Sessão registrada com sucesso!', 'success');

      if (onSave) {
        onSave();
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      
      handleError(error, {
        operation: 'performSave',
        severity: 'high',
        fallbackMessage: 'Erro ao salvar sessão',
        context: { 
          patientId: patient.id,
          appointmentId: appointment.id,
          hasPainData: painData.length > 0,
          sessionNumber: patientNotes.length + 1
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    showToast('Sessão salva com sucesso!', 'success');
    if (onSave) {
      onSave();
    }
    onClose();
  };

  const handleSaveAnyway = async () => {
    // Permite salvar mesmo com testes pendentes
    // Log de não conformidade já é feito pelo SaveBlockingDialog
    setShowBlockingDialog(false);
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
                  {/* Layout Selector */}
                  <div className="hidden lg:flex items-center space-x-1 mr-2 bg-white rounded-lg p-1 shadow-sm">
                    <button
                      onClick={() => setSelectedLayout('cards')}
                      className={`p-2 rounded transition-colors ${
                        selectedLayout === 'cards'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      title="Layout Cards"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedLayout('columns')}
                      className={`p-2 rounded transition-colors ${
                        selectedLayout === 'columns'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      title="Layout 2 Colunas"
                    >
                      <Columns className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedLayout('accordion')}
                      className={`p-2 rounded transition-colors ${
                        selectedLayout === 'accordion'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      title="Layout Accordion"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

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
                        {appointment.type || 'Não definido'}
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
              {loadError ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md px-6">
                    <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Erro ao Carregar Dados
                    </h3>
                    <p className="text-slate-600 mb-6">
                      {loadError}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        onClick={loadData}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Tentar Novamente
                      </Button>
                      <Button
                        onClick={onClose}
                        variant="outline"
                      >
                        Voltar
                      </Button>
                    </div>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg font-medium text-slate-900 mb-2">Carregando sessão...</p>
                    <p className="text-sm text-slate-500">{loadingMessage}</p>
                  </div>
                </div>
              ) : patient && appointment ? (
                <>
                  {selectedLayout === 'cards' && (
                    <SessionLayoutA_Cards
                      patient={patient}
                      sessionNumber={patientNotes.length + 1}
                      patientNotes={patientNotes}
                      mandatoryAlerts={mandatoryAlerts}
                      pathologies={pathologies}
                      goals={goals}
                      painData={painData}
                      previousPainData={previousPainData}
                      onSavePainData={handleSavePainData}
                      onDeletePainData={handleDeletePainData}
                      onSaveNote={handleSaveNote}
                      onCancel={onClose}
                      isSaving={isSaving}
                    />
                  )}

                  {selectedLayout === 'columns' && (
                    <SessionLayoutB_Columns
                      patient={patient}
                      sessionNumber={patientNotes.length + 1}
                      patientNotes={patientNotes}
                      mandatoryAlerts={mandatoryAlerts}
                      pathologies={pathologies}
                      goals={goals}
                      painData={painData}
                      previousPainData={previousPainData}
                      onSavePainData={handleSavePainData}
                      onDeletePainData={handleDeletePainData}
                      onSaveNote={handleSaveNote}
                      onCancel={onClose}
                      isSaving={isSaving}
                    />
                  )}

                  {selectedLayout === 'accordion' && (
                    <SessionLayoutC_Accordion
                      patient={patient}
                      sessionNumber={patientNotes.length + 1}
                      patientNotes={patientNotes}
                      mandatoryAlerts={mandatoryAlerts}
                      pathologies={pathologies}
                      goals={goals}
                      painData={painData}
                      previousPainData={previousPainData}
                      onSavePainData={handleSavePainData}
                      onDeletePainData={handleDeletePainData}
                      onSaveNote={handleSaveNote}
                      onCancel={onClose}
                      isSaving={isSaving}
                    />
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-600">Dados não encontrados</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Save Blocking Dialog */}
          {showBlockingDialog && (
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
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default SessionEvolutionModal;

