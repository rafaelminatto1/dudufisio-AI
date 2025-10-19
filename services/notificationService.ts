/**
 * services/notificationService.ts
 * 
 * Serviço de notificações e lembretes da agenda
 */

import { Appointment, EnrichedAppointment } from '../types';
import { eventService } from './eventService';

export interface Notification {
  id: string;
  type: 'reminder' | 'delay' | 'conflict' | 'confirmation_needed';
  title: string;
  message: string;
  appointmentId: string;
  severity: 'info' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  scheduledFor?: Date;
}

class NotificationService {
  private notifications: Notification[] = [];
  private reminders: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Inicializar o serviço de notificações
   */
  initialize() {
    this.startReminderScheduler();
    this.loadNotificationsFromStorage();
  }

  /**
   * Agendar lembrete 1h antes do agendamento
   */
  scheduleReminder(appointment: Appointment, minutesBefore: number = 60) {
    const reminderTime = new Date(appointment.startTime.getTime() - minutesBefore * 60 * 1000);
    const now = new Date();

    // Se o lembrete já passou, não agendar
    if (reminderTime <= now) {
      return;
    }

    const timeout = setTimeout(() => {
      this.createNotification({
        type: 'reminder',
        title: 'Lembrete de Agendamento',
        message: `Agendamento com ${appointment.patientName} em ${minutesBefore} minutos`,
        appointmentId: appointment.id,
        severity: 'info'
      });
      this.reminders.delete(appointment.id);
    }, reminderTime.getTime() - now.getTime());

    this.reminders.set(appointment.id, timeout);
  }

  /**
   * Cancelar lembrete
   */
  cancelReminder(appointmentId: string) {
    const timeout = this.reminders.get(appointmentId);
    if (timeout) {
      clearTimeout(timeout);
      this.reminders.delete(appointmentId);
    }
  }

  /**
   * Verificar atrasos (paciente não confirmou presença 5min após horário)
   */
  checkDelays(appointments: EnrichedAppointment[]) {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    appointments.forEach(appointment => {
      // Verificar se já existe notificação para este atraso
      const existingNotification = this.notifications.find(
        n => n.appointmentId === appointment.id && n.type === 'delay'
      );

      if (existingNotification) return;

      // Se o horário passou e o status ainda é 'scheduled'
      if (
        appointment.startTime <= fiveMinutesAgo &&
        appointment.startTime > new Date(now.getTime() - 60 * 60 * 1000) && // Apenas últimas 1h
        appointment.status === 'scheduled'
      ) {
        this.createNotification({
          type: 'delay',
          title: 'Paciente em Atraso',
          message: `${appointment.patientName} não confirmou presença`,
          appointmentId: appointment.id,
          severity: 'warning'
        });
      }
    });
  }

  /**
   * Criar notificação de conflito
   */
  notifyConflict(appointment: Appointment, conflicts: string[]) {
    this.createNotification({
      type: 'conflict',
      title: 'Conflito Detectado',
      message: `Agendamento com ${appointment.patientName} tem conflitos: ${conflicts.join(', ')}`,
      appointmentId: appointment.id,
      severity: 'error'
    });
  }

  /**
   * Criar notificação de confirmação necessária
   */
  notifyConfirmationNeeded(appointment: Appointment) {
    this.createNotification({
      type: 'confirmation_needed',
      title: 'Confirmação Necessária',
      message: `Confirmar presença de ${appointment.patientName}`,
      appointmentId: appointment.id,
      severity: 'info'
    });
  }

  /**
   * Criar notificação
   */
  private createNotification(data: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
    const notification: Notification = {
      ...data,
      id: `notif_${Date.now()}`,
      read: false,
      createdAt: new Date()
    };

    this.notifications.unshift(notification);
    this.saveNotificationsToStorage();
    eventService.emit('notifications:new', notification);
  }

  /**
   * Marcar notificação como lida
   */
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotificationsToStorage();
      eventService.emit('notifications:updated');
    }
  }

  /**
   * Marcar todas como lidas
   */
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotificationsToStorage();
    eventService.emit('notifications:updated');
  }

  /**
   * Deletar notificação
   */
  deleteNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotificationsToStorage();
    eventService.emit('notifications:updated');
  }

  /**
   * Obter todas as notificações
   */
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Obter notificações não lidas
   */
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  /**
   * Obter contagem de notificações não lidas
   */
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * Iniciar scheduler de lembretes
   */
  private startReminderScheduler() {
    // Verificar lembretes a cada 5 minutos
    setInterval(() => {
      // Esta função será chamada periodicamente
      // Em produção, você pode verificar agendamentos do banco de dados aqui
    }, 5 * 60 * 1000);
  }

  /**
   * Salvar notificações no localStorage
   */
  private saveNotificationsToStorage() {
    try {
      localStorage.setItem('agenda_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Erro ao salvar notificações:', error);
    }
  }

  /**
   * Carregar notificações do localStorage
   */
  private loadNotificationsFromStorage() {
    try {
      const stored = localStorage.getItem('agenda_notifications');
      if (stored) {
        this.notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt)
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  }

  /**
   * Limpar notificações antigas (mais de 7 dias)
   */
  clearOldNotifications() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.notifications = this.notifications.filter(n => n.createdAt > sevenDaysAgo);
    this.saveNotificationsToStorage();
  }
}

export const notificationService = new NotificationService();

// Inicializar o serviço
if (typeof window !== 'undefined') {
  notificationService.initialize();
}
