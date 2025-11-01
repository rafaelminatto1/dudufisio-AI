
/**
 * Modal de Agendamento - AppointmentFormModal
 * 
 * TODO: Futuras melhorias
 * - Migrar para React Hook Form para melhor gerenciamento de estado
 * - Adicionar validação com Zod schema
 * - Implementar validação em tempo real
 * - Adicionar debounce em campos de busca
 * - Melhorar performance com useMemo/useCallback
 * - Adicionar testes unitários
 * - Implementar acessibilidade completa (ARIA)
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { X, Save, Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentFormSchema, type AppointmentFormValues } from '../lib/validators/appointmentFormSchema';
import type { Appointment, Patient, Therapist, PatientSummary, RecurrenceRule } from '../types';
import { AppointmentStatus, AppointmentType } from '../types';
import { recurrenceTemplateService } from '../services/scheduling/recurrenceTemplateService';
import { waitlistService } from '../services/scheduling/waitlistService';
import { blockService } from '../services/scheduling/blockService';
import type { RecurrenceTemplate, WaitlistEntry, ScheduleBlock } from '../types';
import { useToast } from '../contexts/ToastContext';
import { PatientSearchInput } from './agenda/PatientSearchInput';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import RecurrenceSelector from './RecurrenceSelector';
import { findConflict } from '../services/scheduling/conflictDetection';
import { conflictDetectionService, Conflict } from '../services/scheduling/conflictDetectionService';
import ConflictWarningDialog from './agenda/ConflictWarningDialog';
import CapacityWarningDialog from './agenda/CapacityWarningDialog';
import { generateRecurrences } from '../services/scheduling/recurrenceService';
import { schedulingSettingsService } from '../services/schedulingSettingsService';
import { validateAppointment, formatValidationErrors } from '../lib/validators/agendaValidators';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { cn } from '../lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { handleError } from '../lib/middleware/errorHandler';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';

// Interface para futura migração para React Hook Form
interface AppointmentFormData {
  patient: Patient | PatientSummary | null;
  therapistId: string;
  appointmentType: AppointmentType;
  duration: number;
  slotTime: string;
  notes: string;
  recurrenceRule?: RecurrenceRule;
  templateId?: string;
}

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Appointment) => Promise<boolean>;
  onDelete?: (id: string, seriesId?: string) => Promise<boolean>;
  appointment?: Appointment;
  appointmentToEdit?: Appointment;
  initialData?: { date: Date, therapistId?: string, patientId?: string };
  patients?: Patient[];
  therapists?: Therapist[];
  allAppointments?: Appointment[];
}

const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({ isOpen, onClose, onSave, onDelete: _onDelete, appointment: _appointment, appointmentToEdit, initialData, patients = [], therapists = [], allAppointments = [] }) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | PatientSummary | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [loadingState, setLoadingState] = useState<'idle' | 'validating' | 'saving'>('idle');
  
  // React Hook Form - inicialização gradual com validação em tempo real
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    mode: 'onChange', // Validação em tempo real
    reValidateMode: 'onChange', // Re-validar em cada mudança
    defaultValues: {
      patient: null,
      therapistId: '',
      appointmentType: AppointmentType.Session,
      duration: 60,
      slotTime: '09:00',
      notes: '',
    },
  });
  
  // Log para debug
  useEffect(() => {
    console.log('🔍 AppointmentFormModal - selectedPatient atualizado:', selectedPatient);
  }, [selectedPatient]);
  const [appointmentType, setAppointmentType] = useState(AppointmentType.Session);
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | undefined>(undefined);
  const [isTeleconsultaEnabled, setIsTeleconsultaEnabled] = useState(false);
  const [templates, setTemplates] = useState<RecurrenceTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
  const [availableBlocks, setAvailableBlocks] = useState<ScheduleBlock[]>([]);
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [pendingAppointment, setPendingAppointment] = useState<Appointment | null>(null);
  const [alternativeTimes, setAlternativeTimes] = useState<Date[]>([]);
  const [showCapacityWarning, setShowCapacityWarning] = useState(false);
  const [capacityInfo, setCapacityInfo] = useState<{
    currentCount: number;
    maxCapacity: number;
    evaluationCount: number;
    maxEvaluations: number;
    isEvaluationLimit: boolean;
  } | null>(null);
  
  const { showToast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  // Focus trap para acessibilidade
  const containerRef = useFocusTrap({ 
    enabled: isOpen,
    initialFocus: closeButtonRef.current 
  });
  
  const slotDate = useMemo(() => appointmentToEdit?.startTime || initialData?.date || new Date(), [appointmentToEdit, initialData]);
  const [slotTime, setSlotTime] = useState('09:00');
  // Se therapistId começar com "therapist_", é um ID de mock - converter para vazio
  const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const getValidTherapistId = (id?: string) => (id && isValidUUID(id)) ? id : '';
  const [therapistId, setTherapistId] = useState<string>(getValidTherapistId(appointmentToEdit?.therapistId || initialData?.therapistId));
  
  // Memoizar terapeutas filtrados para melhor performance
  const filteredTherapists = useMemo(() => 
    therapists.filter(t => t.id !== ''), 
    [therapists]
  );
  
  // Callbacks memoizados para melhor performance
  const handleTherapistChange = useCallback((value: string) => {
    setTherapistId(value);
  }, []);
  
  const handleAppointmentTypeChange = useCallback((value: string) => {
    setAppointmentType(value as AppointmentType);
  }, []);
  
  const handleDurationChange = useCallback((value: string) => {
    setDuration(Number(value));
  }, []);
  
  // Reset do formulário ao fechar modal
  useEffect(() => {
    if (!isOpen) {
      form.reset({
        patient: null,
        therapistId: '',
        appointmentType: AppointmentType.Session,
        duration: 60,
        slotTime: '09:00',
        notes: '',
        recurrenceRule: undefined,
        templateId: undefined,
      });
      setShowValidation(false);
    }
  }, [isOpen, form]);
  
  useEffect(() => {
    if (isOpen) {
        console.log('🔍 AppointmentFormModal - useEffect executado');
        console.log('   isOpen:', isOpen);
        console.log('   appointmentToEdit:', appointmentToEdit);
        console.log('   initialData:', initialData);
        console.log('   initialData?.date:', initialData?.date);
        
        setIsTeleconsultaEnabled(schedulingSettingsService.getSettings().teleconsultaEnabled);
        if (appointmentToEdit) {
            const patient = patients.find(p => p.id === appointmentToEdit.patientId);
            setSelectedPatient(patient || null);
            setAppointmentType(appointmentToEdit.type);
            const dur = (appointmentToEdit.endTime.getTime() - appointmentToEdit.startTime.getTime()) / (60 * 1000);
            setDuration(dur);
            setNotes(appointmentToEdit.observations || '');
            setTherapistId(appointmentToEdit.therapistId);
            const slotTimeValue = format(appointmentToEdit.startTime, 'HH:mm');
            console.log('   setSlotTime (edit):', slotTimeValue);
            setSlotTime(slotTimeValue);
            setRecurrenceRule(appointmentToEdit.recurrenceRule);
            
            // Inicializar React Hook Form com dados de edição
            form.reset({
              patient: patient || null,
              therapistId: appointmentToEdit.therapistId || '',
              appointmentType: appointmentToEdit.type,
              duration: dur,
              slotTime: slotTimeValue,
              notes: appointmentToEdit.observations || '',
              recurrenceRule: appointmentToEdit.recurrenceRule as any,
            });
        } else {
            // Se temos initialData com patientId (vindo da lista de espera), pré-selecionar o paciente
            if (initialData && 'patientId' in initialData && initialData.patientId) {
                const patient = patients.find(p => p.id === initialData.patientId);
                setSelectedPatient(patient || null);
            } else {
                setSelectedPatient(null);
            }
            setAppointmentType(AppointmentType.Session);
            setDuration(60);
            setNotes('');
            setTherapistId(initialData?.therapistId || '');
            
            // Corrigir hora: garantir que a data tenha hora definida
            const dateToUse = initialData?.date || new Date();
            const hours = dateToUse.getHours();
            const minutes = dateToUse.getMinutes();
            
            // Se a hora for 00:00 (meia-noite), usar 09:00 como padrão
            const slotTimeValue = (hours === 0 && minutes === 0) 
                ? '09:00' 
                : format(dateToUse, 'HH:mm');
            
            console.log('   setSlotTime (new):', slotTimeValue);
            console.log('   initialData?.date:', initialData?.date);
            console.log('   dateToUse hours:', hours, 'minutes:', minutes);
            setSlotTime(slotTimeValue);
            setRecurrenceRule(undefined);
        }
    }
  }, [appointmentToEdit, initialData, isOpen, patients]);

  // useEffect separado para atualizar slotTime quando initialData.date mudar
  // Este useEffect resolve o bug de sempre mostrar 09:00 quando clicar em diferentes slots
  useEffect(() => {
    if (isOpen && initialData?.date && !appointmentToEdit) {
      const dateToUse = initialData.date;
      const hours = dateToUse.getHours();
      const minutes = dateToUse.getMinutes();
      
      // Se a hora for 00:00 (meia-noite), usar 09:00 como padrão
      const slotTimeValue = (hours === 0 && minutes === 0) 
        ? '09:00' 
        : format(dateToUse, 'HH:mm');
      
      console.log('⏰ Atualizando slotTime dinamicamente:', slotTimeValue);
      console.log('   Data recebida:', dateToUse);
      console.log('   Horário calculado:', hours, ':', minutes);
      
      // Atualizar estado local E formulário React Hook Form
      setSlotTime(slotTimeValue);
      form.setValue('slotTime', slotTimeValue, { shouldValidate: true });
    }
  }, [initialData?.date, isOpen, appointmentToEdit, form]);

  // useEffect separado para atualizar therapistId quando therapists são carregados
  useEffect(() => {
    if (isOpen && therapists.length > 0 && !therapistId) {
      // Sempre manter vazio para mostrar o placeholder "Selecionar depois (na evolução)"
      setTherapistId('');
    }
  }, [isOpen, therapists, therapistId]);

  useEffect(() => {
    recurrenceTemplateService.listTemplates()?.then(setTemplates).catch(() => showToast('Falha ao carregar templates.', 'error'));
    blockService.listBlocks()?.then(setAvailableBlocks).catch(() => showToast('Falha ao carregar bloqueios.', 'error'));
    waitlistService.listEntries('waiting').then(setWaitlistEntries).catch(() => showToast('Falha ao carregar fila de espera.', 'error'));
  }, [showToast]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if(isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, isOpen]);

  const handleSaveClick = async (formData?: AppointmentFormValues) => {
    console.log('🚀 handleSaveClick CHAMADO!');
    console.log('   FormData recebido:', formData);
    console.log('   FormData.patient:', formData?.patient);
    console.log('   selectedPatient state:', selectedPatient);
    console.log('   form.getValues("patient"):', form.getValues('patient'));

    // Priorizar formData.patient, mas fazer fallback robusto
    const patient = formData?.patient || form.getValues('patient') || selectedPatient;

    console.log('   ✅ Paciente final selecionado:', patient);
    console.log('   slotTime:', slotTime);
    console.log('   therapistId:', therapistId);
    console.log('   appointmentType:', appointmentType);
    console.log('   duration:', duration);

    if (!patient || !patient.id) {
      console.error('❌ Nenhum paciente selecionado - patient:', patient);
      console.error('   formData.patient:', formData?.patient);
      console.error('   form.getValues:', form.getValues('patient'));
      console.error('   selectedPatient:', selectedPatient);
      setShowValidation(true);
      showToast('Por favor, selecione um paciente', 'error');
      return;
    }

    console.log('✅ Paciente válido, iniciando salvamento');
    setIsSaving(true);

    const startTime = new Date(slotDate);
    const [hour, minute] = slotTime.split(':');
    startTime.setHours(parseInt(hour || '0'), parseInt(minute || '0'), 0, 0);

    const endTime = new Date(startTime.getTime() + duration * 60000);

    const appointmentId = appointmentToEdit?.id || `app_${Date.now()}`;
    console.log('🔍 AppointmentFormModal - Gerando agendamento com ID:', appointmentId);
    console.log('🔍 AppointmentFormModal - Paciente selecionado:', patient);

    const baseAppointment: Appointment = {
      id: appointmentId,
      patientId: patient.id,
      patientName: patient.name,
      patientAvatarUrl: (patient as any).avatarUrl || `https://i.pravatar.cc/150?u=${patient.id}`,
      // Apenas usar therapistId se for um UUID válido (dados do Supabase)
      therapistId: (therapistId && isValidUUID(therapistId)) ? therapistId : undefined,
      title: appointmentToEdit?.title || `${appointmentType}`,
      startTime: startTime,
      endTime: endTime,
      duration: duration, // 🔧 CORREÇÃO CRÍTICA: Campo duration obrigatório
      status: appointmentToEdit?.status || AppointmentStatus.Scheduled,
      type: appointmentType,
      observations: notes,
      value: appointmentToEdit?.value || 120,
      paymentStatus: appointmentToEdit?.paymentStatus || 'pending',
      recurrenceRule: recurrenceRule,
      seriesId: recurrenceRule ? (appointmentToEdit?.seriesId || `series_${Date.now()}`) : undefined,
    };
    
    // Validar agendamento
    const validation = validateAppointment(baseAppointment);
    if (!validation.valid) {
      const errorMessage = formatValidationErrors(validation.errors);
      showToast(errorMessage, 'error');
      setIsSaving(false);
      return;
    }
    
    const appointmentsToSave = generateRecurrences(baseAppointment);
    console.log('🔄 Agendamentos gerados para salvar:', appointmentsToSave);
    
    // Verificar capacidade do horário (limites de profissionais)
    const occupancy = schedulingSettingsService.getSlotOccupancy(
      startTime, 
      allAppointments,
      appointmentToEdit?.id // Ignorar o próprio agendamento se estiver editando
    );
    
    console.log('📊 Verificação de capacidade:', occupancy);
    
    // Se o horário excede o limite (não apenas no limite exato), mostrar aviso
    if (occupancy.patientCount >= occupancy.patientLimit || occupancy.isEvalLimitFull) {
      const isEvalLimit = appointmentType === AppointmentType.Evaluation && occupancy.isEvalLimitFull;
      
      setCapacityInfo({
        currentCount: occupancy.patientCount,
        maxCapacity: occupancy.patientLimit,
        evaluationCount: occupancy.evalCount,
        maxEvaluations: occupancy.evalLimit,
        isEvaluationLimit: isEvalLimit
      });
      setPendingAppointment(baseAppointment);
      setShowCapacityWarning(true);
      setIsSaving(false);
      return;
    }
    
    // Verificar conflitos usando o novo serviço (incluindo bloqueios)
    // Nota: se therapistId estiver vazio, não verificar conflitos de terapeuta
    setLoadingState('validating');
    const conflictCheck = baseAppointment.therapistId 
      ? await conflictDetectionService.checkConflicts(
          baseAppointment,
          allAppointments as any,
          availableBlocks
        )
      : { hasConflicts: false, conflicts: [] };
    setLoadingState('idle');

    if (conflictCheck.hasConflicts) {
      // Sugerir horários alternativos
      const suggestions = conflictDetectionService.suggestAlternativeTimes(
        baseAppointment.startTime,
        duration,
        allAppointments as any,
        availableBlocks,
        baseAppointment.therapistId,
        5
      );
      setAlternativeTimes(suggestions);
      
      setConflicts(conflictCheck.conflicts);
      setPendingAppointment(baseAppointment);
      setShowConflictDialog(true);
      setIsSaving(false);
      return;
    }

    // In a real scenario, this might be a single batch API call
    setLoadingState('saving');
    let success = true;
    for (const app of appointmentsToSave) {
        console.log('💾 Salvando agendamento via onSave:', app);
        const result = await onSave(app);
        console.log('✅ Resultado do onSave:', result);
        if(!result) {
            success = false;
            break;
        }
    }

    if (success) {
      console.log('🎉 Todos os agendamentos salvos com sucesso, fechando modal');
      onClose();
    } else {
      console.error('❌ Falha ao salvar alguns agendamentos');
    }
    setLoadingState('idle');
    setIsSaving(false);
  };

  const handleConfirmCapacity = async () => {
    if (!pendingAppointment) return;

    setIsSaving(true);
    setShowCapacityWarning(false);

    // Marcar o agendamento como tendo sobrecarga
    const appointmentWithOverload = {
      ...pendingAppointment,
      hasConflict: true,
      conflictReason: capacityInfo?.isEvaluationLimit 
        ? `Limite de avaliações excedido (${capacityInfo.evaluationCount}/${capacityInfo.maxEvaluations})`
        : `Capacidade excedida (${capacityInfo?.currentCount}/${capacityInfo?.maxCapacity} profissionais)`
    };

    const appointmentsToSave = generateRecurrences(appointmentWithOverload);

    let success = true;
    for (const app of appointmentsToSave) {
      const result = await onSave(app);
      if (!result) {
        success = false;
        break;
      }
    }

    if (success) {
      showToast('Agendamento criado com aviso de sobrecarga.', 'info');
      onClose();
    }
    setIsSaving(false);
  };

  const handleConfirmConflict = async () => {
    if (!pendingAppointment) return;

    setIsSaving(true);
    setShowConflictDialog(false);

    // Marcar o agendamento com conflitos
    const appointmentWithConflict = conflictDetectionService.markAppointmentWithConflicts(
      pendingAppointment,
      conflicts
    );

    const appointmentsToSave = generateRecurrences(appointmentWithConflict);

    let success = true;
    for (const app of appointmentsToSave) {
      const result = await onSave(app);
      if (!result) {
        success = false;
        break;
      }
    }

    if (success) {
      showToast('Agendamento criado com aviso de conflito.', 'info');
      onClose();
    }
    setIsSaving(false);
  };

  const applyTemplate = async (templateId?: string) => {
    const idToUse = templateId || selectedTemplateId;
    if (!idToUse) {
      showToast('Selecione um template para aplicar.', 'error');
      return;
    }
    if (!selectedPatient) {
      showToast('Selecione um paciente antes de aplicar o template.', 'error');
      return;
    }
    try {
      const baseAppointment = {
        patientId: selectedPatient?.id,
        patientName: selectedPatient?.name,
        patientAvatarUrl: (selectedPatient as any)?.avatarUrl,
        therapistId,
        title: `${appointmentType}`,
        type: appointmentType,
        status: AppointmentStatus.Scheduled,
        value: 120,
        paymentStatus: 'pending',
        metadata: {},
      } as Partial<Appointment>;

      const result = await recurrenceTemplateService.applyTemplate(
        idToUse,
        slotDate,
        baseAppointment,
        allAppointments
      );

      showToast('Template aplicado com sucesso!', 'success');
      if (result.waitlistMatch) {
        showToast(`Paciente da fila sugerido: ${result.waitlistMatch.patientId}`, 'info');
      }
      onClose?.();
    } catch (error) {
      console.error(error);
      showToast('Falha ao aplicar template recorrente.', 'error');
    }
  };

  if (!isOpen) return null;
  const title = appointmentToEdit ? 'Editar Agendamento' : 'Novo Agendamento';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      data-testid="appointment-form-modal"
    >
      <div 
        ref={containerRef}
        className="bg-transparent rounded-lg shadow-xl w-full max-w-[95vw] sm:max-w-3xl md:max-w-4xl mx-2 sm:mx-4 max-h-[90vh] flex flex-col"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b" data-testid="modal-header">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>{title}</CardTitle>
                {appointmentToEdit && (
                  <Badge variant="info">Editando</Badge>
                )}
              </div>
              <CardDescription className="mt-1">Preencha os dados do agendamento</CardDescription>
            </div>
          <button 
            ref={closeButtonRef}
            onClick={onClose} 
            className="p-1 hover:bg-slate-100 rounded-full transition"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
          </CardHeader>
        
        <div className="bg-muted/50 px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-sm border-b">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-medium">{format(slotDate, "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <Controller
              name="slotTime"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <input 
                    type="time" 
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setSlotTime(e.target.value);
                    }}
                    className={cn(
                      "font-medium bg-background border border-input rounded px-2 py-1 focus:ring-2 focus:ring-ring focus:border-ring hover:border-ring/50 transition-colors cursor-pointer",
                      fieldState.error && "border-destructive"
                    )}
                    title="Clique para alterar o horário"
                    data-testid="time-input"
                  />
                  {fieldState.error && (
                    <p className="text-xs text-destructive ml-2">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
        </div>
        
        <Separator className="my-0" />
        
        <div id="modal-description" className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Coluna 1 */}
            <div className="space-y-4">
              <Controller
                name="patient"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div 
                    className={cn(
                      "space-y-2",
                      fieldState.error && "animate-shake"
                    )}
                    aria-invalid={!!fieldState.error}
                    aria-describedby={fieldState.error ? "patient-error" : undefined}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-sm font-medium">Paciente</Label>
                      <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                    </div>
            <PatientSearchInput
                      onSelectPatient={async (patient) => {
                        console.log('👤 onSelectPatient callback - Paciente recebido:', patient);
                        console.log('🔄 Atualizando field via field.onChange (React Hook Form)');

                        // Atualizar tanto o form quanto o state local
                        field.onChange(patient as any);
                        setSelectedPatient(patient);

                        // Forçar validação do campo patient após mudança
                        console.log('🔄 Forçando validação do campo patient...');
                        await form.trigger('patient');

                        // Verificar se a validação passou
                        const errors = form.formState.errors;
                        console.log('📋 Estado do formulário após validação:', {
                          isValid: form.formState.isValid,
                          errors: errors,
                          patientValue: form.getValues('patient')
                        });

                        console.log('✅ onSelectPatient callback - Sincronização completa');
                      }}
                      selectedPatient={field.value as any}
                    />
                    {fieldState.error && (
                      <p id="patient-error" className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {fieldState.error.message}
                      </p>
                    )}
          </div>
                )}
              />
              
              <Controller
                name="therapistId"
                control={form.control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="therapist">
                      Fisioterapeuta <span className="text-muted-foreground">(opcional)</span>
                    </Label>
                    <Select value={field.value} onValueChange={(value) => {
                      field.onChange(value);
                      setTherapistId(value);
                    }}>
                      <SelectTrigger data-testid="therapist-select">
                        <SelectValue placeholder="Selecionar depois (na evolução)" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredTherapists.map(t => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}{t.crefito ? ` - ${t.crefito}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Deixe vazio para definir o profissional após o atendimento
                    </p>
          </div>
                )}
              />

              <Controller
                name="appointmentType"
                control={form.control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="appointment-type">Tipo de Atendimento</Label>
                    <Select value={field.value} onValueChange={(value) => {
                      field.onChange(value);
                      setAppointmentType(value as AppointmentType);
                    }}>
                      <SelectTrigger data-testid="appointment-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
              {Object.values(AppointmentType)
                  .filter(type => isTeleconsultaEnabled || type !== AppointmentType.Teleconsulta)
                          .map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
          </div>
          
            {/* Coluna 2 */}
            <div className="space-y-4">
              <Controller
                name="duration"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label>Duração</Label>
                    <RadioGroup 
                      value={field.value.toString()} 
                      onValueChange={(v) => {
                        field.onChange(Number(v));
                        setDuration(Number(v)); // Manter sincronizado com estado local
                      }}
                    >
                      <div className="flex gap-4">
              {[30, 45, 60].map(min => (
                          <div key={min} className="flex items-center space-x-2">
                            <RadioGroupItem value={min.toString()} id={`duration-${min}`} />
                            <Label htmlFor={`duration-${min}`} className="cursor-pointer">{min} min</Label>
                          </div>
              ))}
            </div>
                    </RadioGroup>
                    {fieldState.error && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {fieldState.error.message}
                      </p>
                    )}
          </div>
                )}
              />
              
              <Controller
                name="recurrenceRule"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    {!appointmentToEdit?.seriesId && (
                      <RecurrenceSelector 
                        recurrenceRule={field.value as any} 
                        onChange={(value) => {
                          field.onChange(value as any);
                          setRecurrenceRule(value);
                        }}
                      />
                    )}
                    {fieldState.error && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="templateId"
                control={form.control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="template">Templates de horários</Label>
            <div className="flex gap-2">
                      <Select value={field.value || ""} onValueChange={(value) => {
                        field.onChange(value || undefined);
                        setSelectedTemplateId(value || undefined);
                      }}>
                        <SelectTrigger className="flex-1" data-testid="template-select">
                          <SelectValue placeholder="Selecione um template" />
                        </SelectTrigger>
                        <SelectContent>
                {templates.map(template => (
                            <SelectItem key={template.id} value={template.id}>{template.title}</SelectItem>
                ))}
                        </SelectContent>
                      </Select>
                      <Button
                type="button"
                        onClick={() => applyTemplate(field.value)}
                        variant="default"
                        size="sm"
                        disabled={!field.value}
              >
                Aplicar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use templates para criar séries de horários recorrentes e otimizar encaixes.
                    </p>
                  </div>
                )}
              />
            </div>
          </div>

          <Separator className="my-6" />
          
          {/* Observações - largura completa */}
          <div className="mt-6">
            <Controller
              name="notes"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    {...field}
                    id="notes"
                    rows={3}
                    placeholder="Observações sobre o atendimento..."
                    data-testid="notes-textarea"
                    maxLength={500}
                    onChange={(e) => {
                      field.onChange(e);
                      setNotes(e.target.value);
                    }}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/500 caracteres
                    </p>
                    {fieldState.error && (
                      <p className="text-xs text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
            </div>
          )}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/50 rounded-b-lg border-t">
          <Button variant="outline" onClick={onClose} disabled={loadingState !== 'idle'}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(
              handleSaveClick,
              (errors) => {
                console.error('❌ VALIDAÇÃO FALHOU - Erros do formulário:', errors);
                console.error('   Valores atuais do form:', form.getValues());
                console.error('   Estado isValid:', form.formState.isValid);
                console.error('   Estado isDirty:', form.formState.isDirty);
                console.error('   Campos com erro:', Object.keys(errors));

                // Mostrar erro específico do paciente se existir
                if (errors.patient) {
                  console.error('   ⚠️ ERRO NO CAMPO PACIENTE:', errors.patient.message);
                  showToast(`Erro: ${errors.patient.message}`, 'error');
                } else {
                  showToast('Por favor, corrija os erros no formulário', 'error');
                }
              }
            )}
            disabled={loadingState !== 'idle'}
            data-testid="submit-button"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:bg-blue-400 disabled:text-white"
          >
            {loadingState === 'validating' && (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                Verificando conflitos...
              </>
            )}
            {loadingState === 'saving' && (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                Salvando...
              </>
            )}
            {loadingState === 'idle' && (
              <>
            <Save className="w-4 h-4 mr-2"/>
                Confirmar Agendamento
              </>
            )}
          </Button>
        </div>
        </Card>
      </div>

      {/* Capacity Warning Dialog */}
      {showCapacityWarning && capacityInfo && (
        <CapacityWarningDialog
          isOpen={showCapacityWarning}
          onClose={() => {
            setShowCapacityWarning(false);
            setCapacityInfo(null);
            setPendingAppointment(null);
            setIsSaving(false);
          }}
          onConfirm={handleConfirmCapacity}
          patientName={pendingAppointment?.patientName}
          timeSlot={slotTime}
          currentCount={capacityInfo.currentCount}
          maxCapacity={capacityInfo.maxCapacity}
          evaluationCount={capacityInfo.evaluationCount}
          maxEvaluations={capacityInfo.maxEvaluations}
          isEvaluationLimit={capacityInfo.isEvaluationLimit}
        />
      )}

      {/* Conflict Warning Dialog */}
      <ConflictWarningDialog
        isOpen={showConflictDialog}
        onClose={() => {
          setShowConflictDialog(false);
          setConflicts([]);
          setPendingAppointment(null);
          setAlternativeTimes([]);
        }}
        onConfirm={handleConfirmConflict}
        conflicts={conflicts}
        patientName={pendingAppointment?.patientName}
        therapistName={therapists.find(t => t.id === pendingAppointment?.therapistId)?.name}
        alternativeTimes={alternativeTimes}
      />
    </div>
  );
};

export default AppointmentFormModal;
