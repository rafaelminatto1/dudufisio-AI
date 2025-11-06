/**
 * Clinical Materials Service
 * MoocaFisio - Sistema de Gestão de Clínicas de Fisioterapia
 * 
 * Serviço para gerenciar materiais clínicos (fichas, escalas, formulários)
 */

import { supabase } from '../../../../shared/services/supabaseClient';
import type { 
  ClinicalMaterial, 
  MaterialFilters, 
  MaterialFavorite 
} from './types';

class ClinicalMaterialsService {
  /**
   * Buscar todos os materiais com filtros opcionais
   */
  async getAll(filters?: MaterialFilters): Promise<ClinicalMaterial[]> {
    try {
      let query = supabase
        .from('clinical_materials')
        .select('*')
        .eq('status', 'published')
        .order('name', { ascending: true });

      // Filtro por categoria
      if (filters?.category) {
        query = query.eq('type', filters.category);
      }

      // Filtro por especialidade
      if (filters?.specialty) {
        query = query.contains('tags', [filters.specialty]);
      }

      // Filtro de busca por nome, descrição ou tags
      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar materiais:', error);
        throw error;
      }

      let materials = data || [];

      // Se filtro de favoritos estiver ativo
      if (filters?.favorites_only) {
        const favorites = await this.getFavorites();
        const favoriteIds = new Set(favorites.map(f => f.material_id));
        materials = materials.filter(m => favoriteIds.has(m.id));
      }

      // Adicionar flag is_favorite para cada material
      const favoritesMap = await this.getFavoritesMap();
      materials = materials.map(material => ({
        ...material,
        is_favorite: favoritesMap.has(material.id),
      }));

      return materials;
    } catch (error) {
      console.error('Erro no serviço getAll:', error);
      return [];
    }
  }

  /**
   * Buscar material por ID
   */
  async getById(id: string): Promise<ClinicalMaterial | null> {
    try {
      const { data, error } = await supabase
        .from('clinical_materials')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Adicionar flag is_favorite
      const favoritesMap = await this.getFavoritesMap();
      return {
        ...data,
        is_favorite: favoritesMap.has(id),
      };
    } catch (error) {
      console.error('Erro ao buscar material por ID:', error);
      return null;
    }
  }

  /**
   * Fazer download de um material
   */
  async download(materialId: string): Promise<void> {
    try {
      // 1. Incrementar contador de downloads
      const { error: rpcError } = await supabase.rpc('increment_material_download', {
        p_material_id: materialId,
      });

      if (rpcError) {
        console.warn('Erro ao incrementar contador:', rpcError);
        // Continuar mesmo com erro no contador
      }

      // 2. Buscar informações do material
      const { data: material, error } = await supabase
        .from('clinical_materials')
        .select('file_url, name, file_type')
        .eq('id', materialId)
        .single();

      if (error || !material) {
        throw new Error('Material não encontrado');
      }

      // 3. Fazer download no navegador
      const link = document.createElement('a');
      link.href = material.file_url;
      link.download = `${material.name}.${material.file_type || 'pdf'}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      throw error;
    }
  }

  /**
   * Alternar favorito (adicionar/remover)
   */
  async toggleFavorite(materialId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se já existe
      const { data: existing } = await supabase
        .from('material_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('material_id', materialId)
        .single();

      if (existing) {
        // Remover dos favoritos
        const { error } = await supabase
          .from('material_favorites')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
        return false; // Não é mais favorito
      } else {
        // Adicionar aos favoritos
        const { error } = await supabase
          .from('material_favorites')
          .insert({
            user_id: user.id,
            material_id: materialId,
          });

        if (error) throw error;
        return true; // Agora é favorito
      }
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
      throw error;
    }
  }

  /**
   * Buscar materiais por texto
   */
  async search(query: string): Promise<ClinicalMaterial[]> {
    return this.getAll({ search: query });
  }

  /**
   * Obter lista de favoritos do usuário
   */
  private async getFavorites(): Promise<MaterialFavorite[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];

      const { data, error } = await supabase
        .from('material_favorites')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      return [];
    }
  }

  /**
   * Obter mapa de IDs de favoritos para checagem rápida
   */
  private async getFavoritesMap(): Promise<Set<string>> {
    const favorites = await this.getFavorites();
    return new Set(favorites.map(f => f.material_id));
  }

  /**
   * Obter estatísticas de uso
   */
  async getStats(): Promise<{
    totalMaterials: number;
    totalDownloads: number;
    favoriteCount: number;
  }> {
    try {
      const [materials, favorites] = await Promise.all([
        this.getAll(),
        this.getFavorites(),
      ]);

      const totalDownloads = materials.reduce(
        (sum, m) => sum + (m.download_count || 0),
        0
      );

      return {
        totalMaterials: materials.length,
        totalDownloads,
        favoriteCount: favorites.length,
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        totalMaterials: 0,
        totalDownloads: 0,
        favoriteCount: 0,
      };
    }
  }
}

export const clinicalMaterialsService = new ClinicalMaterialsService();
export default clinicalMaterialsService;

