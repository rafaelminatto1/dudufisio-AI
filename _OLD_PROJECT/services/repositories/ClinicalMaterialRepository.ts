/**
 * ClinicalMaterialRepository - Repository para materiais clínicos
 * Responsável por operações de banco de dados relacionadas a clinical_materials
 */

import { BaseRepository } from './BaseRepository';
import type { Database } from '@/types/supabase';
import type { QueryOptions } from '../types/RepositoryTypes';

type MaterialRow = Database['public']['Tables']['clinical_materials']['Row'];
type MaterialInsert = Database['public']['Tables']['clinical_materials']['Insert'];
type MaterialUpdate = Database['public']['Tables']['clinical_materials']['Update'];

type CategoryRow = Database['public']['Tables']['clinical_material_categories']['Row'];

export interface MaterialFilters {
  categoryId?: string;
  status?: string | string[];
  tags?: string[];
  search?: string;
}

export class ClinicalMaterialRepository extends BaseRepository<
  MaterialRow,
  MaterialInsert,
  MaterialUpdate
> {
  protected tableName = 'clinical_materials';

  /**
   * Busca materiais com filtros
   */
  async findMany(
    filters?: MaterialFilters,
    options?: QueryOptions
  ): Promise<MaterialRow[]> {
    let query = this.supabase.from(this.tableName).select('*');

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    if (filters?.search && filters.search.length >= 2) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(
        `name.ilike.${searchTerm},description.ilike.${searchTerm}`
      );
    }

    query = this.applyOptions(query, options);

    if (!options?.sort) {
      query = query.order('created_at', { ascending: false });
    }

    return this.executeQuery(() => query, 'findMany');
  }

  /**
   * Busca materiais por categoria
   */
  async findByCategory(
    categoryId: string,
    options?: QueryOptions
  ): Promise<MaterialRow[]> {
    return this.findMany({ categoryId }, options);
  }

  /**
   * Busca materiais publicados
   */
  async findPublished(options?: QueryOptions): Promise<MaterialRow[]> {
    return this.findMany({ status: 'published' }, options);
  }

  /**
   * Busca todas as categorias
   */
  async getCategories(): Promise<CategoryRow[]> {
    const { data, error } = await this.supabase
      .from('clinical_material_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      this.handleError(error, 'getCategories');
    }

    return data || [];
  }

  /**
   * Busca por tags
   */
  async findByTags(tags: string[], options?: QueryOptions): Promise<MaterialRow[]> {
    return this.findMany({ tags }, options);
  }

  /**
   * Busca textual
   */
  async search(query: string, options?: QueryOptions): Promise<MaterialRow[]> {
    if (query.length < 2) {
      return [];
    }

    return this.findMany({ search: query }, options);
  }
}

// Singleton instance
export const clinicalMaterialRepository = new ClinicalMaterialRepository();

