import { supabase, handleSupabaseError, subscribeToTable } from '../../lib/supabase';
import type { Database } from '../../types/database';

type Session = Database['public']['Tables']['sessions']['Row'];
type SessionInsert = Database['public']['Tables']['sessions']['Insert'];
type SessionUpdate = Database['public']['Tables']['sessions']['Update'];

export interface SessionFilters {
  patientId?: string;
  therapistId?: string;
  startDate?: string;
  endDate?: string;
  minPainReduction?: number;
}

export interface SessionStatistics {
  totalSessions: number;
  averagePainReduction: number;
  averagePainBefore: number;
  averagePainAfter: number;
  mostCommonProcedures: string[];
  progressTrend: 'improving' | 'stable' | 'worsening';
}

class SessionService {
  // Get sessions with filters
  async getSessions(filters?: SessionFilters) {
    try {
      let query = supabase
        .from('sessions')
        .select(`
          *,
          appointment:appointment_id(
            *,
            patient:patient_id(full_name, email),
            therapist:therapist_id(full_name, specialization)
          )
        `);

      if (filters?.patientId) {
        query = query.eq('appointment.patient_id', filters.patientId);
      }

      if (filters?.therapistId) {
        query = query.eq('appointment.therapist_id', filters.therapistId);
      }

      if (filters?.startDate && filters?.endDate) {
        query = query
          .gte('appointment.appointment_date', filters.startDate)
          .lte('appointment.appointment_date', filters.endDate);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get session by ID
  async getSessionById(id: string) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          appointment:appointment_id(
            *,
            patient:patient_id(*),
            therapist:therapist_id(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get session by appointment ID
  async getSessionByAppointmentId(appointmentId: string) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('appointment_id', appointmentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Create session
  async createSession(session: SessionInsert) {
    try {
      // Check if session already exists for this appointment
      const existing = await this.getSessionByAppointmentId(session.appointment_id);
      if (existing) {
        throw new Error('Sessão já existe para este agendamento');
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert(session)
        .select()
        .single();

      if (error) throw error;

      // Update appointment status to completed
      await supabase
        .from('appointments')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', session.appointment_id);

      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Update session
  async updateSession(id: string, updates: SessionUpdate) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Delete session
  async deleteSession(id: string) {
    try {
      const session = await this.getSessionById(id);
      
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update appointment status back to scheduled
      if (session?.appointment_id) {
        await supabase
          .from('appointments')
          .update({ 
            status: 'scheduled',
            updated_at: new Date().toISOString()
          })
          .eq('id', session.appointment_id);
      }

      return true;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get patient sessions
  async getPatientSessions(patientId: string, limit?: number) {
    try {
      let query = supabase
        .from('sessions')
        .select(`
          *,
          appointment:appointment_id(
            *,
            therapist:therapist_id(full_name, specialization)
          )
        `)
        .eq('appointment.patient_id', patientId)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get therapist sessions
  async getTherapistSessions(therapistId: string, date?: string) {
    try {
      let query = supabase
        .from('sessions')
        .select(`
          *,
          appointment:appointment_id(
            *,
            patient:patient_id(full_name, email, phone)
          )
        `)
        .eq('appointment.therapist_id', therapistId);

      if (date) {
        query = query.eq('appointment.appointment_date', date);
      }

      const { data, error } = await query.order('appointment.start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get session statistics for patient
  async getPatientSessionStatistics(patientId: string): Promise<SessionStatistics> {
    try {
      const sessions = await this.getPatientSessions(patientId);
      
      if (sessions.length === 0) {
        return {
          totalSessions: 0,
          averagePainReduction: 0,
          averagePainBefore: 0,
          averagePainAfter: 0,
          mostCommonProcedures: [],
          progressTrend: 'stable',
        };
      }

      // Calculate pain statistics
      const painData = sessions
        .filter(s => s.pain_level_before !== null && s.pain_level_after !== null)
        .map(s => ({
          before: s.pain_level_before!,
          after: s.pain_level_after!,
          reduction: s.pain_level_before! - s.pain_level_after!,
        }));

      const averagePainBefore = painData.length > 0
        ? painData.reduce((sum, d) => sum + d.before, 0) / painData.length
        : 0;

      const averagePainAfter = painData.length > 0
        ? painData.reduce((sum, d) => sum + d.after, 0) / painData.length
        : 0;

      const averagePainReduction = averagePainBefore - averagePainAfter;

      // Extract procedures
      const procedures: { [key: string]: number } = {};
      sessions.forEach(s => {
        if (s.procedures_performed) {
          const procs = s.procedures_performed.split(',').map(p => p.trim());
          procs.forEach(proc => {
            procedures[proc] = (procedures[proc] || 0) + 1;
          });
        }
      });

      const mostCommonProcedures = Object.entries(procedures)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([proc]) => proc);

      // Determine progress trend
      let progressTrend: 'improving' | 'stable' | 'worsening' = 'stable';
      if (painData.length >= 3) {
        const recentSessions = painData.slice(0, 3);
        const olderSessions = painData.slice(-3);
        
        const recentAvg = recentSessions.reduce((sum, d) => sum + d.after, 0) / recentSessions.length;
        const olderAvg = olderSessions.reduce((sum, d) => sum + d.after, 0) / olderSessions.length;
        
        if (recentAvg < olderAvg - 1) {
          progressTrend = 'improving';
        } else if (recentAvg > olderAvg + 1) {
          progressTrend = 'worsening';
        }
      }

      return {
        totalSessions: sessions.length,
        averagePainReduction,
        averagePainBefore,
        averagePainAfter,
        mostCommonProcedures,
        progressTrend,
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get evolution data for charts
  async getPatientEvolutionData(patientId: string) {
    try {
      const sessions = await this.getPatientSessions(patientId);
      
      const evolutionData = sessions
        .filter(s => s.pain_level_before !== null || s.pain_level_after !== null)
        .map(s => ({
          date: s.appointment?.appointment_date || s.created_at,
          painBefore: s.pain_level_before || 0,
          painAfter: s.pain_level_after || 0,
          sessionNumber: sessions.length - sessions.indexOf(s),
        }))
        .reverse();

      return evolutionData;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Create SOAP note
  async createSOAPNote(
    sessionId: string,
    subjective: string,
    objective: string,
    assessment: string,
    plan: string
  ) {
    try {
      const updates: SessionUpdate = {
        objective_assessment: objective,
        treatment_performed: assessment,
        patient_response: subjective,
        next_session_notes: plan,
      };

      return await this.updateSession(sessionId, updates);
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Add exercise prescription to session
  async addExercisePrescription(sessionId: string, exercises: string) {
    try {
      const updates: SessionUpdate = {
        exercises_prescribed: exercises,
      };

      return await this.updateSession(sessionId, updates);
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Add measurements to session
  async addMeasurements(
    sessionId: string,
    rangeOfMotion?: any,
    strengthTests?: any,
    functionalTests?: any
  ) {
    try {
      const updates: SessionUpdate = {
        range_of_motion: rangeOfMotion,
        strength_tests: strengthTests,
        functional_tests: functionalTests,
      };

      return await this.updateSession(sessionId, updates);
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Subscribe to session changes
  subscribeToSessionChanges(callback: (payload: any) => void) {
    return subscribeToTable('sessions', callback);
  }

  // Subscribe to patient sessions
  subscribeToPatientSessions(patientId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel('patient_sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
        },
        async (payload: any) => {
          // Check if this session belongs to the patient
          if (payload.new?.appointment_id) {
            const { data: appointment } = await supabase
              .from('appointments')
              .select('patient_id')
              .eq('id', payload.new.appointment_id)
              .single();
            
            if (appointment?.patient_id === patientId) {
              callback(payload);
            }
          }
        }
      )
      .subscribe();

    return channel;
  }

  // Bulk create sessions
  async bulkCreateSessions(sessions: SessionInsert[]) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert(sessions)
        .select();

      if (error) throw error;

      // Update all related appointments to completed
      const appointmentIds = sessions.map(s => s.appointment_id);
      await supabase
        .from('appointments')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .in('id', appointmentIds);

      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
}

export const sessionService = new SessionService();
export default sessionService;
