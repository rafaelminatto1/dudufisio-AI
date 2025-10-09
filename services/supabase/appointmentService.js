import { supabase, handleSupabaseError, subscribeToTable } from '../../lib/supabase';
// Local date helpers to avoid external dependencies during build
function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function addDaysLocal(base, days) {
    const copy = new Date(base);
    copy.setDate(copy.getDate() + days);
    return copy;
}
function getWeekStartEndMonday(date) {
    const copy = new Date(date);
    const day = copy.getDay(); // 0 (Sun) .. 6 (Sat)
    // Monday-based week: compute diff to Monday
    const diffToMonday = ((day + 6) % 7); // 0 if Monday, 6 if Sunday
    const start = addDaysLocal(copy, -diffToMonday);
    const end = addDaysLocal(start, 6);
    return { start, end };
}
// Helper function to map Supabase appointment to domain appointment
function mapAppointmentToDomain(data) {
    return {
        id: data.id,
        patient_id: data.patient_id,
        therapist_id: data.therapist_id,
        scheduled_at: data.scheduled_at,
        appointment_date: data.scheduled_at ? new Date(data.scheduled_at).toISOString().split('T')[0] : undefined,
        start_time: data.start_time || (data.scheduled_at ? new Date(data.scheduled_at).toTimeString().slice(0, 5) : undefined),
        duration_minutes: 60, // Default duration
        status: data.status,
        appointment_type: data.appointment_type,
        cancellation_reason: data.cancellation_reason,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at,
        metadata: data.metadata,
        payment_status: data.payment_status,
        recurrence_rule: data.recurrence_rule,
        recurrence_template_id: data.recurrence_template_id,
        series_id: data.series_id,
        value: data.value,
        end_time: data.end_time,
        price: data.value, // Map value to price for compatibility
        notes: undefined, // Will be added to metadata if needed
    };
}
class AppointmentService {
    // Get appointments with filters
    async getAppointments(filters) {
        try {
            let query = supabase
                .from('appointments')
                .select(`
          *,
          patient:patient_id(full_name, email, phone),
          therapist:therapist_id(full_name, specialization),
          session:sessions(*)
        `);
            if (filters?.therapistId) {
                query = query.eq('therapist_id', filters.therapistId);
            }
            if (filters?.patientId) {
                query = query.eq('patient_id', filters.patientId);
            }
            if (filters?.status) {
                query = query.eq('status', filters.status);
            }
            if (filters?.appointmentType) {
                query = query.eq('appointment_type', filters.appointmentType);
            }
            if (filters?.room) {
                query = query.eq('room', filters.room);
            }
            if (filters?.startDate && filters?.endDate) {
                query = query
                    .gte('appointment_date', filters.startDate)
                    .lte('appointment_date', filters.endDate);
            }
            const { data, error } = await query.order('appointment_date', { ascending: true });
            if (error)
                throw error;
            return data ?? [];
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Get appointment by ID
    async getAppointmentById(id) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
          *,
          patient:patient_id(*),
          therapist:therapist_id(*),
          session:sessions(*)
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
    // Create appointment
    async createAppointment(appointment) {
        try {
            // Check for conflicts using scheduled_at
            const conflicts = await this.checkAppointmentConflict(appointment.therapist_id, appointment.scheduled_at);
            if (conflicts.length > 0) {
                throw new Error('Horário já ocupado para este fisioterapeuta');
            }
            const { data, error } = await supabase
                .from('appointments')
                .insert(appointment)
                .select()
                .single();
            if (error)
                throw error;
            return data ?? null;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Update appointment
    async updateAppointment(id, updates) {
        try {
            // If updating time/date, check for conflicts
            if (updates.scheduled_at || updates.therapist_id) {
                const current = await this.getAppointmentById(id);
                if (!current) {
                    throw new Error('Consulta não encontrada para atualização');
                }
                const conflicts = await this.checkAppointmentConflict(updates.therapist_id ?? current.therapist_id, updates.scheduled_at ?? current.scheduled_at, id);
                if (conflicts.length > 0) {
                    throw new Error('Horário já ocupado para este fisioterapeuta');
                }
            }
            const { data, error } = await supabase
                .from('appointments')
                .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
                .eq('id', id)
                .select()
                .single();
            if (error)
                throw error;
            return data ?? null;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Cancel appointment
    async cancelAppointment(id, reason, cancelledBy) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .update({
                status: 'cancelled',
                cancellation_reason: reason,
                cancelled_by: cancelledBy,
                cancelled_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
                .eq('id', id)
                .select()
                .single();
            if (error)
                throw error;
            return data ?? null;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Mark appointment as completed
    async completeAppointment(id) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .update({
                status: 'completed',
                updated_at: new Date().toISOString(),
            })
                .eq('id', id)
                .select()
                .single();
            if (error)
                throw error;
            return data ?? null;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Mark appointment as no-show
    async markAsNoShow(id) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .update({
                status: 'no_show',
                updated_at: new Date().toISOString(),
            })
                .eq('id', id)
                .select()
                .single();
            if (error)
                throw error;
            return data ?? null;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Check appointment conflicts
    async checkAppointmentConflict(therapistId, scheduledAt, excludeId) {
        try {
            // Check for overlapping appointments using scheduled_at
            const { data, error } = await supabase
                .from('appointments')
                .select('id, patient_id, scheduled_at')
                .eq('therapist_id', therapistId)
                .neq('status', 'cancelled')
                .neq('status', 'no_show');
            if (error)
                throw error;
            // Filter for conflicts (simplified logic)
            const conflicts = (data || []).filter(apt => {
                if (excludeId && apt.id === excludeId)
                    return false;
                const aptTime = new Date(apt.scheduled_at);
                const newTime = new Date(scheduledAt);
                // Check if appointments overlap (assuming 60min duration)
                const timeDiff = Math.abs(aptTime.getTime() - newTime.getTime());
                return timeDiff < (60 * 60 * 1000); // Less than 60 minutes apart
            });
            return conflicts.map(conflict => ({
                appointment_id: conflict.id,
                patient_name: 'Paciente', // Would need to join with patients table
                start_time: new Date(conflict.scheduled_at).toTimeString().slice(0, 5),
                end_time: new Date(new Date(conflict.scheduled_at).getTime() + 60 * 60 * 1000).toTimeString().slice(0, 5)
            }));
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Get available time slots
    async getAvailableTimeSlots(therapistId, date, duration = 60) {
        try {
            // Get all appointments for the therapist on the given date
            const { data: appointments, error } = await supabase
                .from('appointments')
                .select('scheduled_at')
                .eq('therapist_id', therapistId)
                .gte('scheduled_at', `${date}T00:00:00`)
                .lt('scheduled_at', `${date}T23:59:59`)
                .not('status', 'in', '(cancelled,no_show)');
            if (error)
                throw error;
            // Generate all possible time slots (8:00 to 18:00, every 30 minutes)
            const slots = [];
            const startHour = 8;
            const endHour = 18;
            const slotInterval = 30;
            for (let hour = startHour; hour < endHour; hour++) {
                for (let minute = 0; minute < 60; minute += slotInterval) {
                    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
                    const endTime = this.addMinutes(time, duration);
                    // Check if this slot conflicts with any existing appointment
                    const hasConflict = appointments?.some((apt) => {
                        const aptTime = new Date(apt.scheduled_at);
                        const slotTime = new Date(`${date}T${time}`);
                        const slotEndTime = new Date(slotTime.getTime() + duration * 60000);
                        return ((slotTime >= aptTime && slotTime < new Date(aptTime.getTime() + 60 * 60000)) ||
                            (slotEndTime > aptTime && slotEndTime <= new Date(aptTime.getTime() + 60 * 60000)) ||
                            (slotTime <= aptTime && slotEndTime >= new Date(aptTime.getTime() + 60 * 60000)));
                    });
                    const slot = {
                        time,
                        available: !hasConflict,
                    };
                    if (hasConflict) {
                        slot.reason = 'Horário ocupado';
                    }
                    slots.push(slot);
                }
            }
            return slots;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Get week appointments
    async getWeekAppointments(date, therapistId) {
        try {
            const { start: weekStart, end: weekEnd } = getWeekStartEndMonday(date);
            const filters = {
                startDate: formatDate(weekStart),
                endDate: formatDate(weekEnd),
            };
            if (therapistId) {
                filters.therapistId = therapistId;
            }
            return await this.getAppointments(filters);
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Get today's appointments
    async getTodayAppointments(therapistId) {
        try {
            const today = formatDate(new Date());
            const filters = {
                startDate: today,
                endDate: today,
            };
            if (therapistId) {
                filters.therapistId = therapistId;
            }
            return await this.getAppointments(filters);
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Get upcoming appointments for patient
    async getUpcomingAppointments(patientId, limit = 5) {
        try {
            const today = formatDate(new Date());
            const { data, error } = await supabase
                .from('appointments')
                .select(`
          *,
          therapist:therapist_id(full_name, specialization)
        `)
                .eq('patient_id', patientId)
                .gte('appointment_date', today)
                .eq('status', 'scheduled')
                .order('appointment_date', { ascending: true })
                .order('start_time', { ascending: true })
                .limit(limit);
            if (error)
                throw error;
            return data ?? [];
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Create recurring appointments
    async createRecurringAppointments(baseAppointment, recurrenceType, occurrences) {
        try {
            const appointments = [];
            let currentDateTime = new Date(baseAppointment.scheduled_at);
            for (let i = 0; i < occurrences; i++) {
                if (i > 0) {
                    switch (recurrenceType) {
                        case 'daily':
                            currentDateTime = addDaysLocal(currentDateTime, 1);
                            break;
                        case 'weekly':
                            currentDateTime = addDaysLocal(currentDateTime, 7);
                            break;
                        case 'biweekly':
                            currentDateTime = addDaysLocal(currentDateTime, 14);
                            break;
                        case 'monthly':
                            currentDateTime.setMonth(currentDateTime.getMonth() + 1);
                            break;
                    }
                }
                appointments.push({
                    ...baseAppointment,
                    scheduled_at: currentDateTime.toISOString(),
                });
            }
            // Check for conflicts for all appointments
            const conflicts = [];
            for (const apt of appointments) {
                const conflictCheck = await this.checkAppointmentConflict(apt.therapist_id, apt.scheduled_at);
                if (conflictCheck.length > 0) {
                    conflicts.push({
                        date: new Date(apt.scheduled_at).toISOString().split('T')[0],
                        conflicts: conflictCheck,
                    });
                }
            }
            if (conflicts.length > 0) {
                throw new Error(`Conflitos encontrados em ${conflicts.length} datas`);
            }
            // Create all appointments
            const { data, error } = await supabase
                .from('appointments')
                .insert(appointments)
                .select();
            if (error)
                throw error;
            return data ?? [];
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Subscribe to appointment changes
    subscribeToAppointmentChanges(callback) {
        return subscribeToTable('appointments', callback);
    }
    // Subscribe to therapist appointments
    subscribeToTherapistAppointments(therapistId, callback) {
        return subscribeToTable('appointments', callback, {
            column: 'therapist_id',
            value: therapistId,
        });
    }
    // Subscribe to patient appointments
    subscribeToPatientAppointments(patientId, callback) {
        return subscribeToTable('appointments', callback, {
            column: 'patient_id',
            value: patientId,
        });
    }
    // Helper function to add minutes to time
    addMinutes(time, minutes) {
        const [hoursStr, minsStr] = time.split(':');
        const hours = Number(hoursStr ?? 0);
        const mins = Number(minsStr ?? 0);
        const totalMinutes = hours * 60 + mins + minutes;
        const newHours = Math.floor(totalMinutes / 60);
        const newMinutes = totalMinutes % 60;
        return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:00`;
    }
    // Get appointment statistics
    async getAppointmentStatistics(filters) {
        try {
            const appointments = await this.getAppointments(filters);
            const stats = {
                total: appointments.length,
                scheduled: appointments.filter((a) => a.status === 'scheduled').length,
                confirmed: appointments.filter((a) => a.status === 'confirmed').length,
                completed: appointments.filter((a) => a.status === 'completed').length,
                cancelled: appointments.filter((a) => a.status === 'cancelled').length,
                noShow: appointments.filter((a) => a.status === 'no_show').length,
                byType: {
                    evaluation: appointments.filter((a) => a.appointment_type === 'evaluation').length,
                    session: appointments.filter((a) => a.appointment_type === 'session').length,
                    return: appointments.filter((a) => a.appointment_type === 'return').length,
                    group: appointments.filter((a) => a.appointment_type === 'group').length,
                },
            };
            return stats;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
}
export const appointmentService = new AppointmentService();
export default appointmentService;
