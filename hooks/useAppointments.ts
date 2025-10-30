// hooks/useAppointments.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Appointment, EnrichedAppointment, Patient, Therapist } from '../types';
import { AppointmentTypeColors } from '../types';
import * as appointmentService from '../services/appointmentService';
import { useData } from '../contexts/AppContext';
import { eventService } from '../services/eventService';
import { AppointmentType } from '../types';

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
  
  const clearCache = useCallback(() => {
      if (!startDate || !endDate) return;
      const cacheKey = `appointments_cache_${startDate.toISOString()}_${endDate.toISOString()}`;
      try {
          sessionStorage.removeItem(cacheKey);
      } catch (e) {
          console.error("Failed to clear appointment cache", e);
      }
  }, [startDate, endDate]);

  const fetchAppointments = useCallback(async () => {
      if (!startDate || !endDate) {
          setIsLoading(false);
          setAppointments([]);
          return;
      }

      const cacheKey = `appointments_cache_${startDate.toISOString()}_${endDate.toISOString()}`;
      
      // Stale: Try loading from cache first to show something immediately.
      try {
          const cachedItem = sessionStorage.getItem(cacheKey);
          if (cachedItem) {
              const cachedAppointments = JSON.parse(cachedItem).map((app: any) => ({
                  ...app,
                  startTime: new Date(app.startTime),
                  endTime: new Date(app.endTime),
              }));
              setAppointments(cachedAppointments);
              setIsLoading(false); // We have data to show, so we're not in a hard loading state.
          } else {
              setIsLoading(true); // No cache, so we are truly loading from scratch.
          }
      } catch (e) {
          console.error("Failed to read from appointment cache", e);
          setIsLoading(true); // If cache fails, treat as a hard load.
      }

      // Revalidate: Always fetch fresh data from the network.
      try {
          console.log('🔄 useAppointments - Buscando agendamentos do serviço...');
          console.log('   Período:', startDate, 'até', endDate);
          const fetchedAppointments = await appointmentService.getAppointments(startDate, endDate);
          console.log('📋 useAppointments - Agendamentos recebidos:', fetchedAppointments.length, 'agendamentos');
          console.log('📋 useAppointments - Detalhes dos agendamentos:', fetchedAppointments);
          setAppointments(fetchedAppointments); // Update state with the fresh data.
          setError(null);
          
          // Update cache with the new fresh data.
          try {
              sessionStorage.setItem(cacheKey, JSON.stringify(fetchedAppointments));
          } catch (e) {
              console.error("Failed to write to appointment cache", e);
          }

      } catch (err) {
          setError(err as Error);
          // We only set loading to false here if there was no cache hit.
          // If there was a cache hit, loading is already false and we just silently fail the background update.
          if (!sessionStorage.getItem(cacheKey)) {
              setIsLoading(false);
          }
      }
  }, [startDate, endDate]);

  useEffect(() => {
      fetchAppointments();
      
      const handleAppointmentsChanged = () => {
          console.log('📢 useAppointments - Evento appointments:changed recebido!');
          console.log('   Limpando cache e refazendo fetch...');
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

    return appointments.map(app => ({
        ...app,
        // Defaults seguros
        type: (app.type as any) || AppointmentType.Session,
        value: typeof app.value === 'number' && Number.isFinite(app.value) ? app.value : 0,
        patientPhone: patientMap.get(app.patientId)?.phone || '',
        therapistColor: therapistMap.get(app.therapistId)?.color || 'slate',
        typeColor: AppointmentTypeColors[(app.type as any) || AppointmentType.Session] || 'slate',
        patientMedicalAlerts: patientMap.get(app.patientId)?.medicalAlerts,
        therapistName: therapistMap.get(app.therapistId)?.name || '(escolher depois na evolução)',
    }));
  }, [appointments, patients, therapists]);

  return { 
    appointments: enrichedAppointments, 
    isLoading, 
    error, 
    refetch: fetchAppointments
  };
};