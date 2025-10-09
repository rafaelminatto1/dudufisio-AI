import { db } from '../mockDb';
import { findConflict } from './conflictDetection';
import { generateRecurrences } from './recurrenceService';
import { normalizeAppointmentStatus } from './schedulingUtils';
const DEFAULT_URGENCY = 3;
function buildEntry(input) {
    const now = new Date();
    return {
        id: `wait_${now.getTime()}`,
        patientId: input.patientId,
        therapistId: input.therapistId,
        preferredStartFrom: input.preferredStartFrom,
        preferredStartTo: input.preferredStartTo,
        preferredDays: input.preferredDays,
        preferredTimeRanges: input.preferredTimeRanges,
        urgency: input.urgency || DEFAULT_URGENCY,
        noShowRisk: input.noShowRisk,
        status: 'waiting',
        notes: input.notes,
        createdAt: now,
        updatedAt: now,
    };
}
function matchesSlot(entry, appointment) {
    if (entry.therapistId && entry.therapistId !== appointment.therapistId) {
        return false;
    }
    if (entry.preferredStartFrom && appointment.startTime < entry.preferredStartFrom) {
        return false;
    }
    if (entry.preferredStartTo && appointment.startTime > entry.preferredStartTo) {
        return false;
    }
    if (entry.preferredDays && entry.preferredDays.length) {
        if (!entry.preferredDays.includes(appointment.startTime.getDay())) {
            return false;
        }
    }
    if (entry.preferredTimeRanges && entry.preferredTimeRanges.length) {
        const hour = appointment.startTime.getHours();
        const minute = appointment.startTime.getMinutes();
        const timeValue = hour * 60 + minute;
        const withinRange = entry.preferredTimeRanges.some(range => {
            const [startH, startM] = range.start.split(':').map(Number);
            const [endH, endM] = range.end.split(':').map(Number);
            const startMinutes = (startH || 0) * 60 + (startM || 0);
            const endMinutes = (endH || 0) * 60 + (endM || 0);
            return timeValue >= startMinutes && timeValue <= endMinutes;
        });
        if (!withinRange)
            return false;
    }
    return true;
}
function sortWaitlist(entries) {
    return [...entries].sort((a, b) => {
        if (a.urgency !== b.urgency) {
            return b.urgency - a.urgency;
        }
        const aRisk = a.noShowRisk ?? 0;
        const bRisk = b.noShowRisk ?? 0;
        if (aRisk !== bRisk) {
            return aRisk - bRisk;
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
    });
}
export const waitlistService = {
    async listEntries(status = 'waiting') {
        const entries = db.getWaitlistEntries?.() || [];
        return entries.filter(entry => entry.status === status);
    },
    async addToWaitlist(input) {
        const entry = buildEntry(input);
        db.saveWaitlistEntry?.(entry);
        return entry;
    },
    async markEntry(entryId, status, metadata) {
        const entry = db.getWaitlistEntryById?.(entryId);
        if (!entry)
            return;
        db.saveWaitlistEntry?.({
            ...entry,
            status,
            lastNotifiedAt: status === 'notified' ? new Date() : entry.lastNotifiedAt,
            updatedAt: new Date(),
            ...metadata,
        });
    },
    async fillSlot(appointmentSlot) {
        const waitingEntries = sortWaitlist(await this.listEntries('waiting'));
        for (const entry of waitingEntries) {
            if (matchesSlot(entry, appointmentSlot)) {
                await this.markEntry(entry.id, 'notified', { therapistId: appointmentSlot.therapistId });
                return entry;
            }
        }
        return null;
    },
    async onSlotAvailable(appointment, existingAppointments) {
        const status = normalizeAppointmentStatus(appointment.status);
        if (status !== 'cancelled' && status !== 'unknown') {
            return { filled: false };
        }
        const waitlistMatch = await this.fillSlot(appointment);
        if (!waitlistMatch) {
            return { filled: false };
        }
        const conflicts = findConflict([appointment], existingAppointments.filter(app => app.id !== appointment.id));
        if (conflicts) {
            await this.markEntry(waitlistMatch.id, 'waiting');
            return { filled: false };
        }
        db.saveAppointment({ ...appointment, patientId: waitlistMatch.patientId, status: 'scheduled' });
        await this.markEntry(waitlistMatch.id, 'scheduled');
        return { filled: true, entry: waitlistMatch };
    },
    async applyHoldToRecurrence(entryId, baseAppointment) {
        const entry = db.getWaitlistEntryById?.(entryId);
        if (!entry) {
            throw new Error('Entrada de fila não encontrada');
        }
        const appointments = generateRecurrences({
            ...baseAppointment,
            patientId: entry.patientId,
        });
        appointments.forEach(app => db.saveAppointment(app));
        await this.markEntry(entryId, 'scheduled');
        return appointments;
    },
};
