import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';

export interface AppointmentTemplate {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  type: string;
  duration: number; // em minutos
  value?: number;
  color?: string;
  is_default?: boolean;
  settings: {
    allow_recurrence?: boolean;
    default_recurrence?: 'weekly' | 'biweekly' | 'monthly';
    requires_room?: boolean;
    requires_equipment?: string[];
    max_sessions?: number;
  };
  created_at: string;
  updated_at: string;
  created_by: string;
  usage_count: number;
}

/**
 * Service para gerenciar templates de agendamento
 * Adaptado para Next.js App Router com Supabase
 */
export class AppointmentTemplateService {
  /**
   * Lista todos os templates ordenados por uso
   */
  static async listTemplates(userId?: string) {
    try {
      const supabase = await createServerComponentClient();
      let query = supabase
        .from('appointment_templates')
        .select('*')
        .order('usage_count', { ascending: false });

      if (userId) {
        query = query.or(`created_by.eq.${userId},is_default.eq.true`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error listing templates:', error);
      return { data: null, error };
    }
  }

  /**
   * Busca um template por ID
   */
  static async getTemplate(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('appointment_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting template:', error);
      return { data: null, error };
    }
  }

  /**
   * Cria um novo template
   */
  static async createTemplate(
    template: Omit<AppointmentTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count'>
  ) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('appointment_templates')
        .insert({
          name: template.name,
          description: template.description,
          icon: template.icon,
          type: template.type,
          duration: template.duration,
          value: template.value,
          color: template.color,
          is_default: template.is_default || false,
          settings: template.settings,
          created_by: template.created_by,
          usage_count: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating template:', error);
      return { data: null, error };
    }
  }

  /**
   * Atualiza um template
   */
  static async updateTemplate(
    id: string,
    updates: Partial<Omit<AppointmentTemplate, 'id' | 'created_at' | 'created_by' | 'usage_count'>>
  ) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('appointment_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating template:', error);
      return { data: null, error };
    }
  }

  /**
   * Deleta um template
   */
  static async deleteTemplate(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { error } = await supabase
        .from('appointment_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error deleting template:', error);
      return { data: null, error };
    }
  }

  /**
   * Incrementa o contador de uso de um template
   */
  static async incrementUsage(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { error } = await supabase.rpc('increment_template_usage', {
        template_id: id,
      });

      if (error) {
        // Se a função RPC não existir, fazer update manual
        const { data: template } = await supabase
          .from('appointment_templates')
          .select('usage_count')
          .eq('id', id)
          .single();

        if (template) {
          await supabase
            .from('appointment_templates')
            .update({ usage_count: (template.usage_count || 0) + 1 })
            .eq('id', id);
        }
      }

      return { data: true, error: null };
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return { data: null, error };
    }
  }

  /**
   * Busca os templates mais usados
   */
  static async getMostUsed(limit: number = 5) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('appointment_templates')
        .select('*')
        .order('usage_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting most used templates:', error);
      return { data: null, error };
    }
  }

  /**
   * Busca templates por query
   */
  static async searchTemplates(query: string) {
    try {
      const supabase = await createServerComponentClient();
      const lowerQuery = query.toLowerCase();
      const { data, error } = await supabase
        .from('appointment_templates')
        .select('*')
        .or(`name.ilike.%${lowerQuery}%,type.ilike.%${lowerQuery}%,description.ilike.%${lowerQuery}%`)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error searching templates:', error);
      return { data: null, error };
    }
  }

  /**
   * Busca templates padrão
   */
  static async getDefaultTemplates() {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('appointment_templates')
        .select('*')
        .eq('is_default', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting default templates:', error);
      return { data: null, error };
    }
  }
}

