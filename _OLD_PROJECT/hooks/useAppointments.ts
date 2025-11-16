// hooks/useAppointments.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppointmentTypeColors } from '../types';
import * as appointmentService from '../services/appointmentService';
import { useData } from '../contexts/AppContext';
import { eventService } from '../services/eventService';
import { AppointmentType, Appointment } from '../types';
import { getCachedOrFetch, deleteCache, DEFAULT_CACHE_TTL_MS } from '../packages/agenda-pacientes/src/lib/cache';
import { apmService } from '../services/monitoring/apmService';
import { Patient, Therapist, EnrichedAppointment } from '../types';

type ConfirmationState = 'pending' | 'confirmed' | 'cancelled' | 'rescheduled';

const CONFIRMATION_LABELS: Record<ConfirmationState, string> = {
  confirmed: 'Confirmado',
  pending: 'Aguardando confirmação',
  cancelled: 'Cancelado',
  rescheduled: 'Reagendado',
};

const CONFIRMATION_BADGE_CLASSES: Record<ConfirmationState, string> = {
  confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  rescheduled: 'bg-sky-100 text-sky-700 border-sky-200',
};

const toDateOrUndefined = (value?: Date | string | null): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const getConfirmationState = (appointment: Appointment): ConfirmationState => {
  const status = (appointment.status || '').toLowerCase();
  if (status === 'cancelled' || status === 'canceled') {
    return 'cancelled';
  }
  if (status === 'rescheduled') {
    return 'rescheduled';
  }
  if (appointment.confirmed) {
    return 'confirmed';
  }
  return 'pending';
};

const buildReminderHistory = (appointment: Appointment) => {
  const history = [
    {
      type: '7d' as const,
      sentAt: toDateOrUndefined(appointment.reminderSent7d ?? appointment.reminder_sent_7d),
    },
    {
      type: '24h' as const,
      sentAt: toDateOrUndefined(appointment.reminderSent24h ?? appointment.reminder_sent_24h),
    },
    {
      type: '2h' as const,
      sentAt: toDateOrUndefined(appointment.reminderSent2h ?? appointment.reminder_sent_2h),
    },
  ].filter((entry): entry is { type: '7d' | '24h' | '2h'; sentAt: Date } => Boolean(entry.sentAt));

  history.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());

  const last = history.length > 0 ? history[history.length - 1] : undefined;

  return { history, last };
};

export const useAppointments = (startDate: Date | null, endDate: Date | null) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { patients, therapists } = useData();
  
  const makeCacheKey = useCallback((): string => {
    if (!startDate || !endDate) return '';
    return `appointments:${startDate.toISOString()}:${endDate.toISOString()}`;
  }, [startDate, endDate]);

  const clearCache = useCallback((): void => {
      const key = makeCacheKey();
      if (!key) return;
      deleteCache(key);
  }, [makeCacheKey]);

  const fetchAppointments = useCallback(async (): Promise<void> => {
      if (!startDate || !endDate) {
          setIsLoading(false);
          setAppointments([]);
          return;
      }

      const cacheKey = makeCacheKey();

      performance.mark('appointments:fetch:start');
      try {
          const fetchedAppointments = await getCachedOrFetch(
            cacheKey,
            async () => {
              const t0 = performance.now();
              const data = await appointmentService.getAppointments(startDate!, endDate!);
              const t1 = performance.now();
              apmService.trackMetric({
                type: 'api_request',
                name: 'appointments_fetch_time',
                value: t1 - t0,
                unit: 'ms',
                tags: { page: window.location.pathname },
              });
              return data;
            },
            DEFAULT_CACHE_TTL_MS
          );

          setAppointments(fetchedAppointments as Appointment[]);
          setError(null);
      } catch (err) {
          setError(err);
      } finally {
          setIsLoading(false);
          performance.mark('appointments:fetch:end');
          performance.measure('appointments:fetch', 'appointments:fetch:start', 'appointments:fetch:end');
      }
  }, [startDate, endDate, makeCacheKey]);

  useEffect(() => {
      fetchAppointments();
      
      const handleAppointmentsChanged = () => {
          clearCache();
          fetchAppointments();
      };
      
      eventService.on('appointments:changed', handleAppointmentsChanged);
      
      return () => {
          eventService.off('appointments:changed', handleAppointmentsChanged);
      };
  }, [fetchAppointments, clearCache]);

  const enrichedAppointments = useMemo<EnrichedAppointment[]>(() => {
    const patientMap = new Map(patients.map(p => [p.id, p]));
    const therapistMap = new Map(therapists.map(t => [t.id, t]));

    return appointments.map((app: Appointment) => {
        const patient = patientMap.get(app.patientId);
        const confirmationState = getConfirmationState(app);
        const { history: reminderHistory, last } = buildReminderHistory(app);
        
        return {
            ...app,
            // Defaults seguros
            type: (app.type) || AppointmentType.Session,
            value: typeof app.value === 'number' && Number.isFinite(app.value) ? app.value : 0,
            // 🔥 FIX: Garantir que patientName esteja sempre presente
            patientName: app.patientName || patient?.name || 'Paciente não identificado',
            patientPhone: patient?.phone || '',
            patientAvatarUrl: app.patientAvatarUrl || patient?.avatarUrl || '',
            therapistColor: therapistMap.get(app.therapistId)?.color || 'slate',
            typeColor: AppointmentTypeColors[(app.type) || AppointmentType.Session] || 'slate',
            patientMedicalAlerts: patient?.medicalAlerts,
            therapistName: therapistMap.get(app.therapistId)?.name || '(escolher depois na evolução)',
            confirmationState,
            confirmationLabel: CONFIRMATION_LABELS[confirmationState],
            confirmationBadgeClass: CONFIRMATION_BADGE_CLASSES[confirmationState],
            isAwaitingConfirmation: confirmationState === 'pending',
            lastReminderAt: last?.sentAt,
            lastReminderType: last?.type,
            reminderHistory,
        };
    });
  }, [appointments, patients, therapists]);

  return { 
    appointments: enrichedAppointments, 
    isLoading, 
    error, 
    refetch: fetchAppointments
  };
};