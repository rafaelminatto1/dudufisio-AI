import { supabase, handleSupabaseError } from '../../lib/supabase';
import { PatientStatus } from '../../types';
const sanitizeNullableString = (value) => {
    if (typeof value !== 'string') {
        return value ?? null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};
class SupabasePatientService {
    mapRowToPatient(row) {
        // const status = (row.status || 'active').toLowerCase(); // Field not available in current schema
        const status = 'active'; // Default status
        const mapStatus = () => {
            const statusLower = status.toLowerCase();
            if (statusLower.includes('inactive')) {
                return PatientStatus.Inactive;
            }
            else if (statusLower.includes('discharged')) {
                return PatientStatus.Discharged;
            }
            else {
                return PatientStatus.Active;
            }
        };
        return {
            id: row.id,
            name: row.name ?? '', // full_name field not available
            cpf: '', // cpf field not available in current schema
            birthDate: row.birth_date ?? '',
            phone: row.phone ?? '',
            email: row.email ?? '',
            emergencyContact: {
                name: '', // emergency_contact_name field not available
                phone: '', // emergency_contact_phone field not available
            },
            address: {
                street: '', // address fields not available in current schema
                city: '',
                state: '',
                zip: '',
            },
            status: mapStatus(),
            lastVisit: row.updated_at ?? row.created_at ?? new Date().toISOString(),
            registrationDate: row.created_at ?? new Date().toISOString(),
            avatarUrl: '',
            consentGiven: true,
            whatsappConsent: 'opt-out',
            allergies: undefined,
            medicalAlerts: undefined, // medical_history field not available
            surgeries: undefined,
            conditions: undefined,
            attachments: undefined,
            trackedMetrics: undefined,
            communicationLogs: undefined,
            painPoints: undefined,
        };
    }
    mapPatientStatus(status) {
        if (!status)
            return null;
        switch (status) {
            case PatientStatus.Inactive:
                return 'inactive';
            case PatientStatus.Discharged:
                return 'discharged';
            case PatientStatus.Active:
            default:
                return 'active';
        }
    }
    mapPatientToInsert(patient) {
        const createdAt = patient.registrationDate ?? new Date().toISOString();
        const updatedAt = patient.lastVisit ?? createdAt;
        return {
            // full_name: patient.name, // Field not available in current schema
            name: patient.name,
            email: sanitizeNullableString(patient.email),
            phone: sanitizeNullableString(patient.phone),
            birth_date: sanitizeNullableString(patient.birthDate),
            // date_of_birth: sanitizeNullableString(patient.birthDate), // Field not available
            // cpf: sanitizeNullableString(patient.cpf), // Field not available
            // address_street: sanitizeNullableString(patient.address?.street), // Field not available
            // address_number: null, // Field not available
            // address_city: sanitizeNullableString(patient.address?.city), // Field not available
            // address_state: sanitizeNullableString(patient.address?.state), // Field not available
            // address_zip: sanitizeNullableString(patient.address?.zip), // Field not available
            // emergency_contact_name: sanitizeNullableString(patient.emergencyContact?.name), // Field not available
            // emergency_contact_phone: sanitizeNullableString(patient.emergencyContact?.phone), // Field not available
            // medical_history: sanitizeNullableString(patient.medicalAlerts), // Field not available
            // status: this.mapPatientStatus(patient.status), // Field not available
            created_at: createdAt,
            updated_at: updatedAt,
        };
    }
    mapPatientToUpdate(patient) {
        const update = {
            updated_at: new Date().toISOString(),
        };
        if (patient.name !== undefined) {
            // update.full_name = patient.name; // Field not available
            update.name = patient.name;
        }
        if (patient.email !== undefined)
            update.email = sanitizeNullableString(patient.email);
        if (patient.phone !== undefined)
            update.phone = sanitizeNullableString(patient.phone);
        if (patient.birthDate !== undefined) {
            const value = sanitizeNullableString(patient.birthDate);
            update.birth_date = value;
            // update.date_of_birth = value; // Field not available
        }
        // if (patient.cpf !== undefined) update.cpf = sanitizeNullableString(patient.cpf); // Field not available
        // if (patient.address !== undefined) {
        //   update.address_street = sanitizeNullableString(patient.address?.street); // Field not available
        //   update.address_city = sanitizeNullableString(patient.address?.city); // Field not available
        //   update.address_state = sanitizeNullableString(patient.address?.state); // Field not available
        //   update.address_zip = sanitizeNullableString(patient.address?.zip); // Field not available
        // }
        // if (patient.emergencyContact !== undefined) {
        //   update.emergency_contact_name = sanitizeNullableString(patient.emergencyContact?.name); // Field not available
        //   update.emergency_contact_phone = sanitizeNullableString(patient.emergencyContact?.phone); // Field not available
        // }
        // if (patient.medicalAlerts !== undefined) {
        //   update.medical_history = sanitizeNullableString(patient.medicalAlerts); // Field not available
        // }
        // if (patient.status !== undefined) {
        //   update.status = this.mapPatientStatus(patient.status); // Field not available
        // }
        return update;
    }
    async getAllPatients() {
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            return (data ?? []).map(this.mapRowToPatient.bind(this));
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async getPatientById(id) {
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .eq('id', id)
                .single();
            if (error) {
                if (error.code === 'PGRST116')
                    return null; // Not found
                throw error;
            }
            return data ? this.mapRowToPatient(data) : null;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async getPatientsByTherapist(therapistId) {
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .eq('therapist_id', therapistId)
                .order('name', { ascending: true });
            if (error)
                throw error;
            return (data ?? []).map(this.mapRowToPatient.bind(this));
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async searchPatients(query) {
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,cpf.ilike.%${query}%`)
                .order('name', { ascending: true });
            if (error)
                throw error;
            return (data ?? []).map(this.mapRowToPatient.bind(this));
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async createPatient(patientData) {
        try {
            const insertData = this.mapPatientToInsert({
                ...patientData,
                lastVisit: new Date().toISOString(),
                registrationDate: new Date().toISOString(),
                id: ''
            });
            const { data, error } = await supabase
                .from('patients')
                .insert(insertData)
                .select()
                .single();
            if (error)
                throw error;
            return this.mapRowToPatient(data);
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async updatePatient(id, updates) {
        try {
            const updateData = this.mapPatientToUpdate(updates);
            const { data, error } = await supabase
                .from('patients')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            if (error)
                throw error;
            return this.mapRowToPatient(data);
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async deletePatient(id) {
        try {
            const { error } = await supabase
                .from('patients')
                .delete()
                .eq('id', id);
            if (error)
                throw error;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async getPatientsByStatus(status) {
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .eq('status', status)
                .order('name', { ascending: true });
            if (error)
                throw error;
            return (data ?? []).map(this.mapRowToPatient.bind(this));
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async getPatientStats() {
        try {
            const currentMonth = new Date();
            currentMonth.setDate(1);
            currentMonth.setHours(0, 0, 0, 0);
            const [totalResult, activeResult, inactiveResult, newThisMonthResult] = await Promise.all([
                supabase.from('patients').select('id', { count: 'exact', head: true }),
                supabase.from('patients').select('id', { count: 'exact', head: true }).eq('status', PatientStatus.Active),
                supabase.from('patients').select('id', { count: 'exact', head: true }).eq('status', PatientStatus.Inactive),
                supabase.from('patients').select('id', { count: 'exact', head: true }).gte('created_at', currentMonth.toISOString())
            ]);
            return {
                total: totalResult.count ?? 0,
                active: activeResult.count ?? 0,
                inactive: inactiveResult.count ?? 0,
                newThisMonth: newThisMonthResult.count ?? 0,
            };
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Real-time subscriptions
    subscribeToPatients(callback) {
        return supabase
            .channel('patients_changes')
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'patients',
        }, (payload) => {
            const enrichedPayload = {
                ...payload,
                patient: payload.new ? this.mapRowToPatient(payload.new) : null,
            };
            callback(enrichedPayload);
        })
            .subscribe();
    }
    async linkPatientToUser(patientId, userId) {
        try {
            const { error } = await supabase
                .from('patients')
                .update({ user_id: userId })
                .eq('id', patientId);
            if (error)
                throw error;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async unlinkPatientFromUser(patientId) {
        try {
            const { error } = await supabase
                .from('patients')
                .update({ user_id: null })
                .eq('id', patientId);
            if (error)
                throw error;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
}
// Export singleton instance
export const supabasePatientService = new SupabasePatientService();
export default supabasePatientService;
