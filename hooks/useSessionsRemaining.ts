import { useState, useEffect } from 'react';
import { Appointment } from '../types';
import { calculateSessionsRemaining } from '../services/appointmentService';

/**
 * Hook para gerenciar e obter o número de sessões restantes
 * Prioriza o valor manual do agendamento, depois calcula automaticamente
 */
export function useSessionsRemaining(appointment: Appointment) {
  const [sessionsRemaining, setSessionsRemaining] = useState<number | undefined>(
    appointment.sessions_remaining
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Se o agendamento já tem um valor manual, usar ele
    if (appointment.sessions_remaining !== undefined && appointment.sessions_remaining !== null) {
      setSessionsRemaining(appointment.sessions_remaining);
      return;
    }

    // Se não tem valor manual e não tem sessions_total, não há nada a calcular
    if (!appointment.sessions_total) {
      setSessionsRemaining(undefined);
      return;
    }

    // Calcular automaticamente
    const fetchSessionsRemaining = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const remaining = await calculateSessionsRemaining(
          appointment.patientId,
          appointment.type
        );
        setSessionsRemaining(remaining);
      } catch (err) {
        setError(err as Error);
        setSessionsRemaining(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionsRemaining();
  }, [
    appointment.id,
    appointment.patientId,
    appointment.type,
    appointment.sessions_remaining,
    appointment.sessions_total,
    appointment.status
  ]);

  return {
    sessionsRemaining,
    isLoading,
    error,
    hasSessionsInfo: sessionsRemaining !== undefined
  };
}

/**
 * Hook simplificado que retorna apenas o número de sessões
 */
export function useSessionsRemainingValue(appointment: Appointment): number | undefined {
  const { sessionsRemaining } = useSessionsRemaining(appointment);
  return sessionsRemaining;
}

export default useSessionsRemaining;

