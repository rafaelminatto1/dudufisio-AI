import { z } from 'zod';
import { AppointmentType } from '../../types';

export const appointmentFormSchema = z.object({
  patient: z.object({
    id: z.string().min(1, 'Paciente é obrigatório'),
    name: z.string().min(1, 'Nome do paciente é obrigatório'),
  }).nullable().refine(val => val !== null, {
    message: 'Por favor, selecione um paciente'
  }),
  therapistId: z.string().optional(),
  appointmentType: z.nativeEnum(AppointmentType, {
    errorMap: () => ({ message: 'Tipo de atendimento inválido' })
  }),
  duration: z.number().min(15, 'Duração mínima de 15 minutos')
    .max(180, 'Duração máxima de 180 minutos'),
  slotTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 
    'Horário inválido (formato HH:MM)'),
  notes: z.string().max(500, 'Observações limitadas a 500 caracteres').optional(),
  recurrenceRule: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    interval: z.number().min(1),
    endDate: z.date().optional(),
    count: z.number().optional(),
  }).optional(),
  templateId: z.string().optional(),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

