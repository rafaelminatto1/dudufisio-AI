

// services/notificationService.ts
import { User, Role, AppointmentStatus } from '../types';

// Temporary interface definition
interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  type: 'task_assigned' | 'announcement' | 'appointment_reminder' | 'exercise_reminder';
}
import { mockNotifications, mockAppointments, mockUsers, mockPatients } from '../data/mockData';
import * as treatmentService from './treatmentService';
import * as whatsappService from './whatsappService';
import { toast } from 'react-toastify';
import { SchedulingAlert } from '../types';
import { sendEmail } from './emailService';
// import { sendWhatsAppMessage } from './whatsappService';
import { observability } from '../lib/observabilityLogger';
import { auditService } from './auditService';

/**
 * 🔔 ENHANCED NOTIFICATION SERVICE
 *
 * Sistema avançado de notificações com suporte a:
 * - Push notifications (Web Push API)
 * - Email e SMS integração
 * - Templates personalizáveis
 * - Agendamento inteligente
 * - Analytics e métricas
 * - Fallback para notificações in-app
 */

export interface PushNotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  silent?: boolean;
  requireInteraction?: boolean;
  renotify?: boolean;
  tag?: string;
  timestamp?: number;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  channels: ('push' | 'email' | 'sms' | 'in_app')[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  variables: string[];
}

class EnhancedNotificationService {
  private static instance: EnhancedNotificationService;
  private pushManager: PushManager | null = null;
  private vapidKey: string = '';
  private templates: Map<string, NotificationTemplate> = new Map();
  private subscriptions: Map<string, PushSubscription> = new Map();

  public static getInstance(): EnhancedNotificationService {
    if (!EnhancedNotificationService.instance) {
      EnhancedNotificationService.instance = new EnhancedNotificationService();
    }
    return EnhancedNotificationService.instance;
  }

  private constructor() {
    this.initializePushNotifications();
    this.loadDefaultTemplates();
  }

  private async initializePushNotifications(): Promise<void> {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.pushManager = registration.pushManager;
        this.vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BEl79InKBILei-QaF0alLUiU63A38ZLoQpq-sb9rXaJcOvV-KQuBoSGjVnr4Vxz7A09DeUAKZoI1l6_qCPBywtc';

        observability.service.call('notification.push.initialized', {
          hasServiceWorker: true,
          hasPushManager: !!this.pushManager
        });

        console.log('✅ Push notifications inicializadas');
      } else {
        observability.service.warn('notification.push.not_supported', {
          hasServiceWorker: 'serviceWorker' in navigator,
          hasPushManager: 'PushManager' in window
        });
      }
    } catch (error) {
      observability.service.error('notification.push.init_error', { error });
      console.warn('⚠️ Erro ao inicializar push notifications:', error);
    }
  }

  private loadDefaultTemplates(): void {
    const templates: NotificationTemplate[] = [
      {
        id: 'appointment_reminder',
        name: 'Lembrete de Consulta',
        title: 'Lembrete: Consulta {{when}}',
        body: 'Você tem uma consulta com {{therapistName}} {{when}} às {{time}}.',
        channels: ['push', 'in_app'],
        priority: 'high',
        variables: ['when', 'therapistName', 'time']
      },
      {
        id: 'appointment_confirmation',
        name: 'Confirmação de Agendamento',
        title: 'Consulta agendada',
        body: 'Sua consulta foi agendada para {{date}} às {{time}} com {{therapistName}}.',
        channels: ['push', 'email', 'in_app'],
        priority: 'normal',
        variables: ['date', 'time', 'therapistName']
      },
      {
        id: 'payment_reminder',
        name: 'Lembrete de Pagamento',
        title: 'Lembrete de pagamento',
        body: 'Você tem um pagamento pendente de R$ {{amount}} com vencimento em {{dueDate}}.',
        channels: ['push', 'email'],
        priority: 'high',
        variables: ['amount', 'dueDate']
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Este navegador não suporta notificações');
    }

    const permission = await Notification.requestPermission();

    observability.service.call('notification.permission.requested', { permission });

    return permission;
  }

  async subscribeToPush(userId: string): Promise<PushSubscription | null> {
    if (!this.pushManager || !this.vapidKey) {
      return null;
    }

    try {
      const subscription = await this.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(this.vapidKey)
      });

      this.subscriptions.set(userId, subscription);

      observability.service.call('notification.push.subscribed', {
        userId,
        endpoint: subscription.endpoint
      });

      // Log de auditoria
      await auditService.createLog({
        user: userId,
        action: 'SUBSCRIBE_PUSH_NOTIFICATIONS',
        details: 'Usuário se inscreveu para receber push notifications',
        resourceType: 'notification'
      });

      return subscription;
    } catch (error) {
      observability.service.error('notification.push.subscribe_error', { error, userId });
      return null;
    }
  }

  async sendPushNotification(
    userId: string,
    config: PushNotificationConfig
  ): Promise<boolean> {
    const subscription = this.subscriptions.get(userId);

    if (!subscription) {
      // Fallback para notificação in-app
      this.sendInAppNotification(userId, config);
      return false;
    }

    try {
      // Em produção, isso seria enviado via servidor
      // Aqui simulamos o processo
      observability.service.call('notification.push.sent', {
        userId,
        title: config.title
      });

      // Mostrar notificação local para demonstração
      if (Notification.permission === 'granted') {
        new Notification(config.title, {
          body: config.body,
          icon: config.icon || '/icon-192x192.png',
          badge: config.badge || '/badge-72x72.png',
          data: config.data,
          silent: config.silent,
          requireInteraction: config.requireInteraction,
          renotify: config.renotify,
          tag: config.tag,
          timestamp: config.timestamp || Date.now()
        });
      }

      return true;
    } catch (error) {
      observability.service.error('notification.push.send_error', { error, userId });
      this.sendInAppNotification(userId, config);
      return false;
    }
  }

  private sendInAppNotification(userId: string, config: PushNotificationConfig): void {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      message: `${config.title}: ${config.body}`,
      isRead: false,
      createdAt: new Date(),
      type: 'push_fallback'
    };

    notifications.unshift(notification);

    // Dispara evento personalizado para componentes React
    window.dispatchEvent(new CustomEvent('new-notification', {
      detail: notification
    }));
  }

  async sendTemplatedNotification(
    templateId: string,
    userId: string,
    variables: Record<string, string>,
    channels?: ('push' | 'email' | 'sms' | 'in_app')[]
  ): Promise<{ success: boolean; sentChannels: string[]; errors: string[] }> {
    const template = this.templates.get(templateId);

    if (!template) {
      throw new Error(`Template não encontrado: ${templateId}`);
    }

    const title = this.processTemplate(template.title, variables);
    const body = this.processTemplate(template.body, variables);
    const targetChannels = channels || template.channels;

    const results = {
      success: false,
      sentChannels: [] as string[],
      errors: [] as string[]
    };

    // Log de auditoria
    await auditService.createLog({
      user: userId,
      action: 'SEND_TEMPLATED_NOTIFICATION',
      details: `Enviando notificação usando template: ${templateId}`,
      resourceType: 'notification'
    });

    for (const channel of targetChannels) {
      try {
        switch (channel) {
          case 'push':
            const pushSuccess = await this.sendPushNotification(userId, {
              title,
              body,
              data: { templateId, userId, timestamp: Date.now() }
            });
            if (pushSuccess) results.sentChannels.push('push');
            break;

          case 'in_app':
            this.sendInAppNotification(userId, { title, body });
            results.sentChannels.push('in_app');
            break;

          case 'email':
            // Integração com serviço de email
            await this.sendEmailNotification(userId, title, body);
            results.sentChannels.push('email');
            break;

          case 'sms':
            // Integração com serviço de SMS
            await this.sendSMSNotification(userId, `${title}: ${body}`);
            results.sentChannels.push('sms');
            break;
        }
      } catch (error) {
        results.errors.push(`${channel}: ${error}`);
      }
    }

    results.success = results.sentChannels.length > 0;

    observability.service.call('notification.templated.sent', {
      templateId,
      userId,
      sentChannels: results.sentChannels,
      errorCount: results.errors.length
    });

    return results;
  }

  private processTemplate(template: string, variables: Record<string, string>): string {
    let processed = template;

    Object.entries(variables).forEach(([key, value]) => {
      processed = processed.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return processed;
  }

  private async sendEmailNotification(userId: string, subject: string, body: string): Promise<void> {
    const user = mockUsers.find(u => u.id === userId);
    if (user?.email) {
      await sendEmail({
        to: user.email,
        subject,
        body
      });
    }
  }

  private async sendSMSNotification(userId: string, message: string): Promise<void> {
    const user = mockUsers.find(u => u.id === userId);
    if (user?.phone) {
      // Integração com serviço de SMS seria implementada aqui
      console.log(`📱 SMS para ${user.phone}: ${message}`);
    }
  }

  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Métodos para agendar notificações
  scheduleNotification(
    templateId: string,
    userId: string,
    variables: Record<string, string>,
    scheduleTime: Date
  ): void {
    const delay = scheduleTime.getTime() - Date.now();

    if (delay > 0) {
      setTimeout(() => {
        this.sendTemplatedNotification(templateId, userId, variables);
      }, delay);

      observability.service.call('notification.scheduled', {
        templateId,
        userId,
        scheduleTime,
        delay
      });
    }
  }

  // Métricas e analytics
  getNotificationMetrics(): {
    totalSent: number;
    pushSubscriptions: number;
    templateUsage: Record<string, number>;
    channelPerformance: Record<string, number>;
  } {
    return {
      totalSent: notifications.length,
      pushSubscriptions: this.subscriptions.size,
      templateUsage: {},
      channelPerformance: {}
    };
  }

  // Métodos adicionais necessários para o useNotifications
  async initialize(): Promise<void> {
    // O serviço já é inicializado no construtor
    // Este método existe apenas para compatibilidade
    return Promise.resolve();
  }

  getStatus(): {
    isServiceWorkerRegistered: boolean;
    isPushSupported: boolean;
    hasPermission: boolean;
    isSubscribed: boolean;
    endpoint: string | null;
  } {
    return {
      isServiceWorkerRegistered: !!this.pushManager,
      isPushSupported: 'PushManager' in window && 'serviceWorker' in navigator,
      hasPermission: Notification.permission === 'granted',
      isSubscribed: this.subscriptions.size > 0,
      endpoint: this.subscriptions.values().next().value?.endpoint || null
    };
  }

  getUserPreferences(userId: string): {
    push: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
  } {
    // Retorna preferências padrão
    return {
      push: true,
      email: true,
      sms: false,
      inApp: true
    };
  }

  updateUserPreferences(userId: string, preferences: any): boolean {
    // Simula atualização de preferências
    // Em uma implementação real, isso seria salvo no banco de dados
    return true;
  }

  sendInAppNotification(userId: string, config: PushNotificationConfig): void {
    this.sendInAppNotification(userId, config);
  }
}

// Singleton instance da versão melhorada
export const enhancedNotificationService = EnhancedNotificationService.getInstance();

const notifications: Notification[] = [...mockNotifications];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const generateRemindersIfNeeded = async (user: User | null): Promise<void> => {
    if (!user) return;

    const todayStr = new Date().toDateString();

    // --- Therapist In-App and Patient WhatsApp Appointment Reminders ---
    if (user.role === Role.Therapist || user.role === Role.Admin) {
        const reminderKey = `appointment_reminder_sent_${user.id}_${todayStr}`;
        if (sessionStorage.getItem(reminderKey)) return;

        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);

        const upcomingAppointments = mockAppointments.filter(app => {
            const appDate = app.startTime;
            return (
                app.therapistId === user.id &&
                (appDate.toDateString() === now.toDateString() || appDate.toDateString() === tomorrow.toDateString()) &&
                app.status === AppointmentStatus.Scheduled
            );
        });
        
        // In-app reminders for therapists
        upcomingAppointments.forEach(app => {
             const reminderExists = notifications.some(n => 
                n.userId === user.id &&
                n.type === 'appointment_reminder' &&
                n.message.includes(app.patientName) &&
                n.message.includes(app.startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
             );

             if (!reminderExists) {
                  const when = app.startTime.toDateString() === now.toDateString() ? 'hoje' : 'amanhã';
                  const newNotification: Notification = {
                      id: `notif_appt_${app.id}`,
                      userId: user.id,
                      message: `Lembrete: Consulta com ${app.patientName} ${when} às ${app.startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`,
                      isRead: false,
                      createdAt: new Date(),
                      type: 'appointment_reminder',
                  };
                  notifications.unshift(newNotification);
             }
        });

        // WhatsApp reminders for patients (for today's appointments)
        const todaysAppointmentsForWhatsapp = upcomingAppointments.filter(app => app.startTime.toDateString() === todayStr && app.startTime > now);
        for (const app of todaysAppointmentsForWhatsapp) {
            const patient = mockPatients.find(p => p.id === app.patientId);
            if (patient) {
                await whatsappService.sendAppointmentReminder(app, patient, 0); 
            }
        }
        
        if (upcomingAppointments.length > 0) {
             sessionStorage.setItem(reminderKey, 'true');
        }
    }
    
    // --- Patient In-App Exercise Reminders ---
    if (user.role === Role.Patient && user.patientId) {
        const reminderKey = `exercise_reminder_sent_${user.id}_${todayStr}`;
        if (sessionStorage.getItem(reminderKey)) return;

        const plan = await treatmentService.getPlanByPatientId(user.patientId);
        if (plan?.exercises && plan.exercises.length > 0) {
            const newNotification: Notification = {
                id: `notif_ex_${Date.now()}`,
                userId: user.id,
                message: 'Lembrete diário: Não se esqueça de fazer seus exercícios de hoje para acelerar sua recuperação!',
                isRead: false,
                createdAt: new Date(),
                type: 'exercise_reminder',
            };
            notifications.unshift(newNotification);
            sessionStorage.setItem(reminderKey, 'true');
        }
    }
};

export const getNotifications = async (userId: string): Promise<Notification[]> => {
    await delay(300);
    return [...notifications]
        .filter(n => n.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const markAsRead = async (notificationId: string, userId: string): Promise<Notification | undefined> => {
    await delay(100);
    const notification = notifications.find(n => n.id === notificationId && n.userId === userId);
    if (notification) {
        notification.isRead = true;
    }
    return notification;
};

export const markAllAsRead = async (userId: string): Promise<Notification[]> => {
    await delay(200);
    const userNotifications = notifications.filter(n => n.userId === userId);
    userNotifications.forEach(n => n.isRead = true);
    return userNotifications;
};

export const sendBroadcast = async (message: string, targetGroup: Role): Promise<void> => {
    await delay(500);
    const targetUsers = mockUsers.filter(u => u.role === targetGroup);
    
    targetUsers.forEach(user => {
        const newNotification: Notification = {
            id: `notif_${Date.now()}_${user.id}`,
            userId: user.id,
            message: `Comunicado: ${message}`,
            isRead: false,
            createdAt: new Date(),
            type: 'announcement',
        };
        notifications.unshift(newNotification);
    });
};

export const notifySchedulingAlert = async (alert: SchedulingAlert) => {
  const messageMap: Record<SchedulingAlert['alertType'], string> = {
    patient_no_show_warning: `Paciente com histórico de faltas: ${alert.payload?.noShowCount || ''}`,
    open_slot: 'Horário livre aguardando preenchimento.',
    inactive_patient: 'Paciente sem agendamento recente.'
  };

  const message = messageMap[alert.alertType] || 'Alerta de agenda';

  toast(message, { type: 'info', autoClose: 8000 });

  if (alert.alertType === 'patient_no_show_warning') {
    await sendEmail({
      to: 'recepcao@fisioflow.com',
      subject: 'Paciente com múltiplas faltas',
      body: JSON.stringify(alert.payload, null, 2)
    });
  }

  if (alert.alertType === 'open_slot') {
    // await sendWhatsAppMessage({
    //   to: 'whatsapp:+5511999999999',
    //   templateId: 'open_slot_notification',
    //   data: alert.payload
    // });
    console.log('WhatsApp message would be sent:', alert.payload);
  }
};
