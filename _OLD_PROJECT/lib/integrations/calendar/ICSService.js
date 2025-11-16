import { CalendarService } from './CalendarService';
import { CalendarFeature } from '../../../types';
export class ICSService extends CalendarService {
    constructor(config) {
        super(config);
        this.name = 'ics';
        this.supportedFeatures = [
            CalendarFeature.CREATE_EVENT,
            CalendarFeature.REMINDERS,
            CalendarFeature.ATTENDEES
        ];
        this.icsConfig = config;
    }
    async createEvent(event) {
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
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    async updateEvent(eventId, event) {
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
    async deleteEvent(eventId) {
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
    async getAvailability(timeRange) {
        // ICS service doesn't support availability checking
        return [];
    }
    generateICS(event) {
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
            icsContent.push(`ATTENDEE;CN=${this.escapeICSText(attendee.name)};RSVP=TRUE:MAILTO:${attendee.email}`);
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
    formatDateForICS(date) {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
    escapeICSText(text) {
        if (!text)
            return '';
        return text
            .replace(/\\/g, '\\\\')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '');
    }
    generateRRule(recurrence) {
        if (!recurrence || recurrence.frequency !== 'weekly') {
            return null;
        }
        const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        const byDay = recurrence.days.map((day) => dayMap[day]).join(',');
        const until = recurrence.until ? this.formatDateForICS(new Date(recurrence.until)) : '';
        let rrule = 'FREQ=WEEKLY';
        if (byDay)
            rrule += `;BYDAY=${byDay}`;
        if (until)
            rrule += `;UNTIL=${until}`;
        return rrule;
    }
    async sendEmailWithICSAttachment(event, icsContent) {
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
    generateEmailBody(event) {
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
    async testConnection() {
        try {
            // Test ICS generation with a simple event
            const testEvent = {
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
            }
            else {
                throw new Error('Invalid ICS content generated');
            }
        }
        catch (error) {
            return this.handleError(error);
        }
    }
}
