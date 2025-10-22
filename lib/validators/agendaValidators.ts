/**
 * lib/validators/agendaValidators.ts
 * 
 * Validadores para operações de agenda
 * Validações de frontend para agendamentos, lista de espera e bloqueios
 */

import { Appointment, WaitlistEntry, ScheduleBlock } from '../../types';
import { AppointmentStatus, AppointmentType } from '../../types';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Valida um agendamento
 */
export const validateAppointment = (appointment: Partial<Appointment>): ValidationResult => {
  const errors: Record<string, string> = {};

  // Validar paciente
  if (!appointment.patientId) {
    errors.patient = 'Selecione um paciente';
  }

  // Terapeuta é opcional - pode ser definido após o atendimento
  // Não validar como obrigatório

  // Validar tipo
  if (!appointment.type || !Object.values(AppointmentType).includes(appointment.type as AppointmentType)) {
    errors.type = 'Tipo de atendimento inválido';
  }

  // Validar horários
  if (!appointment.startTime) {
    errors.startTime = 'Horário de início é obrigatório';
  }

  if (!appointment.endTime) {
    errors.endTime = 'Horário de término é obrigatório';
  }

  if (appointment.startTime && appointment.endTime) {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);

    if (end <= start) {
      errors.time = 'Horário de término deve ser posterior ao início';
    }

    // Validar duração mínima (15 minutos)
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    if (durationMinutes < 15) {
      errors.duration = 'Duração mínima é de 15 minutos';
    }

    // Validar duração máxima (180 minutos)
    if (durationMinutes > 180) {
      errors.duration = 'Duração máxima é de 180 minutos';
    }

    // Validar se não está no passado (exceto para reagendamento)
    const now = new Date();
    if (start < now && !appointment.id) {
      errors.past = 'Não é possível agendar no passado';
    }
  }

  // Validar status
  if (appointment.status && !Object.values(AppointmentStatus).includes(appointment.status as AppointmentStatus)) {
    errors.status = 'Status inválido';
  }

  // Validar valor
  if (appointment.value !== undefined && appointment.value < 0) {
    errors.value = 'Valor não pode ser negativo';
  }

  // Validar pagamento
  if (appointment.paymentStatus && !['paid', 'pending'].includes(appointment.paymentStatus)) {
    errors.payment = 'Status de pagamento inválido';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valida uma entrada da lista de espera
 */
export const validateWaitlistEntry = (entry: Partial<WaitlistEntry>): ValidationResult => {
  const errors: Record<string, string> = {};

  // Validar paciente
  if (!entry.patientId) {
    errors.patient = 'Selecione um paciente';
  }

  // Validar urgência
  if (entry.urgency !== undefined) {
    if (entry.urgency < 1 || entry.urgency > 5) {
      errors.urgency = 'Urgência deve estar entre 1 e 5';
    }
  }

  // Validar risco de no-show
  if (entry.noShowRisk !== undefined) {
    if (entry.noShowRisk < 0 || entry.noShowRisk > 10) {
      errors.noShowRisk = 'Risco de no-show deve estar entre 0 e 10';
    }
  }

  // Validar datas
  if (entry.preferredStartFrom && entry.preferredStartTo) {
    const start = new Date(entry.preferredStartFrom);
    const end = new Date(entry.preferredStartTo);

    if (end < start) {
      errors.dates = 'Data final deve ser posterior à data inicial';
    }
  }

  // Validar dias preferidos
  if (entry.preferredDays && entry.preferredDays.length > 0) {
    const validDays = entry.preferredDays.every(day => day >= 0 && day <= 6);
    if (!validDays) {
      errors.days = 'Dias inválidos. Use valores de 0 (Dom) a 6 (Sáb)';
    }
  }

  // Validar horários preferidos
  if (entry.preferredTimeRanges && entry.preferredTimeRanges.length > 0) {
    for (const range of entry.preferredTimeRanges) {
      if (!range.start || !range.end) {
        errors.timeRanges = 'Todos os horários devem ter início e fim';
        break;
      }

      const [startHour, startMin] = range.start.split(':').map(Number);
      const [endHour, endMin] = range.end.split(':').map(Number);

      if (startHour < 0 || startHour > 23 || startMin < 0 || startMin > 59) {
        errors.timeRanges = 'Horário de início inválido';
        break;
      }

      if (endHour < 0 || endHour > 23 || endMin < 0 || endMin > 59) {
        errors.timeRanges = 'Horário de término inválido';
        break;
      }

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        errors.timeRanges = 'Horário de término deve ser posterior ao início';
        break;
      }
    }
  }

  // Validar status
  if (entry.status && !['waiting', 'notified', 'scheduled', 'cancelled'].includes(entry.status)) {
    errors.status = 'Status inválido';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valida um bloqueio de agenda
 */
export const validateScheduleBlock = (block: Partial<ScheduleBlock>): ValidationResult => {
  const errors: Record<string, string> = {};

  // Validar terapeuta
  if (!block.therapistId) {
    errors.therapist = 'Selecione um terapeuta';
  }

  // Validar horários
  if (!block.startTime) {
    errors.startTime = 'Horário de início é obrigatório';
  }

  if (!block.endTime) {
    errors.endTime = 'Horário de término é obrigatório';
  }

  if (block.startTime && block.endTime) {
    const start = new Date(block.startTime);
    const end = new Date(block.endTime);

    if (end <= start) {
      errors.time = 'Horário de término deve ser posterior ao início';
    }

    // Validar duração máxima (24 horas)
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (durationHours > 24) {
      errors.duration = 'Bloqueio não pode exceder 24 horas';
    }
  }

  // Validar tipo
  const validTypes = ['ferias', 'almoco', 'ausencia', 'feriado', 'treinamento', 'outro'];
  if (block.blockType && !validTypes.includes(block.blockType)) {
    errors.type = 'Tipo de bloqueio inválido';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valida se um horário está disponível
 */
export const validateTimeSlot = (
  startTime: Date,
  endTime: Date,
  existingAppointments: Appointment[],
  scheduleBlocks: ScheduleBlock[] = []
): ValidationResult => {
  const errors: Record<string, string> = {};

  // Verificar conflitos com agendamentos existentes
  const hasConflict = existingAppointments.some(app => {
    const appStart = new Date(app.startTime);
    const appEnd = new Date(app.endTime);

    // Verificar sobreposição
    return (startTime < appEnd && endTime > appStart);
  });

  if (hasConflict) {
    errors.conflict = 'Horário já está ocupado por outro agendamento';
  }

  // Verificar conflitos com bloqueios
  const hasBlockConflict = scheduleBlocks.some(block => {
    const blockStart = new Date(block.startTime);
    const blockEnd = new Date(block.endTime);

    return (startTime < blockEnd && endTime > blockStart);
  });

  if (hasBlockConflict) {
    errors.blockConflict = 'Horário está bloqueado';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sugere horários alternativos próximos
 */
export const suggestAlternativeTimes = (
  desiredTime: Date,
  durationMinutes: number,
  existingAppointments: Appointment[],
  scheduleBlocks: ScheduleBlock[] = [],
  maxSuggestions: number = 5
): Date[] => {
  const suggestions: Date[] = [];
  const durationMs = durationMinutes * 60 * 1000;

  // Tentar horários próximos (±30min, ±1h, ±2h, ±3h)
  const offsets = [-3 * 60 * 60 * 1000, -2 * 60 * 60 * 1000, -60 * 60 * 1000, -30 * 60 * 1000, 30 * 60 * 1000, 60 * 60 * 1000, 2 * 60 * 60 * 1000, 3 * 60 * 60 * 1000];

  for (const offset of offsets) {
    if (suggestions.length >= maxSuggestions) break;

    const suggestedStart = new Date(desiredTime.getTime() + offset);
    const suggestedEnd = new Date(suggestedStart.getTime() + durationMs);

    // Validar se o horário sugerido está disponível
    const validation = validateTimeSlot(suggestedStart, suggestedEnd, existingAppointments, scheduleBlocks);
    
    if (validation.valid) {
      suggestions.push(suggestedStart);
    }
  }

  return suggestions;
};

/**
 * Formata erros de validação para exibição
 */
export const formatValidationErrors = (errors: Record<string, string>): string => {
  const errorMessages = Object.values(errors);
  return errorMessages.join('. ');
};

