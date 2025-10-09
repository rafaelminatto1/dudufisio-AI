const STATUS_MAP = {
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
export function normalizeAppointmentStatus(status) {
    if (!status)
        return 'unknown';
    const key = status.toString().trim().toLowerCase();
    return STATUS_MAP[key] || 'unknown';
}
export function appointmentsOverlap(a, b) {
    return a.startTime < b.endTime && a.endTime > b.startTime;
}
export function cloneAppointmentWithoutRecurrence(appointment) {
    const cloned = {
        ...appointment,
        startTime: new Date(appointment.startTime),
        endTime: new Date(appointment.endTime),
    };
    if (cloned.recurrenceRule && Object.keys(cloned.recurrenceRule).length === 0) {
        delete cloned.recurrenceRule;
    }
    return cloned;
}
export function addMinutes(base, minutes) {
    return new Date(base.getTime() + minutes * 60 * 1000);
}
export function addDays(base, days) {
    const clone = new Date(base);
    clone.setDate(clone.getDate() + days);
    return clone;
}
export function setTimeFromTemplate(target, template) {
    const clone = new Date(target);
    clone.setHours(template.getHours(), template.getMinutes(), template.getSeconds(), template.getMilliseconds());
    return clone;
}
export function startOfDay(date) {
    const clone = new Date(date);
    clone.setHours(0, 0, 0, 0);
    return clone;
}
export function startOfWeek(date) {
    const clone = startOfDay(date);
    const diffToMonday = (clone.getDay() + 6) % 7;
    clone.setDate(clone.getDate() - diffToMonday);
    return clone;
}
export function slotToKey(details) {
    const therapistKey = details.therapistId ?? 'all';
    return `${therapistKey}_${details.startTime.getTime()}_${details.endTime.getTime()}`;
}
