import { Appointment, RecurrenceRule } from '../../types';
import { startOfWeek, addDays } from './schedulingUtils';

const DEFAULT_MAX_OCCURRENCES = 200;

const cloneWithDate = (appointment: Appointment, startTime: Date, duration: number, seriesId: string): Appointment => {
    const endTime = new Date(startTime.getTime() + duration);
    return {
        ...appointment,
        id: `app_recurr_${seriesId}_${startTime.getTime()}`,
        startTime,
        endTime,
        seriesId,
    };
};

const getUntilDate = (rule: RecurrenceRule | undefined, baseStart: Date): Date => {
    if (rule?.until) {
        const until = new Date(rule.until);
        until.setHours(23, 59, 59, 999);
        return until;
    }
    const fallback = new Date(baseStart);
    fallback.setMonth(fallback.getMonth() + 3); // default 3 months horizon
    return fallback;
};

const shouldStop = (occurrences: number, maxOccurrences?: number): boolean => {
    const limit = maxOccurrences ?? DEFAULT_MAX_OCCURRENCES;
    return occurrences >= limit;
};

const freqInterval = (rule?: RecurrenceRule): number => Math.max(rule?.interval ?? 1, 1);

const createFromDaysOfWeek = (
    appointment: Appointment,
    rule: RecurrenceRule,
    seriesId: string,
    duration: number,
    baseStart: Date,
    untilDate: Date,
    maxOccurrences?: number
): Appointment[] => {
    const days = (rule.days && rule.days.length > 0 ? rule.days : [baseStart.getDay()])
        .map(day => ((day % 7) + 7) % 7)
        .sort((a, b) => a - b);
    const weekInterval = freqInterval(rule);
    const baseWeekStart = startOfWeek(baseStart);
    const appointments: Appointment[] = [];

    for (let weekIndex = 0; ; weekIndex++) {
        const weekStart = addDays(baseWeekStart, weekIndex * 7);
        if (weekStart > untilDate) {
            break;
        }

        if (weekIndex % weekInterval !== 0) {
            continue;
        }

        for (const day of days) {
            if (shouldStop(appointments.length, maxOccurrences)) {
                return appointments;
            }

            const dayOffset = (day + 7 - 1) % 7; // week starts on Monday (1)
            const occurrenceDate = addDays(weekStart, dayOffset);

            if (occurrenceDate < baseStart) {
                continue;
            }

            if (occurrenceDate > untilDate) {
                return appointments;
            }

            const startTime = new Date(occurrenceDate);
            startTime.setHours(
                baseStart.getHours(),
                baseStart.getMinutes(),
                baseStart.getSeconds(),
                baseStart.getMilliseconds()
            );

            appointments.push(cloneWithDate(appointment, startTime, duration, seriesId));
        }
    }

    return appointments;
};

const createDaily = (
    appointment: Appointment,
    rule: RecurrenceRule,
    seriesId: string,
    duration: number,
    baseStart: Date,
    untilDate: Date,
    maxOccurrences?: number
): Appointment[] => {
    const interval = freqInterval(rule);
    const appointments: Appointment[] = [];
    let occurrenceDate = new Date(baseStart);

    while (occurrenceDate <= untilDate && !shouldStop(appointments.length, maxOccurrences)) {
        const startTime = new Date(occurrenceDate);
        appointments.push(cloneWithDate(appointment, startTime, duration, seriesId));
        occurrenceDate = addDays(occurrenceDate, interval);
    }

    return appointments;
};

const createMonthly = (
    appointment: Appointment,
    rule: RecurrenceRule,
    seriesId: string,
    duration: number,
    baseStart: Date,
    untilDate: Date,
    maxOccurrences?: number
): Appointment[] => {
    const monthDays = (rule.monthDays && rule.monthDays.length > 0 ? rule.monthDays : [baseStart.getDate()])
        .map(day => Math.min(Math.max(day, 1), 31));
    const interval = freqInterval(rule);
    const appointments: Appointment[] = [];
    const baseMonthIndex = baseStart.getFullYear() * 12 + baseStart.getMonth();
    let current = new Date(baseStart.getFullYear(), baseStart.getMonth(), 1);

    while (current <= untilDate && !shouldStop(appointments.length, maxOccurrences)) {
        const currentMonthIndex = current.getFullYear() * 12 + current.getMonth();
        const monthDiff = currentMonthIndex - baseMonthIndex;

        if (monthDiff % interval === 0) {
            for (const day of monthDays) {
                if (shouldStop(appointments.length, maxOccurrences)) {
                    return appointments;
                }

                const occurrenceDate = new Date(current.getFullYear(), current.getMonth(), day);
                if (occurrenceDate < baseStart) {
                    continue;
                }
                if (occurrenceDate > untilDate) {
                    return appointments;
                }

                const startTime = new Date(occurrenceDate);
                startTime.setHours(
                    baseStart.getHours(),
                    baseStart.getMinutes(),
                    baseStart.getSeconds(),
                    baseStart.getMilliseconds()
                );

                appointments.push(cloneWithDate(appointment, startTime, duration, seriesId));
            }
        }

        current.setMonth(current.getMonth() + 1);
    }

    return appointments;
};

/**
 * Generates an array of appointments based on a starting appointment and a recurrence rule.
 * If no recurrence rule is provided, it returns an array with just the single appointment.
 * @param initialAppointment The starting appointment object.
 * @returns An array of all generated appointments in the series.
 */
export const generateRecurrences = (initialAppointment: Appointment): Appointment[] => {
    const { recurrenceRule } = initialAppointment;

    if (!recurrenceRule) {
        const singleAppointment = { ...initialAppointment };
        delete singleAppointment.recurrenceRule;
        return [singleAppointment];
    }

    const seriesId = initialAppointment.seriesId || `series_${Date.now()}`;
    const baseStart = new Date(initialAppointment.startTime);
    const baseEnd = new Date(initialAppointment.endTime);
    const duration = Math.max(baseEnd.getTime() - baseStart.getTime(), 15 * 60 * 1000);
    const untilDate = getUntilDate(recurrenceRule, baseStart);

    const baseAppointment: Appointment = {
        ...initialAppointment,
        seriesId,
    };

    const occurrences = (() => {
        switch (recurrenceRule.frequency) {
            case 'daily':
                return createDaily(baseAppointment, recurrenceRule, seriesId, duration, baseStart, untilDate, recurrenceRule.count);
            case 'monthly':
                return createMonthly(baseAppointment, recurrenceRule, seriesId, duration, baseStart, untilDate, recurrenceRule.count);
            case 'weekly':
            default:
                return createFromDaysOfWeek(baseAppointment, recurrenceRule, seriesId, duration, baseStart, untilDate, recurrenceRule.count);
        }
    })();

    return occurrences.length > 0 ? occurrences : [baseAppointment];
};
