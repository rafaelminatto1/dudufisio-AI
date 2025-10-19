/**
 * Calendar Link Service
 * Gerencia geração e armazenamento de links de calendário
 */

import { supabase } from '../../lib/supabaseClient';
import { Appointment } from '../../types';
import {
  generateICS,
  generateGoogleCalendarLink,
  generateOutlookCalendarLink,
  generateYahooCalendarLink
} from '../../lib/calendar/icsGenerator';

export interface CalendarLinks {
  id: string;
  appointment_id: string;
  patient_id: string;
  universal_link: string;
  google_link: string;
  outlook_link?: string;
  yahoo_link?: string;
  apple_ics_link: string;
  event_title: string;
  event_date: string;
  sent_via: string[];
  link_accessed: boolean;
  access_count: number;
  created_at: string;
  updated_at: string;
}

export class CalendarLinkService {
  /**
   * Gera link .ics direto (Edge Function)
   */
  generateICSLink(appointmentId: string): string {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://dudufisio.vercel.app';
    
    return `${baseUrl}/api/calendar/${appointmentId}.ics`;
  }

  /**
   * Gera link Google Calendar
   */
  generateGoogleLink(appointment: Appointment): string {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);
    
    return generateGoogleCalendarLink({
      title: `Consulta - ${appointment.patientName}`,
      description: `Fisioterapia com ${appointment.therapistName || 'Fisioterapeuta'}\n\nTipo: ${appointment.type}\nStatus: ${appointment.status}`,
      startTime: start,
      endTime: end,
      location: appointment.location || 'Clínica DuduFisio',
      organizer: {
        name: appointment.therapistName || 'Fisioterapeuta',
        email: ''
      },
      attendee: {
        name: appointment.patientName,
        email: appointment.email || ''
      }
    });
  }

  /**
   * Gera link Outlook Calendar
   */
  generateOutlookLink(appointment: Appointment): string {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);
    
    return generateOutlookCalendarLink({
      title: `Consulta - ${appointment.patientName}`,
      description: `Fisioterapia com ${appointment.therapistName || 'Fisioterapeuta'}`,
      startTime: start,
      endTime: end,
      location: appointment.location || 'Clínica DuduFisio',
      organizer: {
        name: appointment.therapistName || 'Fisioterapeuta',
        email: ''
      },
      attendee: {
        name: appointment.patientName,
        email: appointment.email || ''
      }
    });
  }

  /**
   * Gera link Yahoo Calendar
   */
  generateYahooLink(appointment: Appointment): string {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);
    
    return generateYahooCalendarLink({
      title: `Consulta - ${appointment.patientName}`,
      description: `Fisioterapia com ${appointment.therapistName || 'Fisioterapeuta'}`,
      startTime: start,
      endTime: end,
      location: appointment.location || 'Clínica DuduFisio',
      organizer: {
        name: appointment.therapistName || 'Fisioterapeuta',
        email: ''
      },
      attendee: {
        name: appointment.patientName,
        email: appointment.email || ''
      }
    });
  }

  /**
   * Gera todos os links de calendário e salva no banco
   */
  async generateAllLinks(appointment: Appointment): Promise<CalendarLinks> {
    const icsLink = this.generateICSLink(appointment.id);
    const googleLink = this.generateGoogleLink(appointment);
    const outlookLink = this.generateOutlookLink(appointment);
    const yahooLink = this.generateYahooLink(appointment);

    // Verificar se já existe link para este appointment
    const { data: existing } = await supabase
      .from('calendar_links')
      .select('*')
      .eq('appointment_id', appointment.id)
      .single();

    if (existing) {
      // Atualizar link existente
      const { data, error } = await supabase
        .from('calendar_links')
        .update({
          universal_link: icsLink,
          google_link: googleLink,
          outlook_link: outlookLink,
          yahoo_link: yahooLink,
          apple_ics_link: icsLink,
          event_title: `Consulta - ${appointment.patientName}`,
          event_date: appointment.startTime,
          updated_at: new Date().toISOString()
        })
        .eq('appointment_id', appointment.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Criar novo link
      const { data, error } = await supabase
        .from('calendar_links')
        .insert({
          appointment_id: appointment.id,
          patient_id: appointment.patientId,
          universal_link: icsLink,
          google_link: googleLink,
          outlook_link: outlookLink,
          yahoo_link: yahooLink,
          apple_ics_link: icsLink,
          event_title: `Consulta - ${appointment.patientName}`,
          event_date: appointment.startTime,
          sent_via: [],
          link_accessed: false,
          access_count: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  /**
   * Busca links de um appointment
   */
  async getLinks(appointmentId: string): Promise<CalendarLinks | null> {
    const { data, error } = await supabase
      .from('calendar_links')
      .select('*')
      .eq('appointment_id', appointmentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  }

  /**
   * Marca link como acessado
   */
  async markAsAccessed(appointmentId: string): Promise<void> {
    const { error } = await supabase
      .from('calendar_links')
      .update({
        link_accessed: true,
        accessed_at: new Date().toISOString(),
        access_count: supabase.raw('access_count + 1')
      })
      .eq('appointment_id', appointmentId);

    if (error) throw error;
  }

  /**
   * Adiciona canal de envio
   */
  async addSentVia(appointmentId: string, channel: 'whatsapp' | 'email' | 'sms'): Promise<void> {
    const { data: existing } = await supabase
      .from('calendar_links')
      .select('sent_via')
      .eq('appointment_id', appointmentId)
      .single();

    if (!existing) return;

    const sentVia = existing.sent_via || [];
    if (!sentVia.includes(channel)) {
      sentVia.push(channel);

      const { error } = await supabase
        .from('calendar_links')
        .update({ sent_via: sentVia })
        .eq('appointment_id', appointmentId);

      if (error) throw error;
    }
  }

  /**
   * Deleta links de um appointment
   */
  async deleteLinks(appointmentId: string): Promise<void> {
    const { error } = await supabase
      .from('calendar_links')
      .delete()
      .eq('appointment_id', appointmentId);

    if (error) throw error;
  }
}

// Export singleton instance
export const calendarLinkService = new CalendarLinkService();

