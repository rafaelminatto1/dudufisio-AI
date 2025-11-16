import { z } from 'zod';
// Enums for Appointment
export const AppointmentStatus = {
    SCHEDULED: 'scheduled',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show'
};
export const AppointmentType = {
    AVALIACAO: 'avaliacao',
    RETORNO: 'retorno',
    SESSAO: 'sessao',
    REAVALIACAO: 'reavaliacao'
};
// Validation schemas
export const createAppointmentSchema = z.object({
    patient_id: z.string().uuid('ID do paciente deve ser um UUID válido'),
    therapist_id: z.string().uuid('ID do fisioterapeuta deve ser um UUID válido'),
    scheduled_at: z
        .string()
        .datetime('Data e hora devem estar no formato ISO')
        .refine(date => new Date(date) >= new Date(), 'Não é possível agendar para o passado'),
    appointment_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
        .optional(),
    start_time: z
        .string()
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM')
        .optional(),
    duration_minutes: z
        .number()
        .min(15, 'Duração mínima é 15 minutos')
        .max(240, 'Duração máxima é 240 minutos')
        .default(60),
    appointment_type: z.enum(['avaliacao', 'retorno', 'sessao', 'reavaliacao']).optional()
});
export const updateAppointmentSchema = z.object({
    scheduled_at: z
        .string()
        .datetime('Data e hora devem estar no formato ISO')
        .optional(),
    appointment_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
        .optional(),
    start_time: z
        .string()
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM')
        .optional(),
    duration_minutes: z
        .number()
        .min(15, 'Duração mínima é 15 minutos')
        .max(240, 'Duração máxima é 240 minutos')
        .optional(),
    status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
    cancellation_reason: z.string().max(500, 'Motivo deve ter no máximo 500 caracteres').optional()
});
export const conflictCheckSchema = z.object({
    therapist_id: z.string().uuid('ID do fisioterapeuta deve ser um UUID válido'),
    appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
    start_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM'),
    duration_minutes: z.number().min(1, 'Duração deve ser positiva'),
    exclude_appointment_id: z.string().uuid().optional()
});
// Helper functions
export function getAppointmentEndTime(startTime, durationMinutes) {
    const timeParts = startTime.split(':').map(Number);
    const hours = timeParts[0] || 0;
    const minutes = timeParts[1] || 0;
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
}
export function formatAppointmentDateTime(date, time) {
    const appointmentDate = new Date(date);
    const timeParts = time.split(':');
    const hours = timeParts[0] || '0';
    const minutes = timeParts[1] || '0';
    appointmentDate.setHours(parseInt(hours), parseInt(minutes));
    return appointmentDate.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
export function getAppointmentTypeLabel(type) {
    const labels = {
        avaliacao: 'Avaliação',
        retorno: 'Retorno',
        sessao: 'Sessão',
        reavaliacao: 'Reavaliação'
    };
    return labels[type];
}
export function getAppointmentStatusLabel(status) {
    const labels = {
        scheduled: 'Agendado',
        completed: 'Realizado',
        cancelled: 'Cancelado',
        no_show: 'Faltou'
    };
    return labels[status];
}
export function getAppointmentStatusColor(status) {
    const colors = {
        scheduled: 'blue',
        completed: 'green',
        cancelled: 'red',
        no_show: 'orange'
    };
    return colors[status];
}
// Business logic helpers
export function isAppointmentEditable(appointment) {
    return appointment.status === 'scheduled' &&
        new Date(appointment.scheduled_at) > new Date();
}
export function canCancelAppointment(appointment) {
    return appointment.status === 'scheduled';
}
export function canMarkAsCompleted(appointment) {
    return appointment.status === 'scheduled' &&
        new Date(appointment.scheduled_at) <= new Date();
}
// Helper functions to work with the new schema
export function getAppointmentDate(appointment) {
    if (appointment.appointment_date) {
        return appointment.appointment_date;
    }
    return new Date(appointment.scheduled_at).toISOString().split('T')[0];
}
export function getAppointmentTime(appointment) {
    if (appointment.start_time) {
        return appointment.start_time;
    }
    const date = new Date(appointment.scheduled_at);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}
