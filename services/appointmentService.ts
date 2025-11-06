import { Appointment, AppointmentStatus } from '../types';
import { eventService } from './eventService';
import { RecurrenceTemplate, ScheduleBlock, WaitlistStatus, WaitlistEntry, SchedulingAlert } from '../types';
import { secureLogger } from '../lib/secureLogger';
import { withSupabaseQuery, withSupabaseMutation } from '../lib/supabase/errorHandler';
import { prisma } from '../lib/prisma';

export const getAppointments = withSupabaseQuery(
    async (startDate?: Date, endDate?: Date): Promise<Appointment[]> => {
        const where: any = {};
        if (startDate) {
            where.startTime = { gte: startDate };
        }
        if (endDate) {
            where.endTime = { lte: endDate };
        }

        const appointments = await prisma.appointments.findMany({
            where,
            orderBy: {
                startTime: 'asc',
            },
        });
        return appointments as Appointment[];
    },
    {
        operation: 'getAppointments',
        fallbackMessage: 'Erro ao buscar agendamentos'
    }
);

export const getAppointmentById = withSupabaseQuery(
    async (id: string): Promise<Appointment | undefined> => {
        const appointment = await prisma.appointments.findUnique({
            where: { id },
        });
        return appointment as Appointment | undefined;
    },
    {
        operation: 'getAppointmentById',
        fallbackMessage: 'Erro ao buscar agendamento'
    }
);

export const getAppointmentsByPatientId = withSupabaseQuery(
    async (patientId: string): Promise<Appointment[]> => {
        const appointments = await prisma.appointments.findMany({
            where: { patientId },
            orderBy: {
                startTime: 'desc', // Most recent first
            },
        });
        return appointments as Appointment[];
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

        const dataForPrisma = {
            ...appointmentData,
            therapistId: therapistIdValido || null, // Prisma expects null for optional foreign keys
            startTime: new Date(appointmentData.startTime),
            endTime: new Date(appointmentData.endTime),
        };

        let savedAppointment: Appointment;

        if (appointmentData.id) {
            // Update existing appointment
            savedAppointment = await prisma.appointments.update({
                where: { id: appointmentData.id },
                data: dataForPrisma,
            });
        } else {
            // Create new appointment
            savedAppointment = await prisma.appointments.create({
                data: dataForPrisma,
            });
        }

        eventService.emit('appointments:changed');
        return savedAppointment;
    },
    {
        operation: 'saveAppointment',
        fallbackMessage: 'Erro ao salvar agendamento'
    }
);

export const deleteAppointment = withSupabaseMutation(
    async (id: string): Promise<void> => {
        await prisma.appointments.delete({
            where: { id },
        });
        eventService.emit('appointments:changed');
    },
    {
        operation: 'deleteAppointment',
        fallbackMessage: 'Erro ao excluir agendamento'
    }
);

export const deleteAppointmentSeries = async (seriesId: string, fromDate: Date): Promise<void> => {
    await prisma.appointments.deleteMany({
        where: {
            seriesId: seriesId,
            startTime: {
                gte: fromDate,
            },
        },
    });
    eventService.emit('appointments:changed');
};

export const listRecurrenceTemplates = async (): Promise<RecurrenceTemplate[]> => {
  const templates = await prisma.recurrenceTemplates.findMany();
  return templates as RecurrenceTemplate[];
};

export const listScheduleBlocks = async (): Promise<ScheduleBlock[]> => {
  const blocks = await prisma.scheduleBlocks.findMany();
  return blocks as ScheduleBlock[];
};

export const listWaitlistEntries = async (status: WaitlistStatus = 'waiting'): Promise<WaitlistEntry[]> => {
  const entries = await prisma.waitlist.findMany({
    where: { status },
  });
  return entries as WaitlistEntry[];
};

export const listActiveAlerts = async (): Promise<SchedulingAlert[]> => {
  const alerts = await prisma.schedulingAlerts.findMany({
    where: { resolved: false },
  });
  return alerts as SchedulingAlert[];
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
    await prisma.appointments.update({
      where: { id: appointmentId },
      data: { sessions_remaining: sessionsRemaining },
    });
    eventService.emit('appointments:changed');
  },
  {
    operation: 'updateSessionsRemaining',
    fallbackMessage: 'Erro ao atualizar sessões restantes'
  }
);