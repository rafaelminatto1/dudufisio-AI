import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';

export type Protocol = Database['public']['Tables']['exercise_protocols']['Row'];

/**
 * Service para gerenciar protocolos de tratamento
 * Adaptado para Next.js App Router
 */
export class ProtocolService {
  /**
   * Lista todos os protocolos
   */
  static async getProtocols(filters?: {
    body_part?: string;
    difficulty?: string;
    tags?: string[];
  }) {
    try {
      const supabase = await createServerComponentClient();
      let query = supabase
        .from('exercise_protocols')
        .select('*')
        .order('name', { ascending: true });

      if (filters?.body_part) {
        query = query.ilike('body_part', `%${filters.body_part}%`);
      }

      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      if (filters?.tags) {
        query = query.contains('tags', filters.tags);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching protocols:', error);
      return { data: null, error };
    }
  }

  /**
   * Busca um protocolo por ID
   */
  static async getProtocolById(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('exercise_protocols')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching protocol:', error);
      return { data: null, error };
    }
  }

  /**
   * Busca protocolos sugeridos baseado em diagnóstico
   */
  static async getProtocolSuggestions(diagnosis: string) {
    try {
      const lowerDiagnosis = diagnosis.toLowerCase();
      return await this.getProtocols({ body_part: lowerDiagnosis });
    } catch (error) {
      console.error('Error getting protocol suggestions:', error);
      return { data: null, error };
    }
  }

  /**
   * Cria um novo protocolo
   */
  static async createProtocol(protocol: Omit<Protocol, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('exercise_protocols')
        .insert({
          name: protocol.name,
          description: protocol.description,
          body_part: protocol.body_part,
          difficulty: protocol.difficulty,
          tags: protocol.tags,
          is_public: protocol.is_public ?? false,
          owner_id: protocol.owner_id,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating protocol:', error);
      return { data: null, error };
    }
  }

  /**
   * Atualiza um protocolo
   */
  static async updateProtocol(id: string, updates: Partial<Protocol>) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('exercise_protocols')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating protocol:', error);
      return { data: null, error };
    }
  }

  /**
   * Deleta um protocolo
   */
  static async deleteProtocol(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { error } = await supabase
        .from('exercise_protocols')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error deleting protocol:', error);
      return { data: null, error };
    }
  }
}

