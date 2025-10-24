import React, { useState, useEffect } from 'react';
import { X, Save, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../contexts/ToastContext';
import SessionEvolutionContainer from './SessionEvolutionContainer';
import { Patient, EnrichedAppointment, SoapNote, Surgery, PatientGoal, Pathology, MandatoryTestAlert, MedicalInsight } from '../../types';
import * as appointmentService from '../../services/appointmentService';
import * as patientService from '../../services/patientService';
import * as soapNoteService from '../../services/soapNoteService';
import * as surgeryService from '../../services/surgeryService';
import * as patientGoalsService from '../../services/patientGoalsService';
import * as pathologyService from '../../services/pathologyService';
import * as mandatoryTestAlertService from '../../services/mandatoryTestAlertService';
import * as medicalReportSuggestionsService from '../../services/medicalReportSuggestionsService';
import { AnimatePresence, motion } from 'framer-motion';

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
  const [isMaximized, setIsMaximized] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showBlockingDialog, setShowBlockingDialog] = useState(false);
  const [pendingCriticalTests, setPendingCriticalTests] = useState<MandatoryTestAlert[]>([]);

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

      // Carregar todos os dados em paralelo
      const [
        notesData,
        surgeriesData,
        goalsData,
        pathologiesData,
      ] = await Promise.all([
        soapNoteService.getNotesByPatientId(patientData.id),
        surgeryService.getSurgeriesByPatientId(patientData.id),
        patientGoalsService.getGoalsByPatientId(patientData.id),
        pathologyService.getPathologiesByPatientId(patientData.id),
      ]);

      setPatientNotes(notesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setSurgeries(surgeriesData);
      setGoals(goalsData);
      setPathologies(pathologiesData);

      // Gerar alertas e insights
      const sessionNumber = notesData.length + 1;
      const [alerts, insights] = await Promise.all([
        mandatoryTestAlertService.generateMandatoryTestAlerts(patientData.id, sessionNumber),
        medicalReportSuggestionsService.generateMedicalInsights(patientData.id),
      ]);

      setMandatoryAlerts(alerts);
      setMedicalInsights(insights);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showToast('Erro ao carregar dados da sessão', 'error');
      onClose();
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

      // Recarregar dados
      await loadData();

      showToast('Sessão registrada com sucesso!', 'success');
      
      if (onSave) {
        onSave();
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      showToast('Erro ao salvar sessão', 'error');
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
                      <SOAPFormPanel
                        patientId={patient.id}
                        sessionNumber={patientNotes.length + 1}
                        previousNote={patientNotes[0] || null}
                        onSave={handleSaveNote}
                        onCancel={onClose}
                        isLoading={isSaving}
                      />
                    </div>
                  }
                  historySlot={
                    <div className="space-y-6">
                      <SessionHistoryPanel
                        patientId={patient.id}
                        limit={10}
                        onReplicateConduct={(note) => {/* Implementar replicação */}}
                      />
                      
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Cirurgias</h3>
                        <SurgeryTimeline
                          patientId={patient.id}
                        />
                      </div>

                      <TreatmentDurationCard
                        patient={patient}
                      />
                    </div>
                  }
                  evolutionSlot={
                    <div className="space-y-6">
                      {/* Alertas de Testes Obrigatórios */}
                      {mandatoryAlerts.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-4">Alertas</h3>
                          <MandatoryTestAlertComponent
                            alerts={mandatoryAlerts}
                          />
                        </div>
                      )}

                      {/* Patologias */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Patologias</h3>
                        <PathologyManager
                          patientId={patient.id}
                        />
                      </div>

                      {/* Evolução de Testes */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Evolução</h3>
                        <TestEvolutionPanel
                          patientId={patient.id}
                          sessionNumber={patientNotes.length + 1}
                        />
                      </div>
                    </div>
                  }
                  summarySlot={
                    <div className="space-y-6">
                      <PatientOverview patient={patient} />

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Objetivos</h3>
                        <PatientGoalsPanel
                          patient={patient}
                        />
                      </div>

                      <PatientMetrics
                        patient={patient}
                        appointments={[appointment]}
                      />

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Insights</h3>
                        <MedicalReportSuggestions
                          patientId={patient.id}
                          isCollapsible={true}
                          defaultExpanded={true}
                        />
                      </div>
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

