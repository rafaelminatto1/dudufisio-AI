import { supabase } from '@/lib/supabaseClient';
import { Protocol, ProtocolCategory, EvidenceLevel } from '@/types';

export class ProtocolCRUDService {
  /**
   * Get all protocols with optional filters
   */
  static async getAll(filters?: {
    category?: ProtocolCategory;
    evidenceLevel?: EvidenceLevel;
    status?: 'draft' | 'review' | 'approved' | 'deprecated';
    isActive?: boolean;
    search?: string;
  }): Promise<Protocol[]> {
    let query = supabase
      .from('clinical_protocols')
      .select('*')
      .order('name', { ascending: true });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.evidenceLevel) {
      query = query.eq('evidence_level', filters.evidenceLevel);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Get protocol by ID
   */
  static async getById(id: string): Promise<Protocol | null> {
    const { data, error } = await supabase
      .from('clinical_protocols')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create a new protocol
   */
  static async create(protocol: Partial<Protocol>): Promise<Protocol> {
    const { data, error } = await supabase
      .from('clinical_protocols')
      .insert([protocol])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update a protocol
   */
  static async update(id: string, protocol: Partial<Protocol>): Promise<Protocol> {
    const { data, error } = await supabase
      .from('clinical_protocols')
      .update(protocol)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a protocol
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clinical_protocols')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Get protocols by category
   */
  static async getByCategory(category: ProtocolCategory): Promise<Protocol[]> {
    const { data, error } = await supabase
      .from('clinical_protocols')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get most used protocols
   */
  static async getMostUsed(limit: number = 10): Promise<Protocol[]> {
    const { data, error } = await supabase
      .from('clinical_protocols')
      .select('*')
      .eq('is_active', true)
      .order('times_used', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Search protocols
   */
  static async search(query: string, limit: number = 20): Promise<Protocol[]> {
    const { data, error } = await supabase
      .from('clinical_protocols')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
      .eq('is_active', true)
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get protocol statistics
   */
  static async getStatistics() {
    const { data, error } = await supabase
      .from('clinical_protocols')
      .select('category, evidence_level, count(*)', { count: 'exact' });

    if (error) throw error;

    return {
      byCategory: data?.reduce((acc: any, row: any) => {
        acc[row.category] = row.count || 0;
        return acc;
      }, {}),
      byEvidenceLevel: data?.reduce((acc: any, row: any) => {
        acc[row.evidence_level] = (acc[row.evidence_level] || 0) + (row.count || 0);
        return acc;
      }, {}),
    };
  }
}

