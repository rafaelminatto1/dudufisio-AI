import { createServerComponentClient } from '~/lib/supabase/server';


type ClinicalMaterial = Database['public']['Tables']['materials_library']['Row'];
type ClinicalMaterialInsert = Database['public']['Tables']['materials_library']['Insert'];
type ClinicalMaterialUpdate = Database['public']['Tables']['materials_library']['Update'];


export interface MaterialSearchParams {
  query?: string;
  categoryId?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  createdBy?: string;
  limit?: number;
  offset?: number;
}

export interface MaterialCreateData {
  name: string;
  description?: string;
  type: string;
  category_id: string;
  content?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
}

export class ClinicalMaterialService {


  /**
   * Get materials by category
   */
  static async getMaterialsByCategory(categoryId: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('materials_library' as any)
        .select('id, title, description, file_url, file_type, category, tags, is_public, download_count, version, author, owner_id, created_at, updated_at, thumbnail_url')
        .eq('category', categoryId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching materials by category:', error);
      return { data: null, error };
    }
  }

  /**
   * Search materials
   */
  static async searchMaterials(params: MaterialSearchParams = {}) {
    try {
      const supabase = await createServerComponentClient();
      let query = supabase
        .from('materials_library' as any)
        .select('id, title, description, file_url, file_type, category, tags, is_public, download_count, version, author, owner_id, created_at, updated_at, thumbnail_url');

      if (params.query) {
        query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%`);
      }

      if (params.categoryId) {
        query = query.eq('category', params.categoryId);
      }

      if (params.tags && params.tags.length > 0) {
        query = query.contains('tags', params.tags);
      }

      if (params.createdBy) {
        query = query.eq('created_by', params.createdBy);
      }

      query = query
        .order('updated_at', { ascending: false })
        .range(
          params.offset || 0,
          (params.offset || 0) + (params.limit || 50) - 1
        );

      const { data, error, count } = await query;

      if (error) throw error;
      return { data, count, error: null };
    } catch (error) {
      console.error('Error searching materials:', error);
      return { data: null, count: 0, error };
    }
  }

  /**
   * Get material by ID
   */
  static async getById(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('materials_library' as any)
        .select('id, title, description, file_url, file_type, category, tags, is_public, download_count, version, author, owner_id, created_at, updated_at, thumbnail_url')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching material:', error);
      return { data: null, error };
    }
  }

  /**
   * Create a new material
   */
  static async create(materialData: MaterialCreateData) {
    try {
      const supabase = await createServerComponentClient();
      
      const insertData: ClinicalMaterialInsert = {
        title: materialData.name,
        description: materialData.description,
        file_type: materialData.type,
        category: materialData.category_id,
        tags: materialData.tags || [],
        is_public: false,
        download_count: 0,
        file_url: '', // Add a default value for file_url
      };

      const { data, error } = await supabase
        .from('materials_library' as any)
        .insert(insertData)
        .select('id, title, description, file_url, file_type, category, tags, is_public, download_count, version, author, owner_id, created_at, updated_at, thumbnail_url')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating material:', error);
      return { data: null, error };
    }
  }

  /**
   * Update a material
   */
  static async update(id: string, updates: Partial<MaterialCreateData>) {
    try {
      const supabase = await createServerComponentClient();
      
      const updateData: ClinicalMaterialUpdate = {
        title: updates.name,
        description: updates.description,
        file_type: updates.type,
        category: updates.category_id,
        tags: updates.tags,
        updated_at: new Date().toISOString(),
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(
        (key) => updateData[key as keyof ClinicalMaterialUpdate] === undefined && delete updateData[key as keyof ClinicalMaterialUpdate]
      );

      const { data, error } = await supabase
        .from('materials_library' as any)
        .update(updateData)
        .eq('id', id)
        .select('id, title, description, file_url, file_type, category, tags, is_public, download_count, version, author, owner_id, created_at, updated_at, thumbnail_url')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating material:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete a material
   */
  static async delete(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { error } = await supabase
        .from('materials_library' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting material:', error);
      return { error };
    }
  }

  /**
   * Get materials statistics
   */
  static async getStats() {
    try {
      const supabase = await createServerComponentClient();
      
      const { count: total, error: totalError } = await supabase
        .from('materials_library' as any)
        .select('id', { count: 'exact', head: true });

      if (totalError) throw totalError;

      const { count: published, error: publishedError } = await supabase
        .from('materials_library' as any)
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published');

      if (publishedError) throw publishedError;

      const { count: draft, error: draftError } = await supabase
        .from('materials_library' as any)
        .select('id', { count: 'exact', head: true })
        .eq('status', 'draft');

      if (draftError) throw draftError;

      return {
        data: {
          total: total || 0,
          published: published || 0,
          draft: draft || 0,
          categories: 0,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error fetching material stats:', error);
      return { data: null, error };
    }
  }
}

