/**
 * ClinicalMaterialService - Lógica de negócio para materiais clínicos
 * Usa ClinicalMaterialRepository para acesso ao banco
 * Contém validações, transformações e regras de negócio
 */

import { clinicalMaterialRepository, type MaterialFilters } from '../repositories/ClinicalMaterialRepository';
import type { Material, MaterialCategory } from '@/types';
import type { Database } from '@/types/supabase';
import { eventService } from '../eventService';
import { secureLogger } from '@/lib/secureLogger';
import { withSupabaseQuery, withSupabaseMutation } from '@/lib/supabase/errorHandler';

type MaterialRow = Database['public']['Tables']['clinical_materials']['Row'];
type MaterialInsert = Database['public']['Tables']['clinical_materials']['Insert'];

export class ClinicalMaterialService {
  /**
   * Busca todos os materiais com filtros opcionais
   */
  async getAll(filters?: MaterialFilters): Promise<Material[]> {
    return withSupabaseQuery(
      async () => {
        const materials = await clinicalMaterialRepository.findMany(filters);
        return materials.map(m => this.transformToMaterial(m));
      },
      {
        operation: 'getAll',
        fallbackMessage: 'Erro ao buscar materiais clínicos',
      }
    );
  }

  /**
   * Busca material por ID
   */
  async getById(id: string): Promise<Material | null> {
    return withSupabaseQuery(
      async () => {
        const material = await clinicalMaterialRepository.findById(id);
        return material ? this.transformToMaterial(material) : null;
      },
      {
        operation: 'getById',
        fallbackMessage: 'Erro ao buscar material',
      }
    );
  }

  /**
   * Busca materiais por categoria
   */
  async getByCategory(categoryId: string): Promise<Material[]> {
    return withSupabaseQuery(
      async () => {
        const materials = await clinicalMaterialRepository.findByCategory(categoryId);
        return materials.map(m => this.transformToMaterial(m));
      },
      {
        operation: 'getByCategory',
        fallbackMessage: 'Erro ao buscar materiais da categoria',
      }
    );
  }

  /**
   * Busca materiais publicados
   */
  async getPublished(): Promise<Material[]> {
    return withSupabaseQuery(
      async () => {
        const materials = await clinicalMaterialRepository.findPublished();
        return materials.map(m => this.transformToMaterial(m));
      },
      {
        operation: 'getPublished',
        fallbackMessage: 'Erro ao buscar materiais publicados',
      }
    );
  }

  /**
   * Busca textual
   */
  async search(query: string): Promise<Material[]> {
    return withSupabaseQuery(
      async () => {
        const materials = await clinicalMaterialRepository.search(query);
        return materials.map(m => this.transformToMaterial(m));
      },
      {
        operation: 'search',
        fallbackMessage: 'Erro ao buscar materiais',
      }
    );
  }

  /**
   * Busca todas as categorias
   */
  async getCategories(): Promise<MaterialCategory[]> {
    return withSupabaseQuery(
      async () => {
        return clinicalMaterialRepository.getCategories() as Promise<MaterialCategory[]>;
      },
      {
        operation: 'getCategories',
        fallbackMessage: 'Erro ao buscar categorias',
      }
    );
  }

  /**
   * Busca por tags
   */
  async getByTags(tags: string[]): Promise<Material[]> {
    return withSupabaseQuery(
      async () => {
        const materials = await clinicalMaterialRepository.findByTags(tags);
        return materials.map(m => this.transformToMaterial(m));
      },
      {
        operation: 'getByTags',
        fallbackMessage: 'Erro ao buscar materiais por tags',
      }
    );
  }

  /**
   * Cria ou atualiza um material
   */
  async save(materialData: Material): Promise<Material> {
    return withSupabaseMutation(
      async () => {
        // Validações de negócio
        this.validateMaterial(materialData);

        // Transformar para formato do DB
        const dbData = this.transformToDbFormat(materialData);

        let savedMaterial: MaterialRow;

        if (materialData.id) {
          // Update
          savedMaterial = await clinicalMaterialRepository.update(materialData.id, dbData);
          secureLogger.info('Material atualizado', { materialId: materialData.id });
        } else {
          // Create
          savedMaterial = await clinicalMaterialRepository.create(dbData);
          secureLogger.info('Material criado', { materialId: savedMaterial.id });
        }

        // Emitir evento para invalidar cache
        eventService.emit('materials:changed');

        return this.transformToMaterial(savedMaterial);
      },
      {
        operation: 'save',
        fallbackMessage: 'Erro ao salvar material',
      }
    );
  }

  /**
   * Publica um material (muda status para published)
   */
  async publish(id: string): Promise<Material> {
    return withSupabaseMutation(
      async () => {
        const material = await clinicalMaterialRepository.update(id, {
          status: 'published',
        });
        
        secureLogger.info('Material publicado', { materialId: id });
        eventService.emit('materials:changed');
        
        return this.transformToMaterial(material);
      },
      {
        operation: 'publish',
        fallbackMessage: 'Erro ao publicar material',
      }
    );
  }

  /**
   * Arquiva um material
   */
  async archive(id: string): Promise<Material> {
    return withSupabaseMutation(
      async () => {
        const material = await clinicalMaterialRepository.update(id, {
          status: 'archived',
        });
        
        secureLogger.info('Material arquivado', { materialId: id });
        eventService.emit('materials:changed');
        
        return this.transformToMaterial(material);
      },
      {
        operation: 'archive',
        fallbackMessage: 'Erro ao arquivar material',
      }
    );
  }

  /**
   * Deleta um material
   */
  async delete(id: string): Promise<void> {
    return withSupabaseMutation(
      async () => {
        await clinicalMaterialRepository.delete(id);
        secureLogger.info('Material deletado', { materialId: id });
        eventService.emit('materials:changed');
      },
      {
        operation: 'delete',
        fallbackMessage: 'Erro ao deletar material',
      }
    );
  }

  /**
   * Valida dados do material
   */
  private validateMaterial(material: Material): void {
    if (!material.name || material.name.trim().length < 3) {
      throw new Error('Nome do material é obrigatório (mínimo 3 caracteres)');
    }

    if (!material.type) {
      throw new Error('Tipo do material é obrigatório');
    }

    if (!material.categoryId) {
      throw new Error('Categoria é obrigatória');
    }
  }

  /**
   * Transforma MaterialRow do DB para Material da aplicação
   */
  private transformToMaterial(row: MaterialRow): Material {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      type: row.type,
      categoryId: row.category_id,
      content: row.content || '',
      tags: (row.tags as string[]) || [],
      status: (row.status as 'draft' | 'published' | 'archived') || 'draft',
      createdBy: row.created_by || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Transforma Material da aplicação para formato do DB
   */
  private transformToDbFormat(material: Material): Partial<MaterialInsert> {
    return {
      name: material.name,
      description: material.description || null,
      type: material.type,
      category_id: material.categoryId,
      content: material.content || null,
      tags: material.tags || null,
      status: material.status || 'draft',
      created_by: material.createdBy || null,
    };
  }
}

// Singleton instance
export const clinicalMaterialService = new ClinicalMaterialService();

