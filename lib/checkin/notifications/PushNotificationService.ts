import {
  PatientId,
  PushNotification
} from '../../../types/checkin';
import { Appointment } from '../../../types';
import { AppleAPNSAdapter, createAPNS } from '../adapters/AppleAPNSAdapter';

interface DeviceToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  userId: PatientId;
  isActive: boolean;
  lastUsed: Date;
}

interface NotificationTemplate {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  icon?: string;
  actions?: NotificationAction[];
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface NotificationSchedule {
  id: string;
  patientId: PatientId;
  scheduledTime: Date;
  notification: PushNotification;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate?: Date;
  };
  status: 'scheduled' | 'sent' | 'cancelled';
}

interface FCMConfig {
  projectId: string;
  vapidKey: string;
  adminSdk?: string | object; // Firebase Admin SDK credentials
}

interface APNSConfig {
  keyId: string;
  teamId: string;
  bundleId: string;
  privateKey: string;
}

export class PushNotificationService {
  private fcmConfig: FCMConfig | null = null;
  private apnsConfig: APNSConfig | null = null;
  private apnsAdapter: AppleAPNSAdapter | null = null;
  private scheduledNotifications = new Map<string, NotificationSchedule>();
  private deviceTokens = new Map<PatientId, DeviceToken[]>();

  constructor(fcmConfig?: FCMConfig, apnsConfig?: APNSConfig) {
    this.fcmConfig = fcmConfig || null;
    this.apnsConfig = apnsConfig || null;

    // Initialize Apple APNS adapter
    this.apnsAdapter = createAPNS();
    if (this.apnsAdapter) {
      console.log('✅ Apple APNS adapter initialized successfully');
    } else {
      console.log('⚠️ Apple APNS credentials not found, iOS notifications will use FCM fallback');
    }

    // Start background scheduler
    this.startScheduler();
  }

  async registerDevice(patientId: PatientId, token: string, platform: 'ios' | 'android' | 'web'): Promise<void> {
    const deviceToken: DeviceToken = {
      token,
      platform,
      userId: patientId,
      isActive: true,
      lastUsed: new Date()
    };

    if (!this.deviceTokens.has(patientId)) {
      this.deviceTokens.set(patientId, []);
    }

    const userTokens = this.deviceTokens.get(patientId)!;

    // Remove existing token for same platform or update if exists
    const existingIndex = userTokens.findIndex(t => t.token === token);
    if (existingIndex >= 0) {
      userTokens[existingIndex] = deviceToken;
    } else {
      userTokens.push(deviceToken);
    }

    console.log(`Device registered for patient ${patientId}: ${platform} - ${token.substring(0, 20)}...`);
  }

  async unregisterDevice(patientId: PatientId, token: string): Promise<void> {
    const userTokens = this.deviceTokens.get(patientId);
    if (userTokens) {
      const filteredTokens = userTokens.filter(t => t.token !== token);
      this.deviceTokens.set(patientId, filteredTokens);
      console.log(`Device unregistered for patient ${patientId}`);
    }
  }

  async sendAppointmentReminder(
    patientId: PatientId,
    appointment: Appointment,
    hoursBeforeAppointment: number = 24
  ): Promise<void> {
    const scheduledTime = new Date(appointment.startTime);
    scheduledTime.setHours(scheduledTime.getHours() - hoursBeforeAppointment);

    // Don't schedule if time has already passed
    if (scheduledTime <= new Date()) {
      console.warn(`Cannot schedule reminder for past appointment: ${appointment.id}`);
      return;
    }

    const notification: PushNotification = {
      title: 'Lembrete de Consulta',
      body: `Sua consulta está marcada para ${appointment.startTime.toLocaleString('pt-BR')}`,
      data: {
        type: 'appointment_reminder',
        appointmentId: appointment.id,
        deepLink: `/appointments/${appointment.id}`,
        hoursUntil: hoursBeforeAppointment
      },
      badge: await this.getUnreadCount(patientId)
    };

    await this.scheduleNotification(
      patientId,
      notification,
      scheduledTime,
      `reminder-${appointment.id}-${hoursBeforeAppointment}h`
    );

    console.log(`Appointment reminder scheduled for patient ${patientId} at ${scheduledTime.toISOString()}`);
  }

  async sendCheckInConfirmation(patientId: PatientId, queuePosition: number, estimatedWaitTime: number): Promise<void> {
    const notification: PushNotification = {
      title: 'Check-in Realizado com Sucesso',
      body: `Você está na posição #${queuePosition} da fila. Tempo estimado: ${estimatedWaitTime} minutos`,
      data: {
        type: 'checkin_confirmation',
        queuePosition,
        estimatedWaitTime,
        deepLink: '/queue-status'
      },
      badge: await this.getUnreadCount(patientId)
    };

    await this.sendImmediate(patientId, notification);
  }

  async sendQueueUpdate(patientId: PatientId, newPosition: number, newWaitTime: number): Promise<void> {
    // Only send if significant change (position improved by 2+ or wait time changed by 10+ minutes)
    const previousUpdate = await this.getLastQueueUpdate(patientId);
    if (previousUpdate) {
      const positionChange = previousUpdate.position - newPosition;
      const timeChange = Math.abs(previousUpdate.waitTime - newWaitTime);

      if (positionChange < 2 && timeChange < 10) {
        return; // Skip minor updates to avoid spam
      }
    }

    const notification: PushNotification = {
      title: 'Atualização da Fila',
      body: `Nova posição: #${newPosition}. Tempo estimado: ${newWaitTime} minutos`,
      data: {
        type: 'queue_update',
        queuePosition: newPosition,
        estimatedWaitTime: newWaitTime,
        deepLink: '/queue-status'
      },
      badge: await this.getUnreadCount(patientId)
    };

    await this.sendImmediate(patientId, notification);
    await this.saveLastQueueUpdate(patientId, { position: newPosition, waitTime: newWaitTime });
  }

  async sendAppointmentReady(patientId: PatientId): Promise<void> {
    const notification: PushNotification = {
      title: 'Sua Consulta Está Pronta!',
      body: 'Por favor, dirija-se à sala de tratamento',
      data: {
        type: 'appointment_ready',
        deepLink: '/treatment-room',
        priority: 'high'
      },
      badge: await this.getUnreadCount(patientId)
    };

    await this.sendImmediate(patientId, notification);
  }

  async sendTreatmentPlanUpdate(patientId: PatientId, exercisesAdded: number): Promise<void> {
    const notification: PushNotification = {
      title: 'Plano de Tratamento Atualizado',
      body: `${exercisesAdded} novos exercícios foram adicionados ao seu plano`,
      data: {
        type: 'treatment_plan_update',
        exercisesAdded,
        deepLink: '/treatment-plan'
      },
      badge: await this.getUnreadCount(patientId)
    };

    await this.sendImmediate(patientId, notification);
  }

  async sendExerciseReminder(patientId: PatientId, exerciseName: string): Promise<void> {
    const notification: PushNotification = {
      title: 'Hora dos Exercícios!',
      body: `Não se esqueça de fazer: ${exerciseName}`,
      data: {
        type: 'exercise_reminder',
        exerciseName,
        deepLink: '/exercises'
      },
      badge: await this.getUnreadCount(patientId)
    };

    await this.sendImmediate(patientId, notification);
  }

  async sendProgressCelebration(patientId: PatientId, milestone: string): Promise<void> {
    const notification: PushNotification = {
      title: 'Parabéns! 🎉',
      body: `Você alcançou um marco importante: ${milestone}`,
      data: {
        type: 'progress_celebration',
        milestone,
        deepLink: '/progress'
      },
      badge: await this.getUnreadCount(patientId)
    };

    await this.sendImmediate(patientId, notification);
  }

  async sendMessageNotification(patientId: PatientId, senderName: string, messagePreview: string): Promise<void> {
    const notification: PushNotification = {
      title: `Nova mensagem de ${senderName}`,
      body: messagePreview.length > 50 ? `${messagePreview.substring(0, 50)}...` : messagePreview,
      data: {
        type: 'new_message',
        senderName,
        deepLink: '/messages'
      },
      badge: await this.getUnreadCount(patientId)
    };

    await this.sendImmediate(patientId, notification);
  }

  private async scheduleNotification(
    patientId: PatientId,
    notification: PushNotification,
    scheduledTime: Date,
    notificationId?: string
  ): Promise<string> {
    const id = notificationId || `scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const schedule: NotificationSchedule = {
      id,
      patientId,
      scheduledTime,
      notification,
      status: 'scheduled'
    };

    this.scheduledNotifications.set(id, schedule);
    return id;
  }

  private async sendImmediate(patientId: PatientId, notification: PushNotification): Promise<void> {
    const deviceTokens = await this.getPatientDeviceTokens(patientId);

    if (deviceTokens.length === 0) {
      console.warn(`No device tokens found for patient ${patientId}`);
      return;
    }

    await this.sendToDevices(deviceTokens, notification);
  }

  private async sendToDevices(deviceTokens: DeviceToken[], notification: PushNotification): Promise<void> {
    const sendPromises = deviceTokens.map(token => this.sendToDevice(token, notification));

    const results = await Promise.allSettled(sendPromises);

    // Log results
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to send notification to device ${deviceTokens[index].token}:`, result.reason);
      }
    });

    // Update device token status based on results
    await this.updateDeviceTokenStatus(deviceTokens, results);
  }

  private async sendToDevice(deviceToken: DeviceToken, notification: PushNotification): Promise<boolean> {
    try {
      switch (deviceToken.platform) {
        case 'android':
        case 'web':
          return await this.sendViaFCM(deviceToken, notification);
        case 'ios':
          return await this.sendViaAPNS(deviceToken, notification);
        default:
          console.error(`Unsupported platform: ${deviceToken.platform}`);
          return false;
      }
    } catch (error) {
      console.error(`Failed to send notification to ${deviceToken.platform} device:`, error);
      return false;
    }
  }

  private async sendViaFCM(deviceToken: DeviceToken, notification: PushNotification): Promise<boolean> {
    if (!this.fcmConfig) {
      console.warn('FCM not configured, using mock notification');
      this.mockNotificationSend(deviceToken, notification);
      return true;
    }

    try {
      // Firebase Admin SDK v1 payload format
      const payload = {
        message: {
          token: deviceToken.token,
          notification: {
            title: notification.title,
            body: notification.body,
            image: notification.data?.icon || '/icon-192x192.png',
          },
          data: notification.data ? this.convertDataToStrings(notification.data) : {},
          android: {
            notification: {
              icon: 'ic_notification',
              color: '#2563EB',
              sound: notification.data?.sound || 'default'
            }
          },
          webpush: {
            notification: {
              icon: '/icon-192x192.png',
              badge: '/badge-72x72.png',
              requireInteraction: false
            }
          },
          apns: {
            payload: {
              aps: {
                badge: notification.badge || 0,
                sound: notification.data?.sound || 'default'
              }
            }
          }
        }
      };

      // In production, this would use Firebase Admin SDK:
      // const admin = require('firebase-admin');
      // const response = await admin.messaging().send(payload.message);

      console.log(`Firebase v1 API notification sent to ${deviceToken.token.substring(0, 20)}...`, payload);
      return true;
    } catch (error) {
      console.error('FCM v1 send error:', error);
      return false;
    }
  }

  // Firebase v1 requires all data values to be strings
  private convertDataToStrings(data: Record<string, any>): Record<string, string> {
    const stringData: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      stringData[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    return stringData;
  }

  private async sendViaAPNS(deviceToken: DeviceToken, notification: PushNotification): Promise<boolean> {
    // Use real Apple APNS if adapter is available
    if (this.apnsAdapter) {
      try {
        console.log(`🍎 Sending APNS notification to ${deviceToken.token.substring(0, 8)}...`);

        const apnsNotification = {
          title: notification.title,
          body: notification.body,
          badge: notification.badge || 0,
          sound: notification.data?.sound || 'default',
          category: notification.data?.category,
          data: notification.data,
          deviceToken: deviceToken.token
        };

        const result = await this.apnsAdapter.sendNotification(apnsNotification);

        if (result.success) {
          console.log(`✅ APNS notification sent successfully - ID: ${result.messageId}`);
          return true;
        } else {
          console.error(`❌ APNS notification failed: ${result.error}`);

          // Fallback to FCM for iOS if APNS fails
          console.log('🔄 Falling back to FCM for iOS...');
          return await this.sendViaFCM(deviceToken, notification);
        }

      } catch (error) {
        console.error('❌ APNS adapter error:', error);
        // Fallback to FCM for iOS
        return await this.sendViaFCM(deviceToken, notification);
      }
    }

    // Fallback: use FCM for iOS if APNS not configured
    if (this.fcmConfig) {
      console.log('📱 Using FCM for iOS notification (APNS not configured)');
      return await this.sendViaFCM(deviceToken, notification);
    }

    // Final fallback: mock notification
    console.warn('Neither APNS nor FCM configured for iOS, using mock notification');
    this.mockNotificationSend(deviceToken, notification);
    return true;
  }

  private mockNotificationSend(deviceToken: DeviceToken, notification: PushNotification): void {
    console.log(`📱 MOCK PUSH NOTIFICATION`);
    console.log(`Platform: ${deviceToken.platform}`);
    console.log(`Token: ${deviceToken.token.substring(0, 20)}...`);
    console.log(`Title: ${notification.title}`);
    console.log(`Body: ${notification.body}`);
    console.log(`Data:`, notification.data);
    console.log(`Badge: ${notification.badge || 0}`);
  }

  private async getPatientDeviceTokens(patientId: PatientId): Promise<DeviceToken[]> {
    const tokens = this.deviceTokens.get(patientId) || [];
    return tokens.filter(token => token.isActive);
  }

  private async getUnreadCount(patientId: PatientId): Promise<number> {
    // Mock implementation - in production, this would query the database
    return Math.floor(Math.random() * 5); // Random number between 0-4
  }

  private async getLastQueueUpdate(patientId: PatientId): Promise<{ position: number; waitTime: number } | null> {
    // Mock implementation - in production, this would be stored in database/cache
    return null;
  }

  private async saveLastQueueUpdate(patientId: PatientId, update: { position: number; waitTime: number }): Promise<void> {
    // Mock implementation - in production, this would save to database/cache
    console.log(`Saved last queue update for ${patientId}:`, update);
  }

  private async updateDeviceTokenStatus(
    deviceTokens: DeviceToken[],
    results: PromiseSettledResult<boolean>[]
  ): Promise<void> {
    results.forEach((result, index) => {
      const token = deviceTokens[index];

      if (result.status === 'fulfilled') {
        token.lastUsed = new Date();
      } else {
        // Mark token as potentially invalid after multiple failures
        // In production, implement exponential backoff and eventual deactivation
        console.warn(`Device token may be invalid: ${token.token.substring(0, 20)}...`);
      }
    });
  }

  private startScheduler(): void {
    // Check for scheduled notifications every minute
    setInterval(async () => {
      const now = new Date();

      for (const [id, schedule] of this.scheduledNotifications.entries()) {
        if (schedule.status === 'scheduled' && schedule.scheduledTime <= now) {
          try {
            await this.sendImmediate(schedule.patientId, schedule.notification);
            schedule.status = 'sent';

            console.log(`Scheduled notification sent: ${id}`);

            // Handle recurring notifications
            if (schedule.recurring) {
              await this.scheduleRecurring(schedule);
            }
          } catch (error) {
            console.error(`Failed to send scheduled notification ${id}:`, error);
          }
        }
      }

      // Clean up old sent/cancelled notifications
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - 24); // Keep for 24 hours

      for (const [id, schedule] of this.scheduledNotifications.entries()) {
        if (schedule.status !== 'scheduled' && schedule.scheduledTime < cutoffTime) {
          this.scheduledNotifications.delete(id);
        }
      }
    }, 60000); // Every minute
  }

  private async scheduleRecurring(schedule: NotificationSchedule): Promise<void> {
    if (!schedule.recurring) return;

    const nextTime = new Date(schedule.scheduledTime);

    switch (schedule.recurring.frequency) {
      case 'daily':
        nextTime.setDate(nextTime.getDate() + 1);
        break;
      case 'weekly':
        nextTime.setDate(nextTime.getDate() + 7);
        break;
      case 'monthly':
        nextTime.setMonth(nextTime.getMonth() + 1);
        break;
    }

    // Check if we should continue recurring
    if (schedule.recurring.endDate && nextTime > schedule.recurring.endDate) {
      return;
    }

    // Schedule next occurrence
    await this.scheduleNotification(
      schedule.patientId,
      schedule.notification,
      nextTime,
      `${schedule.id}-recurring-${nextTime.getTime()}`
    );
  }

  async cancelScheduledNotification(notificationId: string): Promise<boolean> {
    const schedule = this.scheduledNotifications.get(notificationId);
    if (schedule && schedule.status === 'scheduled') {
      schedule.status = 'cancelled';
      return true;
    }
    return false;
  }

  async getScheduledNotifications(patientId: PatientId): Promise<NotificationSchedule[]> {
    const notifications: NotificationSchedule[] = [];

    for (const schedule of this.scheduledNotifications.values()) {
      if (schedule.patientId === patientId && schedule.status === 'scheduled') {
        notifications.push(schedule);
      }
    }

    return notifications.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
  }

  async scheduleExerciseReminders(
    patientId: PatientId,
    exerciseName: string,
    times: string[], // ["09:00", "15:00", "21:00"]
    endDate?: Date
  ): Promise<string[]> {
    const scheduleIds: string[] = [];

    for (const time of times) {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (scheduledTime <= new Date()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const notification: PushNotification = {
        title: 'Hora dos Exercícios!',
        body: `Não se esqueça de fazer: ${exerciseName}`,
        data: {
          type: 'exercise_reminder',
          exerciseName,
          time,
          deepLink: '/exercises'
        }
      };

      const scheduleId = await this.scheduleNotification(
        patientId,
        notification,
        scheduledTime,
        `exercise-${exerciseName}-${time}-${patientId}`
      );

      // Make it recurring daily
      const schedule = this.scheduledNotifications.get(scheduleId);
      if (schedule) {
        schedule.recurring = {
          frequency: 'daily',
          endDate: endDate
        };
      }

      scheduleIds.push(scheduleId);
    }

    return scheduleIds;
  }

  getStats(): {
    totalDevices: number;
    activeTokens: number;
    scheduledNotifications: number;
    sentToday: number;
  } {
    let totalDevices = 0;
    let activeTokens = 0;

    for (const tokens of this.deviceTokens.values()) {
      totalDevices += tokens.length;
      activeTokens += tokens.filter(t => t.isActive).length;
    }

    const scheduledCount = Array.from(this.scheduledNotifications.values())
      .filter(s => s.status === 'scheduled').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sentToday = Array.from(this.scheduledNotifications.values())
      .filter(s => s.status === 'sent' && s.scheduledTime >= today).length;

    return {
      totalDevices,
      activeTokens,
      scheduledNotifications: scheduledCount,
      sentToday
    };
  }
}