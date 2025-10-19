import { supabase, handleSupabaseError, subscribeToTable } from '../../lib/supabase';
class SessionService {
    // Get sessions with filters
    async getSessions(filters) {
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
            if (error)
                throw error;
            return data ?? [];
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Get session by ID
    async getSessionById(id) {
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
            if (error)
                throw error;
            return data ?? null;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Get session by appointment ID
    async getSessionByAppointmentId(appointmentId) {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('appointment_id', appointmentId)
                .single();
            if (error && error.code !== 'PGRST116')
                throw error;
            return data ?? null;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Create session
    async createSession(session) {
        try {
            // Check if session already exists for this appointment
            if (session.appointment_id) {
                const existing = await this.getSessionByAppointmentId(session.appointment_id);
                if (existing) {
                    throw new Error('Sessão já existe para este agendamento');
                }
            }
            const { data, error } = await supabase
                .from('sessions')
                .insert(session)
                .select()
                .single();
            if (error)
                throw error;
            // Update appointment status to completed
            await supabase
                .from('appointments')
                .update({
                status: 'completed',
                updated_at: new Date().toISOString(),
            })
                .eq('id', session.appointment_id);
            return data ?? null;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Update session
    async updateSession(id, updates) {
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
            if (error)
                throw error;
            return data;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Delete session
    async deleteSession(id) {
        try {
            const session = await this.getSessionById(id);
            const { error } = await supabase
                .from('sessions')
                .delete()
                .eq('id', id);
            if (error)
                throw error;
            // Update appointment status back to scheduled
            if (session?.appointment_id) {
                await supabase
                    .from('appointments')
                    .update({
                    status: 'scheduled',
                    updated_at: new Date().toISOString(),
                })
                    .eq('id', session.appointment_id);
            }
            return true;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Get patient sessions
    async getPatientSessions(patientId, limit) {
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
            if (error)
                throw error;
            return data ?? [];
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Get therapist sessions
    async getTherapistSessions(therapistId, date) {
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
            if (error)
                throw error;
            return data ?? [];
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Get session statistics for patient
    async getPatientSessionStatistics(patientId) {
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
            // Calculate pain statistics - DISABLED: pain_level fields not available in current schema
            // const painData = sessions
            //   .filter((s) => s.pain_level_before !== null && s.pain_level_after !== null)
            //   .map((s) => ({
            //     before: s.pain_level_before!,
            //     after: s.pain_level_after!,
            //     reduction: s.pain_level_before! - s.pain_level_after!,
            //   }));
            // const averagePainBefore = painData.length > 0
            //   ? painData.reduce((sum, d) => sum + d.before, 0) / painData.length
            //   : 0;
            // const averagePainAfter = painData.length > 0
            //   ? painData.reduce((sum, d) => sum + d.after, 0) / painData.length
            //   : 0;
            // const averagePainReduction = averagePainBefore - averagePainAfter;
            const averagePainReduction = 0; // Placeholder
            // Extract procedures - DISABLED: procedures_performed field not available in current schema
            const procedures = {};
            // sessions.forEach((s) => {
            //   if (s.procedures_performed) {
            //     const procs = s.procedures_performed.split(',').map((proc) => proc.trim());
            //     procs.forEach((proc) => {
            //       procedures[proc] = (procedures[proc] ?? 0) + 1;
            //     });
            //   }
            // });
            const mostCommonProcedures = Object.entries(procedures)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([proc]) => proc);
            // Determine progress trend - DISABLED: pain data not available
            const progressTrend = 'stable';
            // if (painData.length >= 3) {
            //   const recentSessions = painData.slice(0, 3);
            //   const olderSessions = painData.slice(-3);
            //   const recentAvg = recentSessions.reduce((sum, d) => sum + d.after, 0) / recentSessions.length;
            //   const olderAvg = olderSessions.reduce((sum, d) => sum + d.after, 0) / olderSessions.length;
            //   if (recentAvg < olderAvg - 1) {
            //     progressTrend = 'improving';
            //   } else if (recentAvg > olderAvg + 1) {
            //     progressTrend = 'worsening';
            //   }
            // }
            return {
                totalSessions: sessions.length,
                averagePainReduction,
                averagePainBefore: 0, // Placeholder
                averagePainAfter: 0, // Placeholder
                mostCommonProcedures,
                progressTrend,
            };
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Get evolution data for charts
    async getPatientEvolutionData(patientId) {
        try {
            const sessions = await this.getPatientSessions(patientId);
            // DISABLED: pain_level fields not available in current schema
            const evolutionData = sessions
                .map((s) => ({
                date: s.appointment?.start_time ?? s.created_at,
                painBefore: 0, // Placeholder
                painAfter: 0, // Placeholder
                sessionNumber: sessions.length - sessions.indexOf(s),
            }))
                .reverse();
            return evolutionData;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Create SOAP note - DISABLED: objective_assessment field not available in current schema
    async createSOAPNote(sessionId, subjective, objective, assessment, plan) {
        try {
            const updates = {
                // objective_assessment: objective, // Field not available
                // treatment_performed: assessment, // Field not available
                notes: `SOAP - Subjective: ${subjective}, Objective: ${objective}, Assessment: ${assessment}, Plan: ${plan}`,
                // next_session_notes: plan, // Field not available in current schema
            };
            return await this.updateSession(sessionId, updates);
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Add exercise prescription to session - DISABLED: exercises_prescribed field not available in current schema
    async addExercisePrescription(sessionId, exercises) {
        try {
            const updates = {
                // exercises_prescribed: exercises, // Field not available
                notes: exercises, // Store in notes field instead
            };
            return await this.updateSession(sessionId, updates);
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Add measurements to session - DISABLED: measurement fields not available in current schema
    async addMeasurements(sessionId, rangeOfMotion, strengthTests, functionalTests) {
        try {
            const updates = {
                // range_of_motion: rangeOfMotion, // Field not available
                // strength_tests: strengthTests, // Field not available
                // functional_tests: functionalTests, // Field not available
                notes: `Measurements: ROM=${JSON.stringify(rangeOfMotion)}, Strength=${JSON.stringify(strengthTests)}, Functional=${JSON.stringify(functionalTests)}`,
            };
            return await this.updateSession(sessionId, updates);
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Subscribe to session changes
    subscribeToSessionChanges(callback) {
        return subscribeToTable('sessions', callback);
    }
    // Subscribe to patient sessions
    subscribeToPatientSessions(patientId, callback) {
        const channel = supabase
            .channel('patient_sessions')
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'sessions',
        }, async (payload) => {
            if (payload.new && 'appointment_id' in payload.new && payload.new.appointment_id) {
                const { data: appointment } = await supabase
                    .from('appointments')
                    .select('patient_id')
                    .eq('id', payload.new.appointment_id)
                    .single();
                if (appointment?.patient_id === patientId) {
                    callback(payload);
                }
            }
        })
            .subscribe();
        return () => channel.unsubscribe();
    }
    // Subscribe to therapist sessions
    subscribeToTherapistSessions(therapistId, callback) {
        const channel = supabase
            .channel('therapist_sessions')
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'sessions',
        }, async (payload) => {
            if (payload.new && 'appointment_id' in payload.new && payload.new.appointment_id) {
                const { data: appointment } = await supabase
                    .from('appointments')
                    .select('therapist_id')
                    .eq('id', payload.new.appointment_id)
                    .single();
                if (appointment?.therapist_id === therapistId) {
                    callback(payload);
                }
            }
        })
            .subscribe();
        return () => channel.unsubscribe();
    }
    // Bulk create sessions
    async bulkCreateSessions(sessions) {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .insert(sessions)
                .select();
            if (error)
                throw error;
            // Update all related appointments to completed
            const appointmentIds = sessions.map(s => s.appointment_id).filter((id) => id !== null);
            await supabase
                .from('appointments')
                .update({
                status: 'completed',
                updated_at: new Date().toISOString()
            })
                .in('id', appointmentIds);
            return data || [];
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
}
export const sessionService = new SessionService();
export default sessionService;
