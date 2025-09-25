// Calendar Integration System - Main Entry Point
// Export all calendar integration components

// Core services
export { CalendarService } from './CalendarService';
export { CalendarFactory, calendarFactory } from './CalendarFactory';
export { CalendarQueue } from './CalendarQueue';
export { CalendarMonitor, calendarMonitor } from './CalendarMonitor';

// Provider implementations
export { ICSService } from './ICSService';
export { GoogleCalendarService } from './GoogleCalendarService';
export { OutlookService } from './OutlookService';

// Register providers with factory
import { CalendarFactory } from './CalendarFactory';
import { ICSService } from './ICSService';
import { GoogleCalendarService } from './GoogleCalendarService';
import { OutlookService } from './OutlookService';

// Register all available providers
CalendarFactory.register('ics', ICSService);
CalendarFactory.register('google', GoogleCalendarService);
CalendarFactory.register('outlook', OutlookService);

// Example usage and helper functions
import {
  Appointment,
  CalendarEvent,
  CalendarPreferences,
  CalendarIntegration
} from '../../../types';

/**
 * Main Calendar Integration Manager
 * Provides high-level API for calendar operations
 */
export class CalendarIntegrationManager {
  private queue: any; // CalendarQueue type
  private monitor: any; // CalendarMonitor type

  constructor(queueConfig: any) {
    this.queue = new CalendarQueue(queueConfig);
    this.monitor = calendarMonitor;
  }

  /**
   * Send calendar invite for appointment
   */
  async sendCalendarInvite(appointment: Appointment): Promise<string> {
    const startTime = Date.now();

    try {
      const jobId = await this.queue.addCalendarInvite(appointment);

      this.monitor.recordOperation(
        'system',
        'send_invite_queued',
        true,
        Date.now() - startTime
      );

      return jobId;
    } catch (error) {
      this.monitor.recordOperation(
        'system',
        'send_invite_queued',
        false,
        Date.now() - startTime,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Update existing calendar invite
   */
  async updateCalendarInvite(
    appointmentId: string,
    changes: Partial<Appointment>
  ): Promise<string> {
    const startTime = Date.now();

    try {
      const jobId = await this.queue.updateCalendarInvite(appointmentId, changes);

      this.monitor.recordOperation(
        'system',
        'update_invite_queued',
        true,
        Date.now() - startTime
      );

      return jobId;
    } catch (error) {
      this.monitor.recordOperation(
        'system',
        'update_invite_queued',
        false,
        Date.now() - startTime,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Cancel calendar invite
   */
  async cancelCalendarInvite(appointmentId: string): Promise<string> {
    const startTime = Date.now();

    try {
      const jobId = await this.queue.cancelCalendarInvite(appointmentId);

      this.monitor.recordOperation(
        'system',
        'cancel_invite_queued',
        true,
        Date.now() - startTime
      );

      return jobId;
    } catch (error) {
      this.monitor.recordOperation(
        'system',
        'cancel_invite_queued',
        false,
        Date.now() - startTime,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Test calendar provider connection
   */
  async testProvider(provider: string, config: any): Promise<{
    success: boolean;
    error?: string;
    features?: string[];
  }> {
    const startTime = Date.now();

    try {
      const result = await CalendarFactory.testProvider(provider, config);

      this.monitor.recordOperation(
        provider,
        'test_connection',
        result.success,
        Date.now() - startTime,
        result.error
      );

      return result;
    } catch (error) {
      this.monitor.recordOperation(
        provider,
        'test_connection',
        false,
        Date.now() - startTime,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Get system metrics
   */
  getMetrics() {
    return this.monitor.generateMetricsReport();
  }

  /**
   * Get system health status
   */
  getHealthStatus() {
    return this.monitor.getSystemHealthSummary();
  }

  /**
   * Get queue statistics
   */
  getQueueStats() {
    return this.queue.getQueueStats();
  }
}

/**
 * Helper function to convert appointment to calendar event
 */
export function appointmentToCalendarEvent(
  appointment: Appointment,
  patient: any,
  preferences?: CalendarPreferences
): CalendarEvent {
  return {
    title: appointment.title,
    description: `Consulta de ${appointment.type}\n\nPaciente: ${appointment.patientName}\n\nObservações: ${appointment.observations || 'Nenhuma observação'}`,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    location: {
      name: 'DuduFisio - Clínica de Fisioterapia',
      address: 'Endereço da clínica' // Configure based on your clinic
    },
    attendees: [
      {
        email: patient.email,
        name: patient.name,
        required: true
      }
    ],
    reminders: preferences?.reminderTimes.map(minutes => ({
      method: 'email' as const,
      minutesBefore: minutes
    })) || [
      { method: 'email', minutesBefore: 24 * 60 }, // 1 day before
      { method: 'email', minutesBefore: 60 } // 1 hour before
    ],
    recurrence: appointment.recurrenceRule,
    timeZone: preferences?.timeZone || 'America/Sao_Paulo',
    privacy: 'private',
    metadata: {
      appointmentId: appointment.id,
      appointmentType: appointment.type,
      patientId: appointment.patientId,
      therapistId: appointment.therapistId,
      clinicName: 'DuduFisio'
    }
  };
}

/**
 * Default configuration for calendar integration
 */
export const defaultCalendarConfig = {
  queue: {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0')
    },
    maxConcurrency: 5,
    defaultDelay: 0
  },
  providers: {
    google: {
      serviceAccount: process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT
        ? JSON.parse(process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT)
        : null,
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary'
    },
    outlook: {
      clientId: process.env.MICROSOFT_GRAPH_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_GRAPH_CLIENT_SECRET,
      tenantId: process.env.MICROSOFT_GRAPH_TENANT_ID
    },
    ics: {
      fromEmail: process.env.CALENDAR_FROM_EMAIL || 'noreply@dudufisio.com',
      fromName: process.env.CALENDAR_FROM_NAME || 'DuduFisio',
      emailService: process.env.EMAIL_HOST ? {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER || '',
          pass: process.env.EMAIL_PASS || ''
        }
      } : undefined
    }
  }
};

/**
 * Create a global calendar integration manager instance
 */
export function createCalendarManager(config = defaultCalendarConfig) {
  return new CalendarIntegrationManager(config.queue);
}

// Default instance for easy access
export const calendarManager = createCalendarManager();