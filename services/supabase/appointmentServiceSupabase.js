import { supabase, handleSupabaseError } from '../../lib/supabase';
import { AppointmentStatus } from '../../types';
class SupabaseAppointmentService {
    mapRowToAppointment(row) {
        return {
            id: row.id,
            patientId: row.patient_id || '',
            patientName: '', // Will be populated by join queries
            patientAvatarUrl: '', // Will be populated by join queries
            therapistId: row.therapist_id || '',
            startTime: new Date(row.start_time || row.scheduled_at),
            endTime: new Date(row.end_time || row.scheduled_at),
            title: `${row.appointment_type} - ${row.patient_id?.substring(0, 8) || 'Unknown'}`, // Generate title from type
            type: row.appointment_type,
            status: (row.status || 'Agendado'),
            value: row.value || 0,
            paymentStatus: 'pending',
            observations: undefined, // notes field doesn't exist in current schema
            sessionNumber: undefined,
            totalSessions: undefined,
        };
    }
    mapAppointmentToInsert(appointment) {
        return {
            patient_id: appointment.patientId,
            therapist_id: appointment.therapistId,
            scheduled_at: appointment.startTime.toISOString(),
            start_time: appointment.startTime.toISOString(),
            end_time: appointment.endTime.toISOString(),
            appointment_type: appointment.type,
            status: appointment.status || 'Agendado',
            value: appointment.value || null,
            metadata: appointment.observations ? { notes: appointment.observations } : null,
        };
    }
    mapAppointmentToUpdate(appointment) {
        const update = {};
        if (appointment.patientId)
            update.patient_id = appointment.patientId;
        if (appointment.therapistId)
            update.therapist_id = appointment.therapistId;
        if (appointment.startTime) {
            update.scheduled_at = appointment.startTime.toISOString();
            update.start_time = appointment.startTime.toISOString();
        }
        if (appointment.endTime) {
            update.end_time = appointment.endTime.toISOString();
        }
        if (appointment.status)
            update.status = appointment.status;
        if (appointment.type)
            update.appointment_type = appointment.type;
        if (appointment.value !== undefined)
            update.value = appointment.value;
        if (appointment.observations !== undefined) {
            update.metadata = { notes: appointment.observations };
        }
        update.updated_at = new Date().toISOString();
        return update;
    }
    async getAllAppointments() {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .order('start_time', { ascending: true });
            if (error)
                throw error;
            return (data ?? []).map(this.mapRowToAppointment.bind(this));
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async getAppointmentById(id) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('id', id)
                .single();
            if (error) {
                if (error.code === 'PGRST116')
                    return null;
                throw error;
            }
            return data ? this.mapRowToAppointment(data) : null;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async getAppointmentsByDateRange(startDate, endDate) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .gte('start_time', startDate)
                .lte('start_time', endDate)
                .order('start_time', { ascending: true });
            if (error)
                throw error;
            return (data ?? []).map(this.mapRowToAppointment.bind(this));
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async getAppointmentsByTherapist(therapistId, startDate, endDate) {
        try {
            let query = supabase
                .from('appointments')
                .select('*')
                .eq('therapist_id', therapistId);
            if (startDate) {
                query = query.gte('start_time', startDate);
            }
            if (endDate) {
                query = query.lte('start_time', endDate);
            }
            const { data, error } = await query.order('start_time', { ascending: true });
            if (error)
                throw error;
            return (data ?? []).map(this.mapRowToAppointment.bind(this));
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async getAppointmentsByPatient(patientId, startDate, endDate) {
        try {
            let query = supabase
                .from('appointments')
                .select('*')
                .eq('patient_id', patientId);
            if (startDate) {
                query = query.gte('start_time', startDate);
            }
            if (endDate) {
                query = query.lte('start_time', endDate);
            }
            const { data, error } = await query.order('start_time', { ascending: true });
            if (error)
                throw error;
            return (data ?? []).map(this.mapRowToAppointment.bind(this));
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async getAppointmentsByStatus(status) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('status', status)
                .order('start_time', { ascending: true });
            if (error)
                throw error;
            return (data ?? []).map(this.mapRowToAppointment.bind(this));
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async createAppointment(appointmentData) {
        try {
            // Check for conflicts before creating
            const conflicts = await this.checkConflicts(appointmentData.therapistId, appointmentData.startTime.toISOString(), appointmentData.endTime.toISOString());
            if (conflicts.length > 0) {
                throw new Error('Conflito de horário detectado. Já existe um agendamento neste horário.');
            }
            const insertData = this.mapAppointmentToInsert(appointmentData);
            const { data, error } = await supabase
                .from('appointments')
                .insert(insertData)
                .select()
                .single();
            if (error)
                throw error;
            return this.mapRowToAppointment(data);
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async updateAppointment(id, updates) {
        try {
            // Check for conflicts if time or therapist is being updated
            if (updates.startTime || updates.endTime || updates.therapistId) {
                const current = await this.getAppointmentById(id);
                if (!current)
                    throw new Error('Agendamento não encontrado');
                const therapistId = updates.therapistId ?? current.therapistId;
                const startTime = updates.startTime ?? current.startTime;
                const endTime = updates.endTime ?? current.endTime;
                const conflicts = await this.checkConflicts(therapistId, startTime.toISOString(), endTime.toISOString(), id);
                if (conflicts.length > 0) {
                    throw new Error('Conflito de horário detectado. Já existe um agendamento neste horário.');
                }
            }
            const updateData = this.mapAppointmentToUpdate(updates);
            const { data, error } = await supabase
                .from('appointments')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            if (error)
                throw error;
            return this.mapRowToAppointment(data);
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async deleteAppointment(id) {
        try {
            const { error } = await supabase
                .from('appointments')
                .delete()
                .eq('id', id);
            if (error)
                throw error;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async checkConflicts(therapistId, startTime, endTime, excludeId) {
        try {
            let query = supabase
                .from('appointments')
                .select('*')
                .eq('therapist_id', therapistId)
                .neq('status', AppointmentStatus.Canceled)
                .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`);
            if (excludeId) {
                query = query.neq('id', excludeId);
            }
            const { data, error } = await query;
            if (error)
                throw error;
            return (data ?? []).map(this.mapRowToAppointment.bind(this));
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async getUpcomingAppointments(limit = 10) {
        try {
            const now = new Date().toISOString();
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .gte('start_time', now)
                .in('status', [AppointmentStatus.Scheduled])
                .order('start_time', { ascending: true })
                .limit(limit);
            if (error)
                throw error;
            return (data ?? []).map(this.mapRowToAppointment.bind(this));
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async getTodayAppointments() {
        try {
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
            return this.getAppointmentsByDateRange(startOfDay, endOfDay);
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async getAppointmentStats() {
        try {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const [totalResult, todayResult, thisWeekResult, thisMonthResult, scheduledResult, completedResult, cancelledResult, noShowResult] = await Promise.all([
                supabase.from('appointments').select('id', { count: 'exact', head: true }),
                supabase.from('appointments').select('id', { count: 'exact', head: true })
                    .gte('start_time', startOfDay).lt('start_time', endOfDay),
                supabase.from('appointments').select('id', { count: 'exact', head: true })
                    .gte('start_time', startOfWeek.toISOString()),
                supabase.from('appointments').select('id', { count: 'exact', head: true })
                    .gte('start_time', startOfMonth),
                supabase.from('appointments').select('id', { count: 'exact', head: true })
                    .eq('status', AppointmentStatus.Scheduled),
                supabase.from('appointments').select('id', { count: 'exact', head: true })
                    .eq('status', AppointmentStatus.Completed),
                supabase.from('appointments').select('id', { count: 'exact', head: true })
                    .eq('status', AppointmentStatus.Canceled),
                supabase.from('appointments').select('id', { count: 'exact', head: true })
                    .eq('status', AppointmentStatus.NoShow)
            ]);
            return {
                total: totalResult.count || 0,
                today: todayResult.count || 0,
                thisWeek: thisWeekResult.count || 0,
                thisMonth: thisMonthResult.count || 0,
                byStatus: {
                    [AppointmentStatus.Scheduled]: scheduledResult.count || 0,
                    [AppointmentStatus.Completed]: completedResult.count || 0,
                    [AppointmentStatus.Canceled]: cancelledResult.count || 0,
                    [AppointmentStatus.NoShow]: noShowResult.count || 0,
                }
            };
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Real-time subscriptions
    subscribeToAppointments(callback) {
        return supabase
            .channel('appointments_changes')
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'appointments',
        }, (payload) => {
            let appointment = null;
            if (payload.new) {
                appointment = this.mapRowToAppointment(payload.new);
            }
            callback({
                ...payload,
                appointment,
            });
        })
            .subscribe();
    }
    subscribeToTherapistAppointments(therapistId, callback) {
        return supabase
            .channel(`therapist_${therapistId}_appointments`)
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'appointments',
            filter: `therapist_id=eq.${therapistId}`,
        }, (payload) => {
            let appointment = null;
            if (payload.new) {
                appointment = this.mapRowToAppointment(payload.new);
            }
            callback({
                ...payload,
                appointment,
            });
        })
            .subscribe();
    }
    subscribeToPatientAppointments(patientId, callback) {
        return supabase
            .channel(`patient_${patientId}_appointments`)
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'appointments',
            filter: `patient_id=eq.${patientId}`,
        }, (payload) => {
            let appointment = null;
            if (payload.new) {
                appointment = this.mapRowToAppointment(payload.new);
            }
            callback({
                ...payload,
                appointment,
            });
        })
            .subscribe();
    }
}
// Export singleton instance
export const supabaseAppointmentService = new SupabaseAppointmentService();
export default supabaseAppointmentService;
