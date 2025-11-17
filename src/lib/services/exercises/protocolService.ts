import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';

type Treatment = Database['public']['Tables']['treatments']['Row'];

export interface Protocol {
  id: string;
  name: string;
  description: string;
  category: string;
  pathology: string;
  phase: 'acute' | 'subacute' | 'chronic' | 'maintenance';
  duration_weeks: number;
  frequency_per_week: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Service para gerenciar protocolos de tratamento
 * Adaptado para Next.js App Router
 */
export class ProtocolService {
  /**
   * Lista todos os protocolos
   */
  static async getProtocols(filters?: {
    pathology?: string;
    phase?: string;
    category?: string;
  }) {
    try {
      const supabase = await createServerComponentClient();
      let query = supabase
        .from('treatment_protocols')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (filters?.pathology) {
        query = query.ilike('pathology', `%${filters.pathology}%`);
      }

      if (filters?.phase) {
        query = query.eq('phase', filters.phase);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
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
        .from('treatment_protocols')
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
      return await this.getProtocols({ pathology: lowerDiagnosis });
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
        .from('treatment_protocols')
        .insert({
          name: protocol.name,
          description: protocol.description,
          category: protocol.category,
          pathology: protocol.pathology,
          phase: protocol.phase,
          duration_weeks: protocol.duration_weeks,
          frequency_per_week: protocol.frequency_per_week,
          is_active: protocol.is_active ?? true,
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
        .from('treatment_protocols')
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
        .from('treatment_protocols')
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

