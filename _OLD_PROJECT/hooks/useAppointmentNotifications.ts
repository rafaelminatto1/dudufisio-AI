/**
 * useAppointmentNotifications Hook
 * MoocaFisio - Hook para gerenciar notificações de agendamentos
 *
 * Uso:
 * const { sendConfirmation, scheduleReminders, sendCancellation, sendUpdate } = useAppointmentNotifications();
 */

import { useState, useCallback } from 'react';
import { appointmentNotificationService } from '../services/notifications/appointmentNotificationService';
import type { Appointment } from '../types';

interface UseAppointmentNotificationsReturn {
  sendConfirmation: (appointment: Appointment) => Promise<boolean>;
  scheduleReminders: (appointment: Appointment) => Promise<boolean>;
  sendCancellation: (appointment: Appointment) => Promise<boolean>;
  sendUpdate: (originalAppointment: Appointment, updatedAppointment: Appointment) => Promise<boolean>;
  isProcessing: boolean;
  error: string | null;
}

export const useAppointmentNotifications = (): UseAppointmentNotificationsReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Envia notificação de confirmação
   */
  const sendConfirmation = useCallback(async (appointment: Appointment): Promise<boolean> => {
    setIsProcessing(true);
    setError(null);

    try {
      const success = await appointmentNotificationService.sendAppointmentConfirmation(appointment);
      if (!success) {
        setError('Falha ao enviar notificação de confirmação');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('[useAppointmentNotifications] Error sending confirmation:', err);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Agenda lembretes (24h e 2h antes)
   */
  const scheduleReminders = useCallback(async (appointment: Appointment): Promise<boolean> => {
    setIsProcessing(true);
    setError(null);

    try {
      const success = await appointmentNotificationService.scheduleReminders(appointment);
      if (!success) {
        setError('Falha ao agendar lembretes');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('[useAppointmentNotifications] Error scheduling reminders:', err);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Envia notificação de cancelamento
   */
  const sendCancellation = useCallback(async (appointment: Appointment): Promise<boolean> => {
    setIsProcessing(true);
    setError(null);

    try {
      const success = await appointmentNotificationService.sendCancellationNotification(appointment);
      if (!success) {
        setError('Falha ao enviar notificação de cancelamento');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('[useAppointmentNotifications] Error sending cancellation:', err);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Envia notificação de atualização
   */
  const sendUpdate = useCallback(
    async (originalAppointment: Appointment, updatedAppointment: Appointment): Promise<boolean> => {
      setIsProcessing(true);
      setError(null);

      try {
        const success = await appointmentNotificationService.sendUpdateNotification(
          originalAppointment,
          updatedAppointment
        );
        if (!success) {
          setError('Falha ao enviar notificação de atualização');
        }
        return success;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        console.error('[useAppointmentNotifications] Error sending update:', err);
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return {
    sendConfirmation,
    scheduleReminders,
    sendCancellation,
    sendUpdate,
    isProcessing,
    error
  };
};
