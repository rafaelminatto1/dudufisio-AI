import { RecurrenceRule, RecurrenceTemplate, Appointment, WaitlistEntry } from '../../types';
import { db } from '../mockDb';
import { generateRecurrences } from './recurrenceService';
import { cloneAppointmentWithoutRecurrence, startOfDay } from './schedulingUtils';
import { waitlistService } from './waitlistService';

export interface CreateTemplateInput {
  title: string;
  description?: string;
  therapistId?: string;
  durationMinutes: number;
  recurrenceRule: RecurrenceRule;
  timezone?: string;
  previewStartDate?: Date;
}

const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

export interface RecurrenceTemplatePreview {
  template: RecurrenceTemplate;
  appointments: Appointment[];
}

function buildTemplate(source: CreateTemplateInput, createdBy?: string): RecurrenceTemplate {
  const now = new Date();
  return {
    id: `template_${now.getTime()}`,
    clinicId: undefined,
    therapistId: source.therapistId,
    title: source.title,
    description: source.description,
    durationMinutes: source.durationMinutes,
    recurrenceRule: source.recurrenceRule,
    timezone: source.timezone || DEFAULT_TIMEZONE,
    isActive: true,
    createdBy,
    createdAt: now,
    updatedAt: now,
  };
}

function generatePreview(template: RecurrenceTemplate, baseAppointment: Appointment): Appointment[] {
  const appointment = cloneAppointmentWithoutRecurrence({
    ...baseAppointment,
    recurrenceRule: template.recurrenceRule,
    recurrenceTemplateId: template.id,
    seriesId: template.id,
  });
  appointment.endTime = new Date(appointment.startTime.getTime() + template.durationMinutes * 60 * 1000);
  return generateRecurrences(appointment);
}

export const recurrenceTemplateService = {
  async listTemplates(): Promise<RecurrenceTemplate[]> {
    return db.getRecurrenceTemplates?.() || [];
  },

  async createTemplate(input: CreateTemplateInput, baseAppointment: Appointment, createdBy?: string): Promise<RecurrenceTemplatePreview> {
    const template = buildTemplate(input, createdBy);
    const appointments = generatePreview(template, baseAppointment);
    db.saveRecurrenceTemplate?.(template);
    return { template, appointments };
  },

  async updateTemplate(templateId: string, updates: Partial<CreateTemplateInput>): Promise<RecurrenceTemplate | null> {
    const existing = db.getRecurrenceTemplateById?.(templateId);
    if (!existing) return null;
    const updated: RecurrenceTemplate = {
      ...existing,
      ...updates,
      recurrenceRule: updates.recurrenceRule || existing.recurrenceRule,
      durationMinutes: updates.durationMinutes ?? existing.durationMinutes,
      updatedAt: new Date(),
    };
    db.saveRecurrenceTemplate?.(updated);
    return updated;
  },

  async deactivateTemplate(templateId: string): Promise<void> {
    const existing = db.getRecurrenceTemplateById?.(templateId);
    if (!existing) return;
    const updated = { ...existing, isActive: false, updatedAt: new Date() };
    db.saveRecurrenceTemplate?.(updated);
  },

  async applyTemplate(
    templateId: string,
    startDate: Date,
    overrides?: Partial<Appointment>,
    existingAppointments: Appointment[] = []
  ): Promise<{ appointments: Appointment[]; waitlistMatch?: WaitlistEntry }> {
    const template = db.getRecurrenceTemplateById?.(templateId);
    if (!template) throw new Error('Template não encontrado');

    const baseAppointment: Appointment = {
      id: `app_template_${Date.now()}`,
      patientId: overrides?.patientId || '',
      patientName: overrides?.patientName || 'Paciente',
      patientAvatarUrl: overrides?.patientAvatarUrl || '',
      therapistId: overrides?.therapistId || template.therapistId || '',
      startTime: startOfDay(startDate),
      endTime: new Date(startDate.getTime() + template.durationMinutes * 60 * 1000),
      title: overrides?.title || template.title,
      type: overrides?.type || overrides?.type || (overrides?.type || overrides?.type as any),
      status: overrides?.status || 'scheduled' as any,
      value: overrides?.value || 0,
      paymentStatus: overrides?.paymentStatus || 'pending',
      observations: overrides?.observations,
      seriesId: template.id,
      recurrenceRule: template.recurrenceRule,
      sessionNumber: overrides?.sessionNumber,
      totalSessions: overrides?.totalSessions,
      recurrenceTemplateId: template.id,
      metadata: { ...template, ...overrides?.metadata },
    };

    const appointments = generatePreview(template, baseAppointment);
    appointments.forEach(app => db.saveAppointment(app));

    const waitlistMatch = await waitlistService.onSlotAvailable(appointments[0], existingAppointments);

    return {
      appointments,
      waitlistMatch: waitlistMatch?.entry,
    };
  },
};

