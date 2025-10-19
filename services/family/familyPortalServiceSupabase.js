/**
 * Family Portal Service - Supabase Integration
 * Serviço do Portal da Família com Integração Supabase
 */
import { supabase } from '../../lib/supabaseClient';
class FamilyPortalServiceSupabase {
    /**
     * Cria membro da família com acesso ao portal
     */
    async createFamilyMember(member) {
        try {
            // Criar usuário no auth se necessário
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: member.email,
                password: Math.random().toString(36).slice(-12), // Senha temporária
            });
            if (authError)
                throw authError;
            // Criar registro de membro da família
            const { data, error } = await supabase
                .from('family_members')
                .insert({
                user_id: authData.user?.id,
                patient_id: member.patientId,
                full_name: member.name,
                email: member.email,
                phone: member.phone,
                relationship: member.relationship,
                is_primary_contact: member.isPrimaryContact,
                can_schedule: member.permissions.canScheduleAppointments,
                can_view_medical: member.permissions.canViewMedicalRecords,
                can_receive_updates: member.permissions.canReceiveUpdates,
                emergency_contact: member.isEmergencyContact,
            })
                .select()
                .single();
            if (error)
                throw error;
            return this.mapDatabaseToFamilyMember(data);
        }
        catch (error) {
            console.error('Erro ao criar membro da família:', error);
            throw error;
        }
    }
    /**
     * Busca membros da família de um paciente
     */
    async getFamilyMembers(patientId) {
        try {
            const { data, error } = await supabase
                .from('family_members')
                .select('*')
                .eq('patient_id', patientId)
                .eq('is_active', true)
                .order('is_primary_contact', { ascending: false });
            if (error)
                throw error;
            return data.map(this.mapDatabaseToFamilyMember);
        }
        catch (error) {
            console.error('Erro ao buscar membros da família:', error);
            throw error;
        }
    }
    /**
     * Atualiza permissões de acesso
     */
    async updatePermissions(memberId, permissions) {
        try {
            const { error } = await supabase
                .from('family_members')
                .update({
                can_schedule: permissions.canScheduleAppointments,
                can_view_medical: permissions.canViewMedicalRecords,
                can_receive_updates: permissions.canReceiveUpdates,
                can_message_therapist: permissions.canMessageTherapist,
                can_view_exercises: permissions.canViewExercises,
                updated_at: new Date().toISOString(),
            })
                .eq('id', memberId);
            if (error)
                throw error;
        }
        catch (error) {
            console.error('Erro ao atualizar permissões:', error);
            throw error;
        }
    }
    /**
     * Busca relatórios de progresso para visualização familiar
     */
    async getProgressReports(patientId, familyMemberId) {
        try {
            // Verificar se membro tem permissão
            const { data: member } = await supabase
                .from('family_members')
                .select('can_view_medical')
                .eq('id', familyMemberId)
                .single();
            if (!member?.can_view_medical) {
                throw new Error('Membro da família não tem permissão para visualizar registros médicos');
            }
            // Buscar evoluções simplificadas
            const { data, error } = await supabase
                .from('session_evolutions')
                .select(`
          id,
          created_at,
          pain_level_before,
          pain_level_after,
          patient_response,
          appointments (
            appointment_date,
            users (full_name)
          )
        `)
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false })
                .limit(10);
            if (error)
                throw error;
            return data.map(d => ({
                reportId: d.id,
                date: new Date(d.created_at),
                therapistName: d.appointments?.users?.full_name || 'Terapeuta',
                summary: d.patient_response || 'Sessão realizada com sucesso',
                painLevelChange: (d.pain_level_after || 0) - (d.pain_level_before || 0),
                functionalProgress: 'Progredindo conforme esperado',
                nextGoals: [],
            }));
        }
        catch (error) {
            console.error('Erro ao buscar relatórios:', error);
            throw error;
        }
    }
    /**
     * Envia mensagem para terapeuta via portal familiar
     */
    async sendMessageToTherapist(familyMemberId, patientId, message) {
        try {
            // Verificar permissão
            const { data: member } = await supabase
                .from('family_members')
                .select('can_message_therapist, user_id')
                .eq('id', familyMemberId)
                .single();
            if (!member?.can_message_therapist) {
                throw new Error('Membro da família não tem permissão para enviar mensagens');
            }
            // Buscar terapeuta principal do paciente
            const { data: appointment } = await supabase
                .from('appointments')
                .select('therapist_id')
                .eq('patient_id', patientId)
                .order('appointment_date', { ascending: false })
                .limit(1)
                .single();
            if (!appointment) {
                throw new Error('Terapeuta não encontrado');
            }
            // Criar mensagem
            const { error } = await supabase
                .from('messages')
                .insert({
                from_id: member.user_id,
                to_id: appointment.therapist_id,
                patient_id: patientId,
                message: message,
                message_type: 'patient_to_therapist',
                status: 'sent',
            });
            if (error)
                throw error;
        }
        catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            throw error;
        }
    }
    /**
     * Registra acesso ao portal
     */
    async logPortalAccess(familyMemberId, action) {
        try {
            const { error } = await supabase
                .from('family_portal_access_log')
                .insert({
                family_member_id: familyMemberId,
                action,
                accessed_at: new Date().toISOString(),
            });
            // Se a tabela não existir, ignorar (não é crítico)
            if (error && error.code !== '42P01') {
                console.error('Erro ao registrar acesso:', error);
            }
        }
        catch (error) {
            // Log silencioso
            console.debug('Log de acesso não registrado:', error);
        }
    }
    /**
     * Mapeia dados do banco para FamilyMember
     */
    mapDatabaseToFamilyMember(data) {
        return {
            id: data.id,
            patientId: data.patient_id,
            userId: data.user_id,
            name: data.full_name,
            email: data.email,
            phone: data.phone,
            relationship: data.relationship,
            isPrimaryContact: data.is_primary_contact,
            isEmergencyContact: data.emergency_contact,
            permissions: {
                canViewMedicalRecords: data.can_view_medical,
                canScheduleAppointments: data.can_schedule,
                canReceiveUpdates: data.can_receive_updates,
                canMessageTherapist: data.can_message_therapist || false,
                canViewExercises: data.can_view_exercises || false,
                canViewBilling: data.can_view_billing || false,
            },
            communicationPreferences: {
                receiveProgressUpdates: data.can_receive_updates,
                receiveAppointmentReminders: true,
                receiveEmergencyAlerts: data.emergency_contact,
                preferredChannel: 'email',
                language: 'pt-BR',
            },
            lastAccess: data.last_access ? new Date(data.last_access) : undefined,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }
}
export const familyPortalServiceSupabase = new FamilyPortalServiceSupabase();
