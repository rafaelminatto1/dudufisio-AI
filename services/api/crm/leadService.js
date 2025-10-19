/**
 * Lead Service - Serviço de gerenciamento de leads
 * Activity Fisioterapia Integration - Fase 1
 */
import { supabase } from '@/lib/supabaseClient';
export class LeadService {
    /**
     * Criar novo lead
     */
    static async createLead(input) {
        const { data, error } = await supabase
            .from('leads')
            .insert({
            ...input,
            created_by: (await supabase.auth.getUser()).data.user?.id,
        })
            .select()
            .single();
        if (error) {
            throw new Error(`Erro ao criar lead: ${error.message}`);
        }
        return data;
    }
    /**
     * Listar leads com filtros
     */
    static async listLeads(filters, page = 1, limit = 50) {
        let query = supabase
            .from('leads')
            .select('*', { count: 'exact' })
            .eq('clinic_id', filters.clinic_id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });
        // Aplicar filtros
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.source) {
            query = query.eq('source', filters.source);
        }
        if (filters.urgency_level) {
            query = query.eq('urgency_level', filters.urgency_level);
        }
        if (filters.assigned_to) {
            query = query.eq('assigned_to', filters.assigned_to);
        }
        if (filters.date_from) {
            query = query.gte('created_at', filters.date_from);
        }
        if (filters.date_to) {
            query = query.lte('created_at', filters.date_to);
        }
        // Busca textual
        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
        }
        // Paginação
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
        const { data, error, count } = await query;
        if (error) {
            throw new Error(`Erro ao listar leads: ${error.message}`);
        }
        return {
            leads: data,
            total: count || 0,
            page,
            limit,
        };
    }
    /**
     * Buscar lead por ID
     */
    static async getLeadById(leadId) {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('id', leadId)
            .is('deleted_at', null)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Not found
            }
            throw new Error(`Erro ao buscar lead: ${error.message}`);
        }
        return data;
    }
    /**
     * Atualizar lead
     */
    static async updateLead(leadId, input) {
        const { data, error } = await supabase
            .from('leads')
            .update(input)
            .eq('id', leadId)
            .is('deleted_at', null)
            .select()
            .single();
        if (error) {
            throw new Error(`Erro ao atualizar lead: ${error.message}`);
        }
        return data;
    }
    /**
     * Soft delete de lead
     */
    static async deleteLead(leadId) {
        const { error } = await supabase
            .from('leads')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', leadId);
        if (error) {
            throw new Error(`Erro ao deletar lead: ${error.message}`);
        }
    }
    /**
     * Converter lead em paciente
     */
    static async convertLeadToPatient(leadId) {
        // 1. Buscar lead
        const lead = await this.getLeadById(leadId);
        if (!lead) {
            throw new Error('Lead não encontrado');
        }
        if (lead.status === 'convertido') {
            throw new Error('Lead já foi convertido');
        }
        // 2. Criar paciente
        const { data: patient, error: patientError } = await supabase
            .from('patients')
            .insert({
            clinic_id: lead.clinic_id,
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            source: lead.source,
            notes: lead.pain_description ? [lead.pain_description] : [],
            created_by: (await supabase.auth.getUser()).data.user?.id,
        })
            .select()
            .single();
        if (patientError) {
            throw new Error(`Erro ao criar paciente: ${patientError.message}`);
        }
        // 3. Atualizar lead
        const updatedLead = await this.updateLead(leadId, {
            status: 'convertido',
            // @ts-ignore
            converted_to_patient_id: patient.id,
            // @ts-ignore
            converted_at: new Date().toISOString(),
        });
        return {
            patientId: patient.id,
            lead: updatedLead,
        };
    }
    /**
     * Agendar follow-up
     */
    static async scheduleFollowUp(leadId, followUpDate) {
        return this.updateLead(leadId, {
            next_follow_up_at: followUpDate.toISOString(),
        });
    }
    /**
     * Buscar leads que precisam de follow-up
     */
    static async getLeadsNeedingFollowUp(clinicId) {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('clinic_id', clinicId)
            .not('status', 'in', '(convertido,perdido)')
            .lte('next_follow_up_at', new Date().toISOString())
            .is('deleted_at', null)
            .order('urgency_level', { ascending: false })
            .order('next_follow_up_at', { ascending: true });
        if (error) {
            throw new Error(`Erro ao buscar leads para follow-up: ${error.message}`);
        }
        return data;
    }
    /**
     * Contar leads por status
     */
    static async countLeadsByStatus(clinicId) {
        const { data, error } = await supabase
            .from('leads')
            .select('status')
            .eq('clinic_id', clinicId)
            .is('deleted_at', null);
        if (error) {
            throw new Error(`Erro ao contar leads: ${error.message}`);
        }
        const counts = {
            novo: 0,
            contatado: 0,
            qualificado: 0,
            agendado: 0,
            convertido: 0,
            perdido: 0,
        };
        data.forEach((lead) => {
            counts[lead.status] = (counts[lead.status] || 0) + 1;
        });
        return counts;
    }
    /**
     * Buscar leads por telefone (para identificar no WhatsApp)
     */
    static async findLeadByPhone(phone, clinicId) {
        // Normalizar telefone (remover caracteres especiais)
        const normalizedPhone = phone.replace(/\D/g, '');
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('clinic_id', clinicId)
            .or(`phone.eq.${phone},phone.eq.${normalizedPhone},phone.like.%${normalizedPhone}`)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Not found
            }
            throw new Error(`Erro ao buscar lead por telefone: ${error.message}`);
        }
        return data;
    }
    /**
     * Adicionar nota ao lead
     */
    static async addNote(leadId, note) {
        const lead = await this.getLeadById(leadId);
        if (!lead) {
            throw new Error('Lead não encontrado');
        }
        const notes = [...(lead.notes || []), `${new Date().toISOString()}: ${note}`];
        return this.updateLead(leadId, { notes });
    }
    /**
     * Adicionar tag ao lead
     */
    static async addTag(leadId, tag) {
        const lead = await this.getLeadById(leadId);
        if (!lead) {
            throw new Error('Lead não encontrado');
        }
        const tags = [...(lead.tags || []), tag];
        return this.updateLead(leadId, { tags: [...new Set(tags)] }); // Remove duplicatas
    }
}
