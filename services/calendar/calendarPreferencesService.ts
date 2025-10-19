/**
 * Calendar Preferences Service
 * Gerencia preferências de calendário dos pacientes
 */

import { supabase } from '../../lib/supabaseClient';
import { CalendarPreferences } from '../../types';

export class CalendarPreferencesService {
  /**
   * Busca preferências de calendário do paciente
   */
  async getPatientPreferences(patientId: string): Promise<CalendarPreferences | null> {
    const { data, error } = await supabase
      .from('communication_preferences')
      .select('*')
      .eq('patient_id', patientId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    // Mapear para CalendarPreferences
    return {
      id: data.id,
      patient_id: data.patient_id,
      auto_send_calendar_invite: data.appointment_notifications || true,
      preferred_calendar: 'google', // Default
      send_via_whatsapp: data.whatsapp_enabled || true,
      send_via_email: data.email_enabled || true,
      send_via_sms: data.sms_enabled || false,
      reminder_hours_before: [24, 2],
      timezone: data.timezone || 'America/Sao_Paulo',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  /**
   * Atualiza preferências de calendário do paciente
   */
  async updatePreferences(
    patientId: string,
    preferences: Partial<CalendarPreferences>
  ): Promise<CalendarPreferences> {
    const { data, error } = await supabase
      .from('communication_preferences')
      .upsert({
        patient_id: patientId,
        appointment_notifications: preferences.auto_send_calendar_invite,
        whatsapp_enabled: preferences.send_via_whatsapp,
        email_enabled: preferences.send_via_email,
        sms_enabled: preferences.send_via_sms,
        timezone: preferences.timezone,
        updated_at: new Date().toISOString()
      })
      .eq('patient_id', patientId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      patient_id: data.patient_id,
      auto_send_calendar_invite: data.appointment_notifications || true,
      preferred_calendar: 'google',
      send_via_whatsapp: data.whatsapp_enabled || true,
      send_via_email: data.email_enabled || true,
      send_via_sms: data.sms_enabled || false,
      reminder_hours_before: [24, 2],
      timezone: data.timezone || 'America/Sao_Paulo',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  /**
   * Habilita/desabilita envio automático de convites
   */
  async toggleAutoSend(patientId: string, enabled: boolean): Promise<void> {
    const { error } = await supabase
      .from('communication_preferences')
      .upsert({
        patient_id: patientId,
        appointment_notifications: enabled,
        updated_at: new Date().toISOString()
      })
      .eq('patient_id', patientId);

    if (error) throw error;
  }

  /**
   * Cria preferências padrão para um paciente
   */
  async createDefaultPreferences(patientId: string): Promise<CalendarPreferences> {
    const { data, error } = await supabase
      .from('communication_preferences')
      .insert({
        patient_id: patientId,
        appointment_notifications: true,
        whatsapp_enabled: true,
        email_enabled: true,
        sms_enabled: false,
        reminder_notifications: true,
        payment_notifications: true,
        marketing_notifications: false,
        birthday_messages: true,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        preferred_days: [1, 2, 3, 4, 5], // Mon-Fri
        timezone: 'America/Sao_Paulo',
        max_messages_per_day: 5,
        max_messages_per_week: 20
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      patient_id: data.patient_id,
      auto_send_calendar_invite: data.appointment_notifications || true,
      preferred_calendar: 'google',
      send_via_whatsapp: data.whatsapp_enabled || true,
      send_via_email: data.email_enabled || true,
      send_via_sms: data.sms_enabled || false,
      reminder_hours_before: [24, 2],
      timezone: data.timezone || 'America/Sao_Paulo',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }
}

// Export singleton instance
export const calendarPreferencesService = new CalendarPreferencesService();

