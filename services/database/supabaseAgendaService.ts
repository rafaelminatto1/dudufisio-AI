/**
 * Supabase Agenda Service
 * 
 * Handles all agenda-related database operations using Supabase
 */

import { createClient } from '@supabase/supabase-js';
import type { Appointment, Patient, Therapist, WaitlistEntry } from '../../types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured');
}

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Supabase Agenda Service Class
 */
export class SupabaseAgendaService {
  /**
   * Get appointments within a date range
   */
  async getAppointments(startDate: Date, endDate: Date): Promise<Appointment[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(*),
          therapist:therapists(*)
        `)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }

      // Transform data to match our Appointment type
      return (data || []).map((item: any) => ({
        id: item.id,
        patientId: item.patient_id,
        patientName: item.patient?.name || 'Unknown',
        therapistId: item.therapist_id,
        therapistName: item.therapist?.name || 'Unknown',
        startTime: new Date(item.start_time),
        endTime: new Date(item.end_time),
        type: item.type,
        status: item.status,
        paymentStatus: item.payment_status || 'pending',
        price: item.price || 0,
        observations: item.observations || '',
        recurrenceRule: item.recurrence_rule,
        hasConflict: item.has_conflict || false,
        conflictReason: item.conflict_reason,
        conflictResolvedAt: item.conflict_resolved_at ? new Date(item.conflict_resolved_at) : undefined,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));
    } catch (error) {
      console.error('Error in getAppointments:', error);
      throw error;
    }
  }

  /**
   * Create a new appointment
   */
  async createAppointment(appointment: Appointment): Promise<Appointment> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: appointment.patientId,
          therapist_id: appointment.therapistId,
          start_time: appointment.startTime.toISOString(),
          end_time: appointment.endTime.toISOString(),
          type: appointment.type,
          status: appointment.status,
          payment_status: appointment.paymentStatus,
          price: appointment.price,
          observations: appointment.observations,
          recurrence_rule: appointment.recurrenceRule,
          has_conflict: appointment.hasConflict || false,
          conflict_reason: appointment.conflictReason,
          conflict_resolved_at: appointment.conflictResolvedAt?.toISOString(),
        })
        .select(`
          *,
          patient:patients(*),
          therapist:therapists(*)
        `)
        .single();

      if (error) {
        console.error('Error creating appointment:', error);
        throw error;
      }

      // Transform to match our type
      return {
        id: data.id,
        patientId: data.patient_id,
        patientName: data.patient?.name || 'Unknown',
        therapistId: data.therapist_id,
        therapistName: data.therapist?.name || 'Unknown',
        startTime: new Date(data.start_time),
        endTime: new Date(data.end_time),
        type: data.type,
        status: data.status,
        paymentStatus: data.payment_status || 'pending',
        price: data.price || 0,
        observations: data.observations || '',
        recurrenceRule: data.recurrence_rule,
        hasConflict: data.has_conflict || false,
        conflictReason: data.conflict_reason,
        conflictResolvedAt: data.conflict_resolved_at ? new Date(data.conflict_resolved_at) : undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Error in createAppointment:', error);
      throw error;
    }
  }

  /**
   * Update an existing appointment
   */
  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const updateData: any = {};
      
      if (data.patientId) updateData.patient_id = data.patientId;
      if (data.therapistId) updateData.therapist_id = data.therapistId;
      if (data.startTime) updateData.start_time = data.startTime.toISOString();
      if (data.endTime) updateData.end_time = data.endTime.toISOString();
      if (data.type) updateData.type = data.type;
      if (data.status) updateData.status = data.status;
      if (data.paymentStatus) updateData.payment_status = data.paymentStatus;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.observations !== undefined) updateData.observations = data.observations;
      if (data.recurrenceRule !== undefined) updateData.recurrence_rule = data.recurrenceRule;
      if (data.hasConflict !== undefined) updateData.has_conflict = data.hasConflict;
      if (data.conflictReason !== undefined) updateData.conflict_reason = data.conflictReason;
      if (data.conflictResolvedAt !== undefined) {
        updateData.conflict_resolved_at = data.conflictResolvedAt?.toISOString();
      }

      updateData.updated_at = new Date().toISOString();

      const { data: result, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          patient:patients(*),
          therapist:therapists(*)
        `)
        .single();

      if (error) {
        console.error('Error updating appointment:', error);
        throw error;
      }

      // Transform to match our type
      return {
        id: result.id,
        patientId: result.patient_id,
        patientName: result.patient?.name || 'Unknown',
        therapistId: result.therapist_id,
        therapistName: result.therapist?.name || 'Unknown',
        startTime: new Date(result.start_time),
        endTime: new Date(result.end_time),
        type: result.type,
        status: result.status,
        paymentStatus: result.payment_status || 'pending',
        price: result.price || 0,
        observations: result.observations || '',
        recurrenceRule: result.recurrence_rule,
        hasConflict: result.has_conflict || false,
        conflictReason: result.conflict_reason,
        conflictResolvedAt: result.conflict_resolved_at ? new Date(result.conflict_resolved_at) : undefined,
        createdAt: new Date(result.created_at),
        updatedAt: new Date(result.updated_at),
      };
    } catch (error) {
      console.error('Error in updateAppointment:', error);
      throw error;
    }
  }

  /**
   * Delete an appointment
   */
  async deleteAppointment(id: string): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting appointment:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteAppointment:', error);
      return false;
    }
  }

  /**
   * Get all patients
   */
  async getPatients(): Promise<Patient[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching patients:', error);
        throw error;
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        phone: item.phone,
        email: item.email,
        birthDate: item.birth_date,
        gender: item.gender,
        address: item.address,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
    } catch (error) {
      console.error('Error in getPatients:', error);
      throw error;
    }
  }

  /**
   * Get a single patient by ID
   */
  async getPatient(id: string): Promise<Patient | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching patient:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        birthDate: data.birth_date,
        gender: data.gender,
        address: data.address,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error('Error in getPatient:', error);
      return null;
    }
  }

  /**
   * Get all therapists
   */
  async getTherapists(): Promise<Therapist[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabase
        .from('therapists')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching therapists:', error);
        throw error;
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        specialty: item.specialty,
        color: item.color,
        email: item.email,
        phone: item.phone,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
    } catch (error) {
      console.error('Error in getTherapists:', error);
      throw error;
    }
  }

  /**
   * Check for appointment conflicts
   */
  async checkConflicts(appointment: Appointment): Promise<{
    hasConflicts: boolean;
    conflicts: Array<{
      type: string;
      message: string;
      conflictingAppointment?: Appointment;
    }>;
  }> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const conflicts: Array<{
        type: string;
        message: string;
        conflictingAppointment?: Appointment;
      }> = [];

      // Check for overlapping appointments for the same patient
      const { data: patientOverlaps, error: patientError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', appointment.patientId)
        .neq('id', appointment.id)
        .or(`and(start_time.lt.${appointment.endTime.toISOString()},end_time.gt.${appointment.startTime.toISOString()})`);

      if (patientError) {
        console.error('Error checking patient conflicts:', patientError);
      } else if (patientOverlaps && patientOverlaps.length > 0) {
        conflicts.push({
          type: 'patient_overlap',
          message: 'Paciente já possui agendamento neste horário',
        });
      }

      // Check for overlapping appointments for the same therapist
      const { data: therapistOverlaps, error: therapistError } = await supabase
        .from('appointments')
        .select('*')
        .eq('therapist_id', appointment.therapistId)
        .neq('id', appointment.id)
        .or(`and(start_time.lt.${appointment.endTime.toISOString()},end_time.gt.${appointment.startTime.toISOString()})`);

      if (therapistError) {
        console.error('Error checking therapist conflicts:', therapistError);
      } else if (therapistOverlaps && therapistOverlaps.length > 0) {
        conflicts.push({
          type: 'therapist_overlap',
          message: 'Terapeuta já possui agendamento neste horário',
        });
      }

      return {
        hasConflicts: conflicts.length > 0,
        conflicts,
      };
    } catch (error) {
      console.error('Error in checkConflicts:', error);
      throw error;
    }
  }

  /**
   * Get waitlist entries
   */
  async getWaitlistEntries(): Promise<WaitlistEntry[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select(`
          *,
          patient:patients(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching waitlist:', error);
        throw error;
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        patientId: item.patient_id,
        patientName: item.patient?.name || 'Unknown',
        preferredTherapistId: item.preferred_therapist_id,
        preferredDays: item.preferred_days || [],
        urgency: item.urgency || 'medium',
        notes: item.notes || '',
        createdAt: new Date(item.created_at),
      }));
    } catch (error) {
      console.error('Error in getWaitlistEntries:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const supabaseAgendaService = new SupabaseAgendaService();

