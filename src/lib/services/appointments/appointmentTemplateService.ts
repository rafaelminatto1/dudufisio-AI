import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';

export type DocumentTemplate = any; // Database['public']['Tables']['document_templates']['Row'];

/**
 * Service para gerenciar templates de documentos
 * Adaptado para Next.js App Router com Supabase
 */
export class AppointmentTemplateService {
  /**
   * Lista todos os templates ordenados por uso
   */
  static async listTemplates(userId?: string) {
    try {
      const supabase = await createServerComponentClient();
      // document_templates table not in schema yet
      let query = (supabase as any).from('document_templates')
        .select('*')
        .order('usage_count', { ascending: false });

      if (userId) {
        query = query.or(`created_by.eq.${userId},is_public.eq.true`);
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
      // document_templates table not in schema yet
      const { data, error } = await (supabase as any).from('document_templates')
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
    template: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count' | 'last_used'>
  ) {
    try {
      const supabase = await createServerComponentClient();
      // document_templates table not in schema yet
      const { data, error } = await (supabase as any).from('document_templates')
        .insert({
          title: template.title,
          content: template.content,
          category: template.category,
          tags: template.tags,
          is_public: template.is_public || false,
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
    updates: Partial<Omit<DocumentTemplate, 'id' | 'created_at' | 'created_by' | 'usage_count'>>
  ) {
    try {
      const supabase = await createServerComponentClient();
      // document_templates table not in schema yet
      const { data, error } = await (supabase as any).from('document_templates')
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
      // document_templates table not in schema yet
      const { error } = await (supabase as any).from('document_templates')
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
        // document_templates table not in schema yet
        const { data: template } = await (supabase as any).from('document_templates')
          .select('usage_count')
          .eq('id', id)
          .single();

        if (template) {
          const currentCount = (template as Record<string, unknown>).usage_count;
          const usageCount = typeof currentCount === 'number' ? currentCount : 0;
          // document_templates table not in schema yet
          await (supabase as any).from('document_templates')
            .update({ usage_count: usageCount + 1 })
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
      // document_templates table not in schema yet
      const { data, error } = await (supabase as any).from('document_templates')
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
      // document_templates table not in schema yet
      const { data, error } = await (supabase as any).from('document_templates')
        .select('*')
        .or(`title.ilike.%${lowerQuery}%,category.ilike.%${lowerQuery}%,content.ilike.%${lowerQuery}%`)
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
      // document_templates table not in schema yet
      const { data, error } = await (supabase as any).from('document_templates')
        .select('*')
        .eq('is_public', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting default templates:', error);
      return { data: null, error };
    }
  }
}

