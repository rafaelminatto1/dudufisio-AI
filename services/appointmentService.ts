import { Appointment, AppointmentStatus } from '../types';
import { eventService } from './eventService';
import { RecurrenceTemplate, ScheduleBlock, WaitlistStatus, WaitlistEntry, SchedulingAlert } from '../types';
import { secureLogger } from '../lib/secureLogger';
import { withSupabaseQuery, withSupabaseMutation } from '../lib/supabase/errorHandler';
import { appointmentRepository } from './repositories/AppointmentRepository';
import { supabase } from '../lib/supabaseClient';

/**
 * Helper: Converte string ISO ou null para Date ou undefined
 */
function toDateOrUndefined(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  return new Date(value);
}

/**
 * Helper: Converte Date para ISO string, ou mantém string, ou retorna undefined
 */
function toISOStringOrUndefined(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return value;
}

/**
 * Converte AppointmentRow do Supabase para tipo Appointment
 * 
 * IMPORTANTE: Mapeia APENAS os campos que existem na tabela appointments.
 * Campos derivados (ex: patient_name, therapist_name) devem vir de JOINs específicos.
 */
function rowToAppointment(row: any): Appointment {
  return {
    // IDs
    id: row.id,
    patientId: row.patient_id,
    patient_id: row.patient_id,
    therapistId: row.therapist_id,
    therapist_id: row.therapist_id,
    
    // Campos derivados (podem ser undefined se não vier de JOIN)
    patientName: row.patient_name || row.full_name || '',
    patientAvatarUrl: row.patient_avatar_url || row.avatar_url || '',
    patientPhone: row.patient_phone || row.phone,
    therapistName: row.therapist_name,
    
    // Datas principais
    startTime: new Date(row.start_time),
    endTime: new Date(row.end_time),
    start_time: row.start_time,
    end_time: row.end_time,
    
    // Campos básicos da tabela
    status: row.status || 'scheduled',
    type: row.type || 'regular',
    title: row.title || '',
    description: row.description,
    notes: row.notes,
    location: row.location,
    
    // Campos da tabela - Virtual/Meeting
    is_virtual: row.is_virtual,
    meeting_url: row.meeting_url,
    meeting_id: row.meeting_id,
    
    // Campos da tabela - Recorrência
    isRecurring: row.is_recurring,
    is_recurring: row.is_recurring,
    recurrenceRule: row.recurrence_rule,
    recurrence_rule: row.recurrence_rule,
    parent_appointment_id: row.parent_appointment_id,
    
    // Campos da tabela - Pagamento
    price: row.price,
    paid: row.paid,
    payment_id: row.payment_id,
    value: row.price || 0,
    paymentStatus: row.paid ? 'paid' : 'pending',
    
    // Campos da tabela - Cancelamento
    cancelledAt: toDateOrUndefined(row.cancelled_at),
    cancelled_at: row.cancelled_at,
    cancelled_by: row.cancelled_by,
    cancellationReason: row.cancellation_reason,

    // Campos da tabela - Confirmação & WhatsApp
    confirmed: Boolean(row.confirmed),
    confirmedAt: toDateOrUndefined(row.confirmed_at),
    confirmed_at: row.confirmed_at,
    whatsappConversationId: row.whatsapp_conversation_id,
    whatsapp_conversation_id: row.whatsapp_conversation_id,
    reminderSent7d: toDateOrUndefined(row.reminder_sent_7d),
    reminderSent24h: toDateOrUndefined(row.reminder_sent_24h),
    reminderSent2h: toDateOrUndefined(row.reminder_sent_2h),
    reminder_sent_7d: row.reminder_sent_7d,
    reminder_sent_24h: row.reminder_sent_24h,
    reminder_sent_2h: row.reminder_sent_2h,
 
    // Campos da tabela - Check-in/out
    checkedInAt: toDateOrUndefined(row.checked_in_at),
    checked_in_at: row.checked_in_at,
    checked_out_at: row.checked_out_at,
    
    // Campos da tabela - Lembretes
    reminderSent: row.reminder_sent,
    reminderSentAt: toDateOrUndefined(row.reminder_sent_at),
    reminder_sent_at: row.reminder_sent_at,
    
    // Campos da tabela - Duração
    duration: row.duration,
    
    // Campos da tabela - Metadata
    created_by: row.created_by,
    created_at: row.created_at,
    createdAt: row.created_at,
    updated_by: row.updated_by,
    updated_at: row.updated_at,
    updatedAt: row.updated_at,
    deleted_at: row.deleted_at,
    
    // Campos adicionais que podem existir (ex: de JOINs ou extensões futuras)
    color: row.color,
    patient_notes: row.patient_notes,
    
    // Campos opcionais que podem não existir
    seriesId: row.series_id,
    series_id: row.series_id,
    sessions_total: row.sessions_total,
    sessions_remaining: row.sessions_remaining,
    session_number: row.session_number,
    sessionNumber: row.session_number,
    
    // Campos de confirmação (se existirem)
    confirmed: row.confirmed,
    confirmationSentAt: toDateOrUndefined(row.confirmation_sent_at),
    completedAt: toDateOrUndefined(row.completed_at),
    completed_at: row.completed_at,
    recurrenceEndDate: toDateOrUndefined(row.recurrence_end_date),
    recurrenceExceptions: row.recurrence_exceptions,
  } as Appointment;
}

/**
 * Converte Appointment para formato do Supabase
 * 
 * IMPORTANTE: Inclui APENAS campos que existem na tabela appointments.
 * Remove campos derivados/calculados.
 */
function appointmentToRow(appointment: Appointment): any {
  const row: any = {
    id: appointment.id,
    
    // IDs
    patient_id: appointment.patientId || appointment.patient_id,
    therapist_id: appointment.therapistId || appointment.therapist_id,
    
    // Datas
    start_time: appointment.startTime instanceof Date ? appointment.startTime.toISOString() : appointment.startTime,
    end_time: appointment.endTime instanceof Date ? appointment.endTime.toISOString() : appointment.endTime,
    
    // Campos básicos
    status: appointment.status,
    type: appointment.type,
    title: appointment.title,
    description: appointment.description,
    notes: appointment.notes,
    duration: appointment.duration,
    
    // Virtual/Meeting
    is_virtual: appointment.is_virtual,
    meeting_url: appointment.meeting_url,
    meeting_id: appointment.meeting_id,
    
    // Recorrência
    is_recurring: appointment.isRecurring || appointment.is_recurring,
    recurrence_rule: appointment.recurrenceRule || appointment.recurrence_rule,
    parent_appointment_id: appointment.parent_appointment_id,
    
    // Pagamento
    price: appointment.price || appointment.value,
    paid: appointment.paid,
    payment_id: appointment.payment_id,
    
    // Cancelamento
    cancelled_at: toISOStringOrUndefined(appointment.cancelledAt || appointment.cancelled_at),
    cancelled_by: appointment.cancelled_by,
    cancellation_reason: appointment.cancellationReason,
    
    // Check-in/out
    checked_in_at: toISOStringOrUndefined(appointment.checkedInAt || appointment.checked_in_at),
    checked_out_at: appointment.checked_out_at,
    
    // Lembretes
    reminder_sent: appointment.reminderSent,
    reminder_sent_at: toISOStringOrUndefined(appointment.reminderSentAt || appointment.reminder_sent_at),
    reminder_sent_7d: toISOStringOrUndefined(appointment.reminderSent7d || appointment.reminder_sent_7d),
    reminder_sent_24h: toISOStringOrUndefined(appointment.reminderSent24h || appointment.reminder_sent_24h),
    reminder_sent_2h: toISOStringOrUndefined(appointment.reminderSent2h || appointment.reminder_sent_2h),
    confirmed: appointment.confirmed,
    confirmed_at: toISOStringOrUndefined(appointment.confirmedAt || appointment.confirmed_at),
    whatsapp_conversation_id:
      appointment.whatsappConversationId ?? appointment.whatsapp_conversation_id,
 
    // Metadata
    created_by: appointment.created_by,
    updated_by: appointment.updated_by,
    
    // Patient notes
    patient_notes: appointment.patient_notes,
  };
  
  // Remove campos undefined
  Object.keys(row).forEach(key => {
    if (row[key] === undefined) {
      delete row[key];
    }
  });
  
  return row;
}

export const getAppointments = withSupabaseQuery(
    async (startDate?: Date, endDate?: Date): Promise<Appointment[]> => {
        const filters: any = {};
        
        if (startDate) {
            filters.startDate = startDate.toISOString();
        }
        if (endDate) {
            filters.endDate = endDate.toISOString();
        }

        const rows = await appointmentRepository.findMany(filters, {
            sort: { field: 'start_time', ascending: true }
        });
        
        return rows.map(rowToAppointment);
    },
    {
        operation: 'getAppointments',
        fallbackMessage: 'Erro ao buscar agendamentos'
    }
);

export const getAppointmentById = withSupabaseQuery(
    async (id: string): Promise<Appointment | undefined> => {
        const row = await appointmentRepository.findById(id);
        return row ? rowToAppointment(row) : undefined;
    },
    {
        operation: 'getAppointmentById',
        fallbackMessage: 'Erro ao buscar agendamento'
    }
);

export const getAppointmentsByPatientId = withSupabaseQuery(
    async (patientId: string): Promise<Appointment[]> => {
        const rows = await appointmentRepository.findByPatientId(patientId, {
            sort: { field: 'start_time', ascending: false }
        });
        return rows.map(rowToAppointment);
    },
    {
        operation: 'getAppointmentsByPatientId',
        fallbackMessage: 'Erro ao buscar agendamentos do paciente'
    }
);

export const saveAppointment = withSupabaseMutation(
    async (appointmentData: Appointment): Promise<Appointment> => {
        // Validate therapistId if it's not a valid UUID, set to undefined
        let therapistIdValido = appointmentData.therapistId;
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (therapistIdValido && !isValidUUID.test(therapistIdValido)) {
            secureLogger.warn('TherapistId inválido detectado, será convertido para undefined', {
                component: 'appointmentService',
                invalidId: therapistIdValido
            });
            therapistIdValido = undefined;
        }

        // Converte appointment para formato Supabase
        const dataForSupabase = appointmentToRow(appointmentData);
        
        // Sobrescreve therapist_id com o valor validado
        dataForSupabase.therapist_id = therapistIdValido || null;

        let savedRow: any;

        if (appointmentData.id) {
            // Update existing appointment
            const { id, ...updateData } = dataForSupabase;
            savedRow = await appointmentRepository.update(appointmentData.id, updateData);
        } else {
            // Create new appointment
            const { id, ...createData } = dataForSupabase;
            savedRow = await appointmentRepository.create(createData);
        }

        eventService.emit('appointments:changed');
        return rowToAppointment(savedRow);
    },
    {
        operation: 'saveAppointment',
        fallbackMessage: 'Erro ao salvar agendamento'
    }
);

export const deleteAppointment = withSupabaseMutation(
    async (id: string): Promise<void> => {
        await appointmentRepository.delete(id);
        eventService.emit('appointments:changed');
    },
    {
        operation: 'deleteAppointment',
        fallbackMessage: 'Erro ao excluir agendamento'
    }
);

export const deleteAppointmentSeries = withSupabaseMutation(
    async (seriesId: string, fromDate: Date): Promise<void> => {
        const { data, error } = await supabase
            .from('appointments')
            .delete()
            .eq('series_id', seriesId)
            .gte('start_time', fromDate.toISOString());

        if (error) {
            throw error;
        }

        eventService.emit('appointments:changed');
    },
    {
        operation: 'deleteAppointmentSeries',
        fallbackMessage: 'Erro ao excluir série de agendamentos'
    }
);

export const listRecurrenceTemplates = withSupabaseQuery(
    async (): Promise<RecurrenceTemplate[]> => {
        const { data, error } = await supabase
            .from('recurrence_templates')
            .select('*');
        
        if (error) throw error;
        return data as RecurrenceTemplate[];
    },
    {
        operation: 'listRecurrenceTemplates',
        fallbackMessage: 'Erro ao listar templates de recorrência'
    }
);

export const listScheduleBlocks = withSupabaseQuery(
    async (): Promise<ScheduleBlock[]> => {
        const { data, error } = await supabase
            .from('schedule_blocks')
            .select('*');
        
        if (error) throw error;
        return data as ScheduleBlock[];
    },
    {
        operation: 'listScheduleBlocks',
        fallbackMessage: 'Erro ao listar blocos de agenda'
    }
);

export const listWaitlistEntries = withSupabaseQuery(
    async (status: WaitlistStatus = 'waiting'): Promise<WaitlistEntry[]> => {
        const { data, error } = await supabase
            .from('waitlist')
            .select('*')
            .eq('status', status);
        
        if (error) throw error;
        return data as WaitlistEntry[];
    },
    {
        operation: 'listWaitlistEntries',
        fallbackMessage: 'Erro ao listar entradas da fila de espera'
    }
);

export const listActiveAlerts = withSupabaseQuery(
    async (): Promise<SchedulingAlert[]> => {
        const { data, error} = await supabase
            .from('scheduling_alerts')
            .select('*')
            .eq('resolved', false);
        
        if (error) throw error;
        return data as SchedulingAlert[];
    },
    {
        operation: 'listActiveAlerts',
        fallbackMessage: 'Erro ao listar alertas ativos'
    }
);

/**
 * Calcula o número de sessões restantes para um paciente
 * Prioriza o valor manual (sessions_remaining) se existir,
 * caso contrário, calcula automaticamente baseado em sessions_total
 */
export const calculateSessionsRemaining = async (
  patientId: string,
  appointmentType?: string
): Promise<number | undefined> => {
  try {
    // Buscar todos os agendamentos do paciente
    const appointments = await getAppointmentsByPatientId(patientId);
    
    if (!appointments || appointments.length === 0) {
      return undefined;
    }

    // Se houver valor manual em algum agendamento, usar o mais recente
    const appointmentsWithManualSessions = appointments
      .filter(apt => apt.sessions_remaining !== undefined && apt.sessions_remaining !== null)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    
    if (appointmentsWithManualSessions.length > 0) {
      return appointmentsWithManualSessions[0].sessions_remaining;
    }

    // Calcular automaticamente baseado em sessions_total
    const appointmentsWithTotal = appointments
      .filter(apt => apt.sessions_total !== undefined && apt.sessions_total !== null);
    
    if (appointmentsWithTotal.length === 0) {
      return undefined;
    }

    // Pegar o sessions_total mais recente
    const latestWithTotal = appointmentsWithTotal
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];
    
    const totalSessions = latestWithTotal.sessions_total || 0;

    // Contar sessões realizadas (completed) do mesmo tipo
    const completedSessions = appointments.filter(apt => {
      const isCompleted = apt.status === AppointmentStatus.Completed;
      const isSameType = appointmentType ? apt.type === appointmentType : true;
      return isCompleted && isSameType;
    }).length;

    const remaining = Math.max(totalSessions - completedSessions, 0);
    return remaining;
  } catch (error) {
    secureLogger.error('Erro ao calcular sessões restantes', error, {
      component: 'appointmentService',
      action: 'calculateSessionsRemaining',
      patientId
    });
    return undefined;
  }
};

/**
 * Atualiza o número de sessões restantes em um agendamento específico
 */
export const updateSessionsRemaining = withSupabaseMutation(
  async (appointmentId: string, sessionsRemaining: number): Promise<void> => {
    await appointmentRepository.update(appointmentId, { 
      sessions_remaining: sessionsRemaining 
    });
    eventService.emit('appointments:changed');
  },
  {
    operation: 'updateSessionsRemaining',
    fallbackMessage: 'Erro ao atualizar sessões restantes'
  }
);
