import { format } from 'date-fns';

export type CalendarProvider = 'google' | 'outlook' | 'apple';

export interface CalendarEvent {
  title: string;
  description: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[];
}

export interface AppointmentData {
  id: string;
  type?: string;
  patientName: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  therapistName?: string;
  notes?: string;
  status?: string;
}

/**
 * Service para sincronização com calendários externos
 * Adaptado para Next.js App Router
 */
export class CalendarSyncService {
  /**
   * Gera URL para adicionar evento ao Google Calendar
   */
  static generateGoogleCalendarUrl(appointment: AppointmentData): string {
    const baseUrl = 'https://calendar.google.com/calendar/render';

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${appointment.type || 'Consulta'} - ${appointment.patientName}`,
      details: this.buildEventDescription(appointment),
      location: appointment.location || 'Clínica',
      dates: `${format(appointment.startTime, "yyyyMMdd'T'HHmmss")}/${format(
        appointment.endTime,
        "yyyyMMdd'T'HHmmss"
      )}`,
      ctz: 'America/Sao_Paulo',
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Gera URL para adicionar evento ao Outlook Calendar
   */
  static generateOutlookCalendarUrl(appointment: AppointmentData): string {
    const baseUrl = 'https://outlook.office.com/calendar/0/deeplink/compose';

    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: `${appointment.type || 'Consulta'} - ${appointment.patientName}`,
      body: this.buildEventDescription(appointment),
      location: appointment.location || 'Clínica',
      startdt: appointment.startTime.toISOString(),
      enddt: appointment.endTime.toISOString(),
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Gera arquivo .ics para download (compatível com Apple Calendar e outros)
   */
  static generateICalFile(appointment: AppointmentData): string {
    const icsContent = this.buildICalContent(appointment);
    return icsContent;
  }

  /**
   * Constrói conteúdo do arquivo iCal
   */
  private static buildICalContent(appointment: AppointmentData): string {
    const formatDate = (date: Date): string => {
      return format(date, "yyyyMMdd'T'HHmmss");
    };

    const description = this.buildEventDescription(appointment)
      .replace(/\n/g, '\\n')
      .replace(/,/g, '\\,');

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//FisioFlow//Agenda//PT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${appointment.id}@fisioflow.com`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(appointment.startTime)}`,
      `DTEND:${formatDate(appointment.endTime)}`,
      `SUMMARY:${appointment.type || 'Consulta'} - ${appointment.patientName}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${appointment.location || 'Clínica'}`,
      `STATUS:${appointment.status === 'concluido' ? 'CONFIRMED' : 'TENTATIVE'}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT30M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Lembrete: Consulta em 30 minutos',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  }

  /**
   * Constrói descrição do evento
   */
  private static buildEventDescription(appointment: AppointmentData): string {
    let description = `Consulta com ${appointment.patientName}`;

    if (appointment.therapistName) {
      description += `\nFisioterapeuta: ${appointment.therapistName}`;
    }

    if (appointment.notes) {
      description += `\n\nObservações:\n${appointment.notes}`;
    }

    return description;
  }

  /**
   * Gera link de calendário baseado no provider
   */
  static generateCalendarLink(
    appointment: AppointmentData,
    provider: CalendarProvider
  ): string {
    switch (provider) {
      case 'google':
        return this.generateGoogleCalendarUrl(appointment);
      case 'outlook':
        return this.generateOutlookCalendarUrl(appointment);
      case 'apple':
        // Apple Calendar usa arquivo .ics
        return this.generateICalFile(appointment);
      default:
        return this.generateGoogleCalendarUrl(appointment);
    }
  }
}

