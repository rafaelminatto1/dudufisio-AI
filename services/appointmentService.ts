import { Appointment } from '../types';
import { db } from './mockDb';
import { eventService } from './eventService';
import { mockPatients } from '../data/mockData';
import { RecurrenceTemplate, ScheduleBlock, WaitlistStatus, WaitlistEntry, SchedulingAlert } from '../types';
import { supabaseAppointmentService } from './supabase/appointmentServiceSupabase';
import { supabase } from '../lib/supabaseClient';
import { secureLogger } from '../lib/secureLogger';
import { withSupabaseQuery, withSupabaseMutation } from '../lib/supabase/errorHandler';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Verificar se Supabase está disponível e configurado
const isSupabaseEnabled = () => {
    const enabled = supabase !== null && supabase !== undefined;
    secureLogger.debug('isSupabaseEnabled check', { component: 'appointmentService', enabled });
    if (enabled) {
        secureLogger.info('Supabase está configurado e disponível', { component: 'appointmentService' });
    } else {
        secureLogger.warn('Supabase NÃO disponível, usando mock', { component: 'appointmentService' });
    }
    return enabled;
};

export const getAppointments = withSupabaseQuery(
    async (startDate?: Date, endDate?: Date): Promise<Appointment[]> => {
        // Usar Supabase se estiver disponível
        if (isSupabaseEnabled()) {
            if (startDate && endDate) {
                const appointments = await supabaseAppointmentService.getAppointmentsByDateRange(
                    startDate,
                    endDate
                );
                return appointments;
            } else {
                const appointments = await supabaseAppointmentService.getAllAppointments();
                return appointments;
            }
        }

        // Usar mock database (desenvolvimento local ou fallback)
        await delay(500);
        const appointments = db.getAppointments();

        if (startDate && endDate) {
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            
            const filteredAppointments = [...appointments].filter(app => {
                const appTime = app.startTime.getTime();
                return appTime >= startDate.getTime() && appTime <= endOfDay.getTime();
            });
            return filteredAppointments;
        }

        return [...appointments];
    },
    {
        operation: 'getAppointments',
        fallbackMessage: 'Erro ao buscar agendamentos'
    }
);

export const getAppointmentById = withSupabaseQuery(
    async (id: string): Promise<Appointment | undefined> => {
        // Usar Supabase se estiver disponível
        if (isSupabaseEnabled()) {
            const appointment = await supabaseAppointmentService.getAppointmentById(id);
            return appointment;
        }

        // Usar mock database (desenvolvimento local ou fallback)
        await delay(300);
        const appointments = db.getAppointments();
        const appointment = appointments.find(appointment => appointment.id === id);
        return appointment;
    },
    {
        operation: 'getAppointmentById',
        fallbackMessage: 'Erro ao buscar agendamento'
    }
);

export const getAppointmentsByPatientId = withSupabaseQuery(
    async (patientId: string): Promise<Appointment[]> => {
        // Usar Supabase se estiver disponível
        if (isSupabaseEnabled()) {
            const appointments = await supabaseAppointmentService.getAppointmentsByPatientId(patientId);
            return appointments;
        }

        // Usar mock database (desenvolvimento local ou fallback)
        await delay(300);
        return db.getAppointments().filter(a => a.patientId === patientId)
          .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    },
    {
        operation: 'getAppointmentsByPatientId',
        fallbackMessage: 'Erro ao buscar agendamentos do paciente'
    }
);

export const saveAppointment = withSupabaseMutation(
    async (appointmentData: Appointment): Promise<Appointment> => {
        const patient = mockPatients.find(p => p.id === appointmentData.patientId);
        const fullAppointmentData = {
            ...appointmentData,
            patientAvatarUrl: patient?.avatarUrl || ''
        };

        // Usar Supabase se estiver disponível
        if (isSupabaseEnabled()) {
            // Validar se therapistId é um UUID válido ou está vazio
            // IDs de mock começam com "therapist_" - não são UUIDs válidos
            const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

            // Se therapistId não é um UUID válido, converter para undefined
            let therapistIdValido = fullAppointmentData.therapistId;
            if (therapistIdValido && !isValidUUID.test(therapistIdValido)) {
                secureLogger.warn('TherapistId inválido detectado, será convertido para undefined', {
                    component: 'appointmentService',
                    invalidId: therapistIdValido
                });
                therapistIdValido = undefined;
            }

            // Se therapistId é inválido mas está vazio/null, converter para undefined
            const dataParaSupabase = {
                ...fullAppointmentData,
                therapistId: therapistIdValido || undefined
            };
            
            // Se o agendamento tem ID que começa com "app_", é um novo agendamento (ID gerado localmente)
            // O Supabase vai gerar um ID próprio (UUID)
            if (fullAppointmentData.id && fullAppointmentData.id.startsWith('app_')) {
                const created = await supabaseAppointmentService.createAppointment(dataParaSupabase);
                eventService.emit('appointments:changed');
                return created;
            } else if (fullAppointmentData.id) {
                const updated = await supabaseAppointmentService.updateAppointment(
                    fullAppointmentData.id,
                    dataParaSupabase
                );
                eventService.emit('appointments:changed');
                return updated;
            } else {
                const created = await supabaseAppointmentService.createAppointment(dataParaSupabase);
                eventService.emit('appointments:changed');
                return created;
            }
        }

        // Usar mock database (desenvolvimento local ou fallback)
        await delay(400);
        db.saveAppointment(fullAppointmentData);
        eventService.emit('appointments:changed');
        return fullAppointmentData;
    },
    {
        operation: 'saveAppointment',
        fallbackMessage: 'Erro ao salvar agendamento'
    }
);

export const deleteAppointment = withSupabaseMutation(
    async (id: string): Promise<void> => {
        // Usar Supabase se estiver disponível
        if (isSupabaseEnabled()) {
            await supabaseAppointmentService.deleteAppointment(id);
            eventService.emit('appointments:changed');
            return;
        }

        // Usar mock database (desenvolvimento local ou fallback)
        await delay(400);
        db.deleteAppointment(id);
        eventService.emit('appointments:changed');
    },
    {
        operation: 'deleteAppointment',
        fallbackMessage: 'Erro ao excluir agendamento'
    }
);

export const deleteAppointmentSeries = async (seriesId: string, fromDate: Date): Promise<void> => {
    // Usar Supabase se estiver disponível
    if (isSupabaseEnabled()) {
        try {
            secureLogger.info('Deleting appointment series from Supabase', {
                component: 'appointmentService',
                action: 'deleteAppointmentSeries'
            });
            // TODO: Implementar deleteAppointmentSeries no supabaseAppointmentService
            // Por enquanto, usando mock
            secureLogger.warn('deleteAppointmentSeries not yet implemented in Supabase', {
                component: 'appointmentService',
                action: 'deleteAppointmentSeries'
            });
        } catch (error) {
            secureLogger.error('Failed to delete appointment series from Supabase', error, {
                component: 'appointmentService',
                action: 'deleteAppointmentSeries'
            });
        }
    }

    // Usar mock database
    await delay(400);
    secureLogger.info('Deleting appointment series from mock', {
        component: 'appointmentService',
        action: 'deleteAppointmentSeries'
    });
    db.deleteAppointmentSeries(seriesId, fromDate);
    eventService.emit('appointments:changed');
}

export const listRecurrenceTemplates = async (): Promise<RecurrenceTemplate[]> => {
  await delay(200);
  return db.getRecurrenceTemplates();
};

export const listScheduleBlocks = async (): Promise<ScheduleBlock[]> => {
  await delay(200);
  return db.getScheduleBlocks();
};

export const listWaitlistEntries = async (status: WaitlistStatus = 'waiting'): Promise<WaitlistEntry[]> => {
  await delay(200);
  return db.getWaitlistEntries().filter(entry => entry.status === status);
};

export const listActiveAlerts = async (): Promise<SchedulingAlert[]> => {
  await delay(100);
  return db.getSchedulingAlerts().filter(alert => !alert.resolved);
};

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
      const isCompleted = apt.status === 'completed';
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
    if (isSupabaseEnabled()) {
      // Atualizar no Supabase
      const { error } = await supabase!
        .from('appointments')
        .update({ sessions_remaining: sessionsRemaining })
        .eq('id', appointmentId);
      
      if (error) {
        throw error;
      }
    } else {
      // Atualizar no mock
      const appointment = db.getAppointments().find(a => a.id === appointmentId);
      if (appointment) {
        appointment.sessions_remaining = sessionsRemaining;
        eventService.emit('appointments:changed');
      }
    }
  },
  {
    operation: 'updateSessionsRemaining',
    fallbackMessage: 'Erro ao atualizar sessões restantes'
  }
);