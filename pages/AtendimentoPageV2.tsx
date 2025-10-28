// pages/AtendimentoPageV2.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, BarChart3, BrainCircuit, Paperclip } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';

import { AtendimentoLayout } from '../components/atendimento/layout/AtendimentoLayout';
import { AtendimentoHeader } from '../components/atendimento/layout/AtendimentoHeader';
import { SoapTab } from '../components/atendimento/tabs/SoapTab';
import { MetricsTab } from '../components/atendimento/tabs/MetricsTab';
import { AITab } from '../components/atendimento/tabs/AITab';
import { AttachmentsTab } from '../components/atendimento/tabs/AttachmentsTab';

import { usePageData } from '../hooks/usePageData';
import { useToast } from '../contexts/ToastContext';
import { useAtendimentoAutoSave } from '../hooks/atendimento/useAtendimentoAutoSave';
import { useAtendimentoKeyboardShortcuts } from '../hooks/atendimento/useAtendimentoKeyboardShortcuts';

import {
  attendanceFormSchema,
  type AttendanceFormData,
} from '../schemas/attendanceFormValidation';

import * as appointmentService from '../services/appointmentService';
import * as patientService from '../services/patientService';
import * as soapNoteService from '../services/soapNoteService';
import * as treatmentService from '../services/treatmentService';
import type { Patient, Appointment, AppointmentStatus, SoapNote, TreatmentPlan, ExercisePrescription } from '../types';

import PageLoader from '../components/ui/PageLoader';

const defaultFormValues: AttendanceFormData = {
  subjective: '',
  objective: '',
  assessment: '',
  plan: '',
  painScale: undefined,
  painPoints: [],
  metricResults: [],
  attachments: [],
};

const AtendimentoPageV2: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Estado
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [sessions, setSessions] = useState<SoapNote[]>([]);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [exercises, setExercises] = useState<ExercisePrescription[]>([]);
  const [activeTab, setActiveTab] = useState('soap');

  // Form
  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceFormSchema),
    mode: 'onBlur',
    defaultValues: defaultFormValues,
  });

  // Hooks customizados
  const { saveStatus, canFinish, saveManually } = useAtendimentoAutoSave(
    patient?.id || ''
  );

  // Carregar dados
  const fetchData = useCallback(async () => {
    if (!appointmentId) return;

    const appointments = await appointmentService.getAppointments();
    const apt = appointments.find((a) => a.id === appointmentId);

    if (!apt) throw new Error('Agendamento não encontrado');

    setAppointment(apt);

    const pat = await patientService.getPatientById(apt.patientId);
    if (!pat) throw new Error('Paciente não encontrado');

    setPatient(pat);

    // Carregar histórico de sessões
    const patientSessions = await soapNoteService.getNotesByPatientId(pat.id);
    setSessions(patientSessions);

    // Carregar plano de tratamento
    const plan = await treatmentService.getPlanByPatientId(pat.id);
    setTreatmentPlan(plan);

    // Carregar exercícios se houver plano
    if (plan) {
      const planExercises = await treatmentService.getExercisesByPlanId(plan.id);
      setExercises(planExercises);
    }
  }, [appointmentId]);

  const { isLoading, error } = usePageData([fetchData], [appointmentId]);

  // Handlers
  const handleFinishSession = useCallback(async () => {
    if (!canFinish || !appointment || !patient) {
      showToast('Aguarde o salvamento antes de finalizar', 'warning');
      return;
    }

    try {
      await appointmentService.saveAppointment({
        ...appointment,
        status: 'completed' as AppointmentStatus,
      });

      showToast('Sessão finalizada com sucesso!', 'success');
      navigate(`/patients/${patient.id}`);
    } catch (err) {
      showToast('Erro ao finalizar sessão', 'error');
    }
  }, [canFinish, appointment, patient, navigate, showToast]);

  const handleGenerateAI = useCallback(() => {
    // Switch to AI tab when Ctrl+G is pressed or sidebar button is clicked
    setActiveTab('ai');
  }, []);

  const handleRepeatConduct = useCallback(() => {
    if (sessions.length === 0) {
      showToast('Nenhuma sessão anterior encontrada', 'info');
      return;
    }

    const lastSession = sessions[0];
    form.setValue('subjective', lastSession.subjective || '', { shouldDirty: true });
    form.setValue('objective', lastSession.objective || '', { shouldDirty: true });
    form.setValue('assessment', lastSession.assessment || '', { shouldDirty: true });
    form.setValue('plan', lastSession.plan || '', { shouldDirty: true });

    if (lastSession.painScale !== undefined) {
      form.setValue('painScale', lastSession.painScale, { shouldDirty: true });
    }

    showToast('Conduta da sessão anterior carregada!', 'success');
  }, [sessions, form, showToast]);

  const handleTakePhoto = useCallback(() => {
    setActiveTab('attachments');
    showToast('Funcionalidade de foto será implementada na Fase 4', 'info');
  }, [showToast]);

  const handleAddAttachment = useCallback(() => {
    setActiveTab('attachments');
    showToast('Funcionalidade de anexos será implementada na Fase 4', 'info');
  }, [showToast]);

  const handleViewSession = useCallback((session: SoapNote) => {
    showToast(`Visualizando sessão de ${new Date(session.date).toLocaleDateString('pt-BR')}`, 'info');
    // Aqui você pode abrir um modal com os detalhes da sessão
  }, [showToast]);

  const handleRepeatSession = useCallback((session: SoapNote) => {
    form.setValue('subjective', session.subjective || '', { shouldDirty: true });
    form.setValue('objective', session.objective || '', { shouldDirty: true });
    form.setValue('assessment', session.assessment || '', { shouldDirty: true });
    form.setValue('plan', session.plan || '', { shouldDirty: true });

    if (session.painScale !== undefined) {
      form.setValue('painScale', session.painScale, { shouldDirty: true });
    }

    showToast(`Conduta de ${new Date(session.date).toLocaleDateString('pt-BR')} carregada!`, 'success');
    setActiveTab('soap'); // Volta para o tab SOAP
  }, [form, showToast]);

  // Calcular métricas de sessão
  const sessionMetrics = useMemo(() => {
    const totalSessions = sessions.length;
    const firstSession = sessions[sessions.length - 1];
    const lastSession = sessions[0];

    let treatmentDays = 0;
    if (firstSession && lastSession) {
      const first = new Date(firstSession.date);
      const last = new Date(lastSession.date);
      treatmentDays = Math.floor((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      totalSessions,
      treatmentDays,
    };
  }, [sessions]);

  // Atalhos de teclado
  useAtendimentoKeyboardShortcuts({
    onSave: saveManually,
    onFinish: handleFinishSession,
    onGenerateAI: handleGenerateAI,
    onRepeatConduct: handleRepeatConduct,
    onSwitchTab: (index) => {
      const tabs = ['soap', 'metrics', 'ai', 'attachments'];
      setActiveTab(tabs[index]);
    },
  });

  // Loading
  if (isLoading) {
    return <PageLoader />;
  }

  // Error
  if (error || !patient || !appointment) {
    return (
      <div className="text-center p-10 text-red-500">
        {error?.message || 'Erro ao carregar dados'}
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <AtendimentoLayout
        patient={patient}
        appointment={appointment}
        sessions={sessions}
        treatmentPlan={treatmentPlan}
        exercises={exercises}
        saveStatus={saveStatus}
        canFinish={canFinish}
        onFinish={handleFinishSession}
        onRepeatConduct={handleRepeatConduct}
        onGenerateAI={handleGenerateAI}
        onTakePhoto={handleTakePhoto}
        onAddAttachment={handleAddAttachment}
        onViewSession={handleViewSession}
        onRepeatSession={handleRepeatSession}
        sessionCount={sessionMetrics.totalSessions}
        treatmentDays={sessionMetrics.treatmentDays}
        header={
          <AtendimentoHeader
            patient={patient}
            appointment={appointment}
            saveStatus={saveStatus}
            canFinish={canFinish}
            onFinish={handleFinishSession}
          />
        }
      >
        {/* Sistema de Tabs com Radix UI */}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          {/* Tab List */}
          <Tabs.List className="flex gap-2 border-b border-slate-200 mb-6">
            <Tabs.Trigger
              value="soap"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg transition-colors data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
            >
              <FileText className="w-4 h-4" />
              <span>SOAP</span>
            </Tabs.Trigger>

            <Tabs.Trigger
              value="metrics"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg transition-colors data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Métricas</span>
            </Tabs.Trigger>

            <Tabs.Trigger
              value="ai"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg transition-colors data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-600"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>IA</span>
            </Tabs.Trigger>

            <Tabs.Trigger
              value="attachments"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg transition-colors data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
            >
              <Paperclip className="w-4 h-4" />
              <span>Anexos</span>
            </Tabs.Trigger>
          </Tabs.List>

          {/* Tab Content */}
          <Tabs.Content value="soap">
            <SoapTab />
          </Tabs.Content>

          <Tabs.Content value="metrics">
            <MetricsTab sessions={sessions} />
          </Tabs.Content>

          <Tabs.Content value="ai">
            <AITab />
          </Tabs.Content>

          <Tabs.Content value="attachments">
            <AttachmentsTab />
          </Tabs.Content>
        </Tabs.Root>
      </AtendimentoLayout>
    </FormProvider>
  );
};

export default AtendimentoPageV2;
