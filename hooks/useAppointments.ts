// hooks/useAppointments.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Appointment, EnrichedAppointment, Patient, Therapist } from '../types';
import { AppointmentTypeColors } from '../types';
import * as appointmentService from '../services/appointmentService';
import { useData } from '../contexts/AppContext';
import { eventService } from '../services/eventService';
import { AppointmentType } from '../types';
import { getCachedOrFetch, deleteCache, DEFAULT_CACHE_TTL_MS } from '../packages/agenda-pacientes/src/lib/cache';
import { apmService } from '../services/monitoring/apmService';

interface UseAppointmentsResult {
  appointments: EnrichedAppointment[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useAppointments = (startDate?: Date, endDate?: Date): UseAppointmentsResult => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { patients, therapists } = useData();
  
  const makeCacheKey = useCallback(() => {
    if (!startDate || !endDate) return '';
    return `appointments:${startDate.toISOString()}:${endDate.toISOString()}`;
  }, [startDate, endDate]);

  const clearCache = useCallback(() => {
      const key = makeCacheKey();
      if (!key) return;
      deleteCache(key);
  }, [makeCacheKey]);

  const fetchAppointments = useCallback(async () => {
      if (!startDate || !endDate) {
          setIsLoading(false);
          setAppointments([]);
          return;
      }

      const cacheKey = makeCacheKey();

      performance.mark('appointments:fetch:start');
      try {
          const fetchedAppointments = await getCachedOrFetch<Appointment[]>(
            cacheKey,
            async () => {
              const t0 = performance.now();
              const data = await appointmentService.getAppointments(startDate, endDate);
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

          setAppointments(fetchedAppointments);
          setError(null);
      } catch (err) {
          setError(err as Error);
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

  const enrichedAppointments = useMemo((): EnrichedAppointment[] => {
    const patientMap = new Map<string, Patient>(patients.map(p => [p.id, p]));
    const therapistMap = new Map<string, Therapist>(therapists.map(t => [t.id, t]));

    return appointments.map(app => {
        const patient = patientMap.get(app.patientId);
        
        return {
            ...app,
            // Defaults seguros
            type: (app.type as any) || AppointmentType.Session,
            value: typeof app.value === 'number' && Number.isFinite(app.value) ? app.value : 0,
            // 🔥 FIX: Garantir que patientName esteja sempre presente
            patientName: app.patientName || patient?.name || 'Paciente não identificado',
            patientPhone: patient?.phone || '',
            patientAvatarUrl: app.patientAvatarUrl || patient?.avatarUrl || '',
            therapistColor: therapistMap.get(app.therapistId)?.color || 'slate',
            typeColor: AppointmentTypeColors[(app.type as any) || AppointmentType.Session] || 'slate',
            patientMedicalAlerts: patient?.medicalAlerts,
            therapistName: therapistMap.get(app.therapistId)?.name || '(escolher depois na evolução)',
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