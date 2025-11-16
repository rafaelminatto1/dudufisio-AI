import { Appointment } from '../../types';

export type NormalizedAppointmentStatus =
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'unknown';

const STATUS_MAP: Record<string, NormalizedAppointmentStatus> = {
  scheduled: 'scheduled',
  agendado: 'scheduled',
  completed: 'completed',
  realizado: 'completed',
  cancelled: 'cancelled',
  canceled: 'cancelled',
  cancelado: 'cancelled',
  'no_show': 'no_show',
  faltou: 'no_show',
};

export function normalizeAppointmentStatus(status?: string | null): NormalizedAppointmentStatus {
  if (!status) return 'unknown';
  const key = status.toString().trim().toLowerCase();
  return STATUS_MAP[key] || 'unknown';
}

export function appointmentsOverlap(a: { startTime: Date; endTime: Date }, b: { startTime: Date; endTime: Date }): boolean {
  return a.startTime < b.endTime && a.endTime > b.startTime;
}

export function cloneAppointmentWithoutRecurrence(appointment: Appointment): Appointment {
  const cloned: Appointment = {
    ...appointment,
    startTime: new Date(appointment.startTime),
    endTime: new Date(appointment.endTime),
  };
  if (cloned.recurrenceRule && Object.keys(cloned.recurrenceRule).length === 0) {
    delete cloned.recurrenceRule;
  }
  return cloned;
}

export function addMinutes(base: Date, minutes: number): Date {
  return new Date(base.getTime() + minutes * 60 * 1000);
}

export function addDays(base: Date, days: number): Date {
  const clone = new Date(base);
  clone.setDate(clone.getDate() + days);
  return clone;
}

export function setTimeFromTemplate(target: Date, template: Date): Date {
  const clone = new Date(target);
  clone.setHours(template.getHours(), template.getMinutes(), template.getSeconds(), template.getMilliseconds());
  return clone;
}

export function startOfDay(date: Date): Date {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

export function startOfWeek(date: Date): Date {
  const clone = startOfDay(date);
  const diffToMonday = (clone.getDay() + 6) % 7;
  clone.setDate(clone.getDate() - diffToMonday);
  return clone;
}

export function slotToKey(details: { therapistId?: string; startTime: Date; endTime: Date }): string {
  const therapistKey = details.therapistId ?? 'all';
  return `${therapistKey}_${details.startTime.getTime()}_${details.endTime.getTime()}`;
}

