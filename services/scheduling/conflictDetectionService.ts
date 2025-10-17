import { Appointment, EnrichedAppointment } from '../../types';

export interface Conflict {
  type: 'same_patient' | 'same_therapist' | 'min_interval' | 'workload_exceeded';
  severity: 'warning' | 'error';
  message: string;
  conflictingAppointments: Appointment[];
}

export interface ConflictCheckResult {
  hasConflicts: boolean;
  conflicts: Conflict[];
}

/**
 * Serviço de detecção de conflitos em agendamentos
 */
export const conflictDetectionService = {
  /**
   * Verifica se um agendamento tem conflitos com outros agendamentos existentes
   */
  async checkConflicts(
    appointment: Appointment,
    allAppointments: EnrichedAppointment[]
  ): Promise<ConflictCheckResult> {
    const conflicts: Conflict[] = [];

    // Filtrar apenas agendamentos ativos (não cancelados)
    const activeAppointments = allAppointments.filter(
      a => a.id !== appointment.id && a.status !== 'canceled'
    );

    // 1. Verificar mesmo paciente em horário sobreposto
    const samePatientConflicts = this.checkSamePatientConflicts(appointment, activeAppointments);
    if (samePatientConflicts) {
      conflicts.push(samePatientConflicts);
    }

    // 2. Verificar mesmo terapeuta com múltiplos agendamentos simultâneos
    const sameTherapistConflicts = this.checkSameTherapistConflicts(appointment, activeAppointments);
    if (sameTherapistConflicts) {
      conflicts.push(sameTherapistConflicts);
    }

    // 3. Verificar intervalo mínimo entre sessões do mesmo paciente
    const minIntervalConflicts = this.checkMinIntervalConflicts(appointment, activeAppointments);
    if (minIntervalConflicts) {
      conflicts.push(minIntervalConflicts);
    }

    // 4. Verificar carga horária do terapeuta
    const workloadConflicts = this.checkWorkloadConflicts(appointment, activeAppointments);
    if (workloadConflicts) {
      conflicts.push(workloadConflicts);
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts
    };
  },

  /**
   * Verifica se o mesmo paciente tem outro agendamento no mesmo horário
   */
  checkSamePatientConflicts(
    appointment: Appointment,
    allAppointments: EnrichedAppointment[]
  ): Conflict | null {
    const conflicts = allAppointments.filter(a => 
      a.patientId === appointment.patientId &&
      a.startTime < appointment.endTime &&
      a.endTime > appointment.startTime
    );

    if (conflicts.length === 0) return null;

    return {
      type: 'same_patient',
      severity: 'error',
      message: `Paciente já possui ${conflicts.length} agendamento(s) neste horário`,
      conflictingAppointments: conflicts
    };
  },

  /**
   * Verifica se o terapeuta tem múltiplos agendamentos no mesmo horário
   * (permitido mas com aviso)
   */
  checkSameTherapistConflicts(
    appointment: Appointment,
    allAppointments: EnrichedAppointment[]
  ): Conflict | null {
    const conflicts = allAppointments.filter(a => 
      a.therapistId === appointment.therapistId &&
      a.startTime < appointment.endTime &&
      a.endTime > appointment.startTime
    );

    if (conflicts.length === 0) return null;

    return {
      type: 'same_therapist',
      severity: 'warning',
      message: `Terapeuta tem ${conflicts.length} outro(s) agendamento(s) simultâneo(s)`,
      conflictingAppointments: conflicts
    };
  },

  /**
   * Verifica se o intervalo mínimo entre sessões do mesmo paciente está sendo respeitado
   * (mínimo de 24 horas entre sessões)
   */
  checkMinIntervalConflicts(
    appointment: Appointment,
    allAppointments: EnrichedAppointment[]
  ): Conflict | null {
    const MIN_INTERVAL_HOURS = 24;
    const minIntervalMs = MIN_INTERVAL_HOURS * 60 * 60 * 1000;

    const conflicts = allAppointments.filter(a => {
      if (a.patientId !== appointment.patientId) return false;
      
      const timeDiff = Math.abs(a.startTime.getTime() - appointment.startTime.getTime());
      return timeDiff < minIntervalMs && a.startTime.getTime() !== appointment.startTime.getTime();
    });

    if (conflicts.length === 0) return null;

    return {
      type: 'min_interval',
      severity: 'warning',
      message: `Paciente tem sessão agendada com menos de ${MIN_INTERVAL_HOURS}h de intervalo`,
      conflictingAppointments: conflicts
    };
  },

  /**
   * Verifica se o terapeuta está excedendo a carga horária diária/semanal
   */
  checkWorkloadConflicts(
    appointment: Appointment,
    allAppointments: EnrichedAppointment[]
  ): Conflict | null {
    const MAX_DAILY_HOURS = 8;
    const MAX_WEEKLY_HOURS = 40;

    // Calcular horas do dia
    const appointmentDate = new Date(appointment.startTime);
    appointmentDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(appointmentDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const sameDayAppointments = allAppointments.filter(a => 
      a.therapistId === appointment.therapistId &&
      a.startTime >= appointmentDate &&
      a.startTime < nextDay
    );

    const totalMinutesSameDay = sameDayAppointments.reduce((total, a) => {
      const duration = (a.endTime.getTime() - a.startTime.getTime()) / (1000 * 60);
      return total + duration;
    }, 0);

    const totalHoursSameDay = totalMinutesSameDay / 60;

    if (totalHoursSameDay >= MAX_DAILY_HOURS) {
      return {
        type: 'workload_exceeded',
        severity: 'warning',
        message: `Terapeuta atingirá ${totalHoursSameDay.toFixed(1)}h no dia (máximo: ${MAX_DAILY_HOURS}h)`,
        conflictingAppointments: sameDayAppointments
      };
    }

    // Calcular horas da semana
    const weekStart = new Date(appointmentDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const sameWeekAppointments = allAppointments.filter(a => 
      a.therapistId === appointment.therapistId &&
      a.startTime >= weekStart &&
      a.startTime < weekEnd
    );

    const totalMinutesSameWeek = sameWeekAppointments.reduce((total, a) => {
      const duration = (a.endTime.getTime() - a.startTime.getTime()) / (1000 * 60);
      return total + duration;
    }, 0);

    const totalHoursSameWeek = totalMinutesSameWeek / 60;

    if (totalHoursSameWeek >= MAX_WEEKLY_HOURS) {
      return {
        type: 'workload_exceeded',
        severity: 'warning',
        message: `Terapeuta atingirá ${totalHoursSameWeek.toFixed(1)}h na semana (máximo: ${MAX_WEEKLY_HOURS}h)`,
        conflictingAppointments: sameWeekAppointments
      };
    }

    return null;
  },

  /**
   * Marca um agendamento como tendo conflitos
   */
  markAppointmentWithConflicts(appointment: Appointment, conflicts: Conflict[]): Appointment {
    return {
      ...appointment,
      hasConflict: conflicts.length > 0,
      conflictReason: conflicts.map(c => c.message).join('; ')
    };
  }
};

