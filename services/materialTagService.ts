// services/materialTagService.ts
import { supabase } from '../lib/supabaseClient';
import { secureLogger } from '../lib/secureLogger';

export interface TagStats {
  name: string;
  count: number;
  materials: string[];
}

export interface TagSearchResult {
  name: string;
  count: number;
  isPopular: boolean;
  suggested: boolean;
}

class MaterialTagService {
  private useSupabase = false;

  constructor() {
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    try {
      const { data, error } = await supabase.from('clinical_materials').select('count').limit(1);
      if (!error) {
        this.useSupabase = true;
        secureLogger.info('Material Tag Service initialized', {
          component: 'materialTagService',
          action: 'initialize',
          dataSource: 'supabase'
        });
      }
    } catch (error) {
      secureLogger.info('Material Tag Service fallback to mock', {
        component: 'materialTagService',
        action: 'initialize',
        dataSource: 'mock'
      });
    }
  }

  // Get all tags with usage statistics
  async getAllTags(): Promise<TagStats[]> {
    if (this.useSupabase) {
      try {
        // Get all materials with their tags
        const { data: materials, error } = await supabase
          .from('clinical_materials')
          .select('id, tags')
          .eq('status', 'published');

        if (error) throw error;

        // Count tag usage
        const tagMap = new Map<string, { count: number; materials: string[] }>();
        
        materials.forEach(material => {
          if (material.tags && Array.isArray(material.tags)) {
            material.tags.forEach((tag: string) => {
              if (!tagMap.has(tag)) {
                tagMap.set(tag, { count: 0, materials: [] });
              }
              const tagData = tagMap.get(tag)!;
              tagData.count++;
              tagData.materials.push(material.id);
            });
          }
        });

        // Convert to array and sort by count
        return Array.from(tagMap.entries())
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.count - a.count);
      } catch (error) {
        secureLogger.error('Failed to fetch tags', error, {
          component: 'materialTagService',
          action: 'getAllTags'
        });
        return this.getMockTags();
      }
    }
    return this.getMockTags();
  }

  // Search tags with autocomplete
  async searchTags(query: string, limit: number = 10): Promise<TagSearchResult[]> {
    const allTags = await this.getAllTags();
    const queryLower = query.toLowerCase();

    // Filter and rank tags
    const filtered = allTags
      .filter(tag => tag.name.toLowerCase().includes(queryLower))
      .map(tag => ({
        name: tag.name,
        count: tag.count,
        isPopular: tag.count >= 5, // Tag is popular if used in 5+ materials
        suggested: tag.count >= 3, // Tag is suggested if used in 3+ materials
      }))
      .sort((a, b) => {
        // Sort by relevance: exact match first, then popularity
        const aExact = a.name.toLowerCase().startsWith(queryLower);
        const bExact = b.name.toLowerCase().startsWith(queryLower);
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        return b.count - a.count;
      })
      .slice(0, limit);

    return filtered;
  }

  // Get popular tags
  async getPopularTags(limit: number = 10): Promise<TagStats[]> {
    const allTags = await this.getAllTags();
    return allTags.slice(0, limit);
  }

  // Get suggested tags for a material based on similar materials
  async getSuggestedTags(materialId: string, categoryId?: string): Promise<string[]> {
    if (this.useSupabase) {
      try {
        // Get tags from materials in the same category
        let query = supabase
          .from('clinical_materials')
          .select('tags')
          .eq('status', 'published')
          .not('id', 'eq', materialId);

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data: materials, error } = await query;

        if (error) throw error;

        // Count tag frequency in similar materials
        const tagCount = new Map<string, number>();
        
        materials.forEach(material => {
          if (material.tags && Array.isArray(material.tags)) {
            material.tags.forEach((tag: string) => {
              tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
            });
          }
        });

        // Return top 5 most frequent tags
        return Array.from(tagCount.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([tag]) => tag);
      } catch (error) {
        secureLogger.error('Failed to get suggested tags', error, {
          component: 'materialTagService',
          action: 'getSuggestedTags'
        });
        return this.getMockSuggestedTags();
      }
    }
    return this.getMockSuggestedTags();
  }

  // Create a new tag (if it doesn't exist)
  async createTag(tagName: string): Promise<void> {
    // Tags are automatically created when added to materials
    // This method is for future use if we want to pre-define tags
    secureLogger.debug('Tag creation deferred to material usage', {
      component: 'materialTagService',
      action: 'createTag'
    });
  }

  // Get tag statistics
  async getTagStats(tagName: string): Promise<TagStats | null> {
    const allTags = await this.getAllTags();
    return allTags.find(tag => tag.name === tagName) || null;
  }

  // Mock data methods
  private getMockTags(): TagStats[] {
    return [
      { name: 'Fisioterapia Respiratória', count: 8, materials: ['mat001', 'mat002', 'mat003'] },
      { name: 'Lombalgia', count: 12, materials: ['mat004', 'mat005', 'mat006'] },
      { name: 'Pós-operatório', count: 15, materials: ['mat007', 'mat008', 'mat009'] },
      { name: 'Exercícios Domiciliares', count: 10, materials: ['mat010', 'mat011', 'mat012'] },
      { name: 'Avaliação', count: 20, materials: ['mat013', 'mat014', 'mat015'] },
      { name: 'Protocolo Clínico', count: 18, materials: ['mat016', 'mat017', 'mat018'] },
      { name: 'Terapia Manual', count: 6, materials: ['mat019', 'mat020'] },
      { name: 'Eletroterapia', count: 5, materials: ['mat021', 'mat022'] },
      { name: 'Idosos', count: 7, materials: ['mat023', 'mat024'] },
      { name: 'Esportes', count: 4, materials: ['mat025', 'mat026'] },
    ];
  }

  private getMockSuggestedTags(): string[] {
    return [
      'Protocolo Clínico',
      'Avaliação',
      'Exercícios Domiciliares',
      'Pós-operatório',
      'Lombalgia'
    ];
  }
}

// Export singleton instance
export const materialTagService = new MaterialTagService();
