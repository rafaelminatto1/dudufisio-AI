import { EnrichedAppointment } from '../types';
import { format } from 'date-fns';

export type CalendarProvider = 'google' | 'outlook' | 'apple';

interface CalendarEvent {
  title: string;
  description: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[];
}

class CalendarSyncService {
  /**
   * Gera URL para adicionar evento ao Google Calendar
   */
  generateGoogleCalendarUrl(appointment: EnrichedAppointment): string {
    const baseUrl = 'https://calendar.google.com/calendar/render';
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${appointment.type} - ${appointment.patientName}`,
      details: this.buildEventDescription(appointment),
      location: appointment.location || 'Clínica FisioFlow',
      dates: `${format(appointment.startTime, "yyyyMMdd'T'HHmmss")}/${format(appointment.endTime, "yyyyMMdd'T'HHmmss")}`,
      ctz: 'America/Sao_Paulo'
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Gera URL para adicionar evento ao Outlook Calendar
   */
  generateOutlookCalendarUrl(appointment: EnrichedAppointment): string {
    const baseUrl = 'https://outlook.office.com/calendar/0/deeplink/compose';
    
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: `${appointment.type} - ${appointment.patientName}`,
      body: this.buildEventDescription(appointment),
      location: appointment.location || 'Clínica FisioFlow',
      startdt: appointment.startTime.toISOString(),
      enddt: appointment.endTime.toISOString()
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Gera arquivo .ics para download (compatível com Apple Calendar e outros)
   */
  generateICalFile(appointment: EnrichedAppointment): void {
    const icsContent = this.buildICalContent(appointment);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `agendamento_${appointment.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Constrói conteúdo do arquivo iCal
   */
  private buildICalContent(appointment: EnrichedAppointment): string {
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
      `SUMMARY:${appointment.type} - ${appointment.patientName}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${appointment.location || 'Clínica FisioFlow'}`,
      `STATUS:${appointment.status === 'completed' ? 'CONFIRMED' : 'TENTATIVE'}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT30M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Lembrete: Consulta em 30 minutos',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  }

  /**
   * Constrói descrição do evento
   */
  private buildEventDescription(appointment: EnrichedAppointment): string {
    const lines = [
      `📋 Tipo: ${appointment.type}`,
      `👤 Paciente: ${appointment.patientName}`,
      `👨‍⚕️ Terapeuta: ${appointment.therapistName || 'Não definido'}`,
      `📞 Telefone: ${appointment.patientPhone || 'Não informado'}`,
      `💰 Valor: R$ ${appointment.value.toFixed(2)}`,
      `💳 Pagamento: ${appointment.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}`
    ];

    if (appointment.sessionNumber && appointment.totalSessions) {
      lines.push(`🔢 Sessão: ${appointment.sessionNumber}/${appointment.totalSessions}`);
    }

    if (appointment.notes) {
      lines.push(``, `📝 Observações:`, appointment.notes);
    }

    lines.push(``, `---`, `Gerado por FisioFlow`);

    return lines.join('\n');
  }

  /**
   * Abre calendário do provedor especificado
   */
  openCalendarProvider(provider: CalendarProvider, appointment: EnrichedAppointment): void {
    switch (provider) {
      case 'google':
        window.open(this.generateGoogleCalendarUrl(appointment), '_blank');
        break;
      case 'outlook':
        window.open(this.generateOutlookCalendarUrl(appointment), '_blank');
        break;
      case 'apple':
        this.generateICalFile(appointment);
        break;
    }
  }

  /**
   * Copia informações do evento para clipboard
   */
  async copyEventToClipboard(appointment: EnrichedAppointment): Promise<boolean> {
    const text = [
      `📅 ${format(appointment.startTime, "dd/MM/yyyy 'às' HH:mm")}`,
      ``,
      this.buildEventDescription(appointment)
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Erro ao copiar para clipboard:', error);
      return false;
    }
  }

  /**
   * Gera múltiplos eventos (para exportação em lote)
   */
  generateMultipleICalFile(appointments: EnrichedAppointment[], filename?: string): void {
    const events = appointments.map((appointment, index) => {
      const formatDate = (date: Date): string => {
        return format(date, "yyyyMMdd'T'HHmmss");
      };

      const description = this.buildEventDescription(appointment)
        .replace(/\n/g, '\\n')
        .replace(/,/g, '\\,');

      return [
        'BEGIN:VEVENT',
        `UID:${appointment.id}@fisioflow.com`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${formatDate(appointment.startTime)}`,
        `DTEND:${formatDate(appointment.endTime)}`,
        `SUMMARY:${appointment.type} - ${appointment.patientName}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${appointment.location || 'Clínica FisioFlow'}`,
        `STATUS:${appointment.status === 'completed' ? 'CONFIRMED' : 'TENTATIVE'}`,
        'BEGIN:VALARM',
        'TRIGGER:-PT30M',
        'ACTION:DISPLAY',
        'DESCRIPTION:Lembrete: Consulta em 30 minutos',
        'END:VALARM',
        'END:VEVENT'
      ].join('\r\n');
    });

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//FisioFlow//Agenda//PT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...events,
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `agenda_${format(new Date(), 'yyyy-MM-dd')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const calendarSyncService = new CalendarSyncService();
