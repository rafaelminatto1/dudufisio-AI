

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Save, Calendar, Clock } from 'lucide-react';
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
  const [therapistId, setTherapistId] = useState<string>(appointmentToEdit?.therapistId || initialData?.therapistId || '');
  
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

  const handleSaveClick = async () => {
    console.log('🔍 Validando agendamento - Paciente selecionado:', selectedPatient);
    
    if (!selectedPatient) {
      console.warn('⚠️ Nenhum paciente selecionado');
      showToast('Selecione um paciente para agendar.', 'error');
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
    console.log('🔍 AppointmentFormModal - Paciente selecionado:', selectedPatient);
    
    const baseAppointment: Appointment = {
      id: appointmentId,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientAvatarUrl: (selectedPatient as any).avatarUrl || `https://i.pravatar.cc/150?u=${selectedPatient.id}`,
      therapistId: therapistId || undefined, // Permitir vazio
      title: appointmentToEdit?.title || `${appointmentType}`,
      startTime: startTime,
      endTime: endTime,
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
    const conflictCheck = baseAppointment.therapistId 
      ? await conflictDetectionService.checkConflicts(
          baseAppointment,
          allAppointments,
          availableBlocks
        )
      : { hasConflicts: false, conflicts: [] };

    if (conflictCheck.hasConflicts) {
      // Sugerir horários alternativos
      const suggestions = conflictDetectionService.suggestAlternativeTimes(
        baseAppointment.startTime,
        duration,
        allAppointments,
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
      showToast('Agendamento criado com aviso de sobrecarga.', 'warning');
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
      showToast('Agendamento criado com aviso de conflito.', 'warning');
      onClose();
    }
    setIsSaving(false);
  };

  const applyTemplate = async () => {
    if (!selectedTemplateId) {
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
        selectedTemplateId,
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
    >
      <div 
        ref={containerRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 id="modal-title" className="text-xl font-semibold">{title}</h2>
          <button 
            ref={closeButtonRef}
            onClick={onClose} 
            className="p-1 hover:bg-slate-100 rounded-full transition"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="bg-sky-50 px-4 py-3 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-sky-600" /><span className="font-medium">{format(slotDate, "EEEE, d 'de' MMMM", { locale: ptBR })}</span></div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-sky-600" />
            <input type="time" value={slotTime} onChange={e => setSlotTime(e.target.value)} className="font-medium bg-transparent border-none p-0 focus:ring-0" />
          </div>
        </div>
        
        <div id="modal-description" className="p-4 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Paciente *</label>
            <PatientSearchInput
              onSelectPatient={setSelectedPatient}
              selectedPatient={selectedPatient}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fisioterapeuta <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <select
              value={therapistId}
              onChange={(e) => setTherapistId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 text-sm"
            >
              <option value="">Selecionar depois (na evolução)</option>
              {therapists.map(t => <option key={t.id} value={t.id}>{t.name}{t.crefito ? ` - ${t.crefito}` : ''}</option>)}
            </select>
            <p className="mt-1 text-xs text-slate-500">Deixe vazio para definir o profissional após o atendimento</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Atendimento</label>
            <select
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value as AppointmentType)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 text-sm"
            >
              {Object.values(AppointmentType)
                  .filter(type => isTeleconsultaEnabled || type !== AppointmentType.Teleconsulta)
                  .map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Duração</label>
            <div className="flex gap-2">
              {[30, 45, 60].map(min => (
                <button
                  key={min}
                  onClick={() => setDuration(min)}
                  className={`px-4 py-2 rounded-md border transition text-sm ${
                    duration === min
                      ? 'bg-sky-500 text-white border-sky-500'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {min} min
                </button>
              ))}
            </div>
          </div>
          
          {!appointmentToEdit?.seriesId && <RecurrenceSelector recurrenceRule={recurrenceRule} onChange={setRecurrenceRule} />}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Templates de horários</label>
            <div className="flex gap-2">
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value || undefined)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 text-sm"
              >
                <option value="">Selecione um template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>{template.title}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={applyTemplate}
                className="px-3 py-2 bg-emerald-500 text-white rounded-md text-sm hover:bg-emerald-600"
              >
                Aplicar
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">Use templates para criar séries de horários recorrentes e otimizar encaixes.</p>
          </div>

          {availableBlocks.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-3 text-xs">
              <strong>Bloqueios próximos:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {availableBlocks.slice(0, 2).map(block => (
                  <li key={block.id}>{block.reason || 'Bloqueio'} em {format(block.startTime, "dd/MM HH:mm")}</li>
                ))}
                {availableBlocks.length > 2 && <li>+ {availableBlocks.length - 2} bloqueio(s)</li>}
              </ul>
            </div>
          )}


          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 text-sm"
              placeholder="Observações sobre o atendimento..."
            />
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 px-4 py-3 bg-slate-50 rounded-b-lg border-t">
          <button onClick={onClose} className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition text-sm">Cancelar</button>
          <button
            onClick={handleSaveClick}
            disabled={!selectedPatient || isSaving}
            className={`px-4 py-2 rounded-md transition flex items-center text-sm ${
              !selectedPatient || isSaving
                ? 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-200'
                : 'bg-sky-500 text-white hover:bg-sky-600'
            }`}
          >
            <Save className="w-4 h-4 mr-2"/>
            {isSaving ? 'Salvando...' : 'Confirmar Agendamento'}
          </button>
        </div>
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
