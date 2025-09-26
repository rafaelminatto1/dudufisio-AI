import { CalendarService } from './CalendarService';
import {
  CalendarEvent,
  CalendarResult,
  CalendarFeature,
  TimeRange,
  AvailabilitySlot,
  ProviderConfig
} from '../../../types';

interface ICSConfig extends ProviderConfig {
  emailService?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  fromEmail?: string;
  fromName?: string;
}

export class ICSService extends CalendarService {
  readonly name = 'ics';
  readonly supportedFeatures = [
    CalendarFeature.CREATE_EVENT,
    CalendarFeature.REMINDERS,
    CalendarFeature.ATTENDEES
  ];

  private icsConfig: ICSConfig;

  constructor(config: ICSConfig) {
    super(config);
    this.icsConfig = config;
  }

  async createEvent(event: CalendarEvent): Promise<CalendarResult> {
    try {
      this.validateEvent(event);

      const icsContent = this.generateICS(event);
      const eventId = this.generateEventId();

      // If email service is configured, send email with ICS attachment
      if (this.icsConfig.emailService && event.attendees.length > 0) {
        await this.sendEmailWithICSAttachment(event, icsContent);
      }

      return {
        success: true,
        eventId,
        retryable: false,
        providerResponse: { icsContent }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<CalendarResult> {
    // ICS service doesn't support updating events directly
    // We can only send a new invitation
    return {
      success: false,
      error: {
        code: 'UPDATE_NOT_SUPPORTED',
        message: 'ICS service does not support event updates. Please create a new event.',
        retryable: false
      },
      retryable: false
    };
  }

  async deleteEvent(eventId: string): Promise<CalendarResult> {
    // ICS service doesn't support deleting events directly
    // We would need to send a cancellation email
    return {
      success: false,
      error: {
        code: 'DELETE_NOT_SUPPORTED',
        message: 'ICS service does not support event deletion. Please send a manual cancellation.',
        retryable: false
      },
      retryable: false
    };
  }

  async getAvailability(timeRange: TimeRange): Promise<AvailabilitySlot[]> {
    // ICS service doesn't support availability checking
    return [];
  }

  private generateICS(event: CalendarEvent): string {
    const startDate = this.formatDateForICS(event.startTime);
    const endDate = this.formatDateForICS(event.endTime);
    const now = this.formatDateForICS(new Date());
    const uid = this.generateEventId();

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//DuduFisio//Calendar Integration//PT',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${this.escapeICSText(event.title)}`,
      `DESCRIPTION:${this.escapeICSText(event.description)}`,
      `LOCATION:${this.escapeICSText(this.formatLocation(event.location))}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0'
    ];

    // Add organizer
    const fromEmail = this.icsConfig.fromEmail || 'noreply@dudufisio.com';
    const fromName = this.icsConfig.fromName || 'DuduFisio';
    icsContent.push(`ORGANIZER;CN=${fromName}:MAILTO:${fromEmail}`);

    // Add attendees
    event.attendees.forEach(attendee => {
      icsContent.push(
        `ATTENDEE;CN=${this.escapeICSText(attendee.name)};RSVP=TRUE:MAILTO:${attendee.email}`
      );
    });

    // Add reminders
    if (event.reminders.length > 0) {
      event.reminders.forEach(reminder => {
        icsContent.push('BEGIN:VALARM');
        icsContent.push('ACTION:DISPLAY');
        icsContent.push(`DESCRIPTION:${this.escapeICSText(event.title)}`);
        icsContent.push(`TRIGGER:-PT${reminder.minutesBefore}M`);
        icsContent.push('END:VALARM');
      });
    }

    // Add recurrence if specified
    if (event.recurrence) {
      const rrule = this.generateRRule(event.recurrence);
      if (rrule) {
        icsContent.push(`RRULE:${rrule}`);
      }
    }

    icsContent.push('END:VEVENT');
    icsContent.push('END:VCALENDAR');

    return icsContent.join('\r\n');
  }

  private formatDateForICS(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  private escapeICSText(text: string): string {
    if (!text) return '';
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  }

  private generateRRule(recurrence: any): string | null {
    if (!recurrence || recurrence.frequency !== 'weekly') {
      return null;
    }

    const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const byDay = recurrence.days.map((day: number) => dayMap[day]).join(',');
    const until = recurrence.until ? this.formatDateForICS(new Date(recurrence.until)) : '';

    let rrule = 'FREQ=WEEKLY';
    if (byDay) rrule += `;BYDAY=${byDay}`;
    if (until) rrule += `;UNTIL=${until}`;

    return rrule;
  }

  private async sendEmailWithICSAttachment(event: CalendarEvent, icsContent: string): Promise<void> {
    if (!this.icsConfig.emailService) {
      throw new Error('Email service not configured for ICS delivery');
    }

    // Here you would integrate with your email service (Nodemailer, SendGrid, etc.)
    // For now, we'll just log the action
    console.log('Sending ICS invitation via email:', {
      to: event.attendees.map(a => a.email),
      subject: `Convite: ${event.title}`,
      attachmentSize: icsContent.length
    });

    // Mock email sending
    const emailBody = this.generateEmailBody(event);

    // In a real implementation, you would:
    // 1. Create email transport (nodemailer, etc.)
    // 2. Attach ICS file
    // 3. Send email
    // 4. Handle errors and retries
  }

  private generateEmailBody(event: CalendarEvent): string {
    const startTime = event.startTime.toLocaleString('pt-BR', {
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const endTime = event.endTime.toLocaleString('pt-BR', {
      timeStyle: 'short'
    });

    return `
Olá,

Você foi convidado(a) para o seguinte compromisso:

📅 **${event.title}**

🕒 **Data e Hora:** ${startTime} - ${endTime}
📍 **Local:** ${this.formatLocation(event.location)}

📝 **Descrição:**
${event.description}

Para adicionar este evento ao seu calendário, abra o arquivo anexado (.ics) ou clique no link de convite.

---
DuduFisio - Sistema de Agendamento
Este é um email automático, não responda a esta mensagem.
    `.trim();
  }

  async testConnection(): Promise<CalendarResult> {
    try {
      // Test ICS generation with a simple event
      const testEvent: CalendarEvent = {
        title: 'Test ICS Generation',
        description: 'Testing ICS service functionality',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000), // 1 hour later
        location: { name: 'Test Location' },
        attendees: [{ email: 'test@example.com', name: 'Test User' }],
        reminders: [{ method: 'email', minutesBefore: 15 }],
        metadata: { test: true }
      };

      const icsContent = this.generateICS(testEvent);

      if (icsContent.includes('BEGIN:VCALENDAR') && icsContent.includes('END:VCALENDAR')) {
        return {
          success: true,
          retryable: false,
          providerResponse: { icsGenerated: true, contentLength: icsContent.length }
        };
      } else {
        throw new Error('Invalid ICS content generated');
      }
    } catch (error) {
      return this.handleError(error);
    }
  }
}