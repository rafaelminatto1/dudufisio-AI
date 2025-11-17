import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';

type ClinicalMaterial = Database['public']['Tables']['clinical_materials']['Row'];
type ClinicalMaterialInsert = Database['public']['Tables']['clinical_materials']['Insert'];
type ClinicalMaterialUpdate = Database['public']['Tables']['clinical_materials']['Update'];
type ClinicalMaterialCategory = Database['public']['Tables']['clinical_material_categories']['Row'];

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
   * Get all categories
   */
  static async getCategories() {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('clinical_material_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { data: null, error };
    }
  }

  /**
   * Get materials by category
   */
  static async getMaterialsByCategory(categoryId: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('clinical_materials')
        .select('*, category:clinical_material_categories(*)')
        .eq('category_id', categoryId)
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
        .from('clinical_materials')
        .select('*, category:clinical_material_categories(*)');

      if (params.query) {
        query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%,content.ilike.%${params.query}%`);
      }

      if (params.categoryId) {
        query = query.eq('category_id', params.categoryId);
      }

      if (params.tags && params.tags.length > 0) {
        query = query.contains('tags', params.tags);
      }

      if (params.status) {
        query = query.eq('status', params.status);
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
        .from('clinical_materials')
        .select('*, category:clinical_material_categories(*)')
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
        name: materialData.name,
        description: materialData.description,
        type: materialData.type,
        category_id: materialData.category_id,
        content: materialData.content,
        tags: materialData.tags || [],
        status: materialData.status || 'draft',
      };

      const { data, error } = await supabase
        .from('clinical_materials')
        .insert(insertData)
        .select('*, category:clinical_material_categories(*)')
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
        name: updates.name,
        description: updates.description,
        type: updates.type,
        category_id: updates.category_id,
        content: updates.content,
        tags: updates.tags,
        status: updates.status,
        updated_at: new Date().toISOString(),
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(
        (key) => updateData[key as keyof ClinicalMaterialUpdate] === undefined && delete updateData[key as keyof ClinicalMaterialUpdate]
      );

      const { data, error } = await supabase
        .from('clinical_materials')
        .update(updateData)
        .eq('id', id)
        .select('*, category:clinical_material_categories(*)')
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
        .from('clinical_materials')
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
        .from('clinical_materials')
        .select('id', { count: 'exact', head: true });

      if (totalError) throw totalError;

      const { count: published, error: publishedError } = await supabase
        .from('clinical_materials')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published');

      if (publishedError) throw publishedError;

      const { count: draft, error: draftError } = await supabase
        .from('clinical_materials')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'draft');

      if (draftError) throw draftError;

      const { count: categories, error: categoriesError } = await supabase
        .from('clinical_material_categories')
        .select('id', { count: 'exact', head: true });

      if (categoriesError) throw categoriesError;

      return {
        data: {
          total: total || 0,
          published: published || 0,
          draft: draft || 0,
          categories: categories || 0,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error fetching material stats:', error);
      return { data: null, error };
    }
  }
}

