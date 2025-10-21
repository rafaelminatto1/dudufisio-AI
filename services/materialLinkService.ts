// services/materialLinkService.ts
import { MaterialLink, Material } from '../types';
import { supabase } from '../lib/supabaseClient';

export interface LinkCreateData {
  fromMaterialId: string;
  toMaterialId: string;
  linkText: string;
  position?: number;
}

export interface LinkSearchResult {
  material: Material;
  linkCount: number;
  isBidirectional: boolean;
}

class MaterialLinkService {
  private useSupabase = false;

  constructor() {
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    try {
      const { data, error } = await supabase.from('clinical_material_links').select('count').limit(1);
      if (!error) {
        this.useSupabase = true;
        console.log('Material Link Service: Using Supabase');
      }
    } catch (error) {
      console.log('Material Link Service: Using Mock data');
    }
  }

  // Create a link between materials
  async createLink(data: LinkCreateData): Promise<MaterialLink> {
    if (this.useSupabase) {
      try {
        const { data: link, error } = await supabase
          .from('clinical_material_links')
          .insert([{
            from_material_id: data.fromMaterialId,
            to_material_id: data.toMaterialId,
            link_text: data.linkText,
            position: data.position,
          }])
          .select()
          .single();

        if (error) throw error;

        // Create bidirectional link if it doesn't exist
        await this.createBidirectionalLink(data.fromMaterialId, data.toMaterialId, data.linkText);

        return link;
      } catch (error) {
        console.error('Error creating link in Supabase:', error);
        throw error;
      }
    }

    // Mock link
    return {
      id: `link-${Date.now()}`,
      fromMaterialId: data.fromMaterialId,
      toMaterialId: data.toMaterialId,
      linkText: data.linkText,
      position: data.position,
      createdAt: new Date().toISOString(),
    };
  }

  // Create bidirectional link
  private async createBidirectionalLink(fromId: string, toId: string, linkText: string): Promise<void> {
    if (this.useSupabase) {
      try {
        // Check if reverse link already exists
        const { data: existingLink } = await supabase
          .from('clinical_material_links')
          .select('id')
          .eq('from_material_id', toId)
          .eq('to_material_id', fromId)
          .single();

        if (!existingLink) {
          // Create reverse link
          await supabase
            .from('clinical_material_links')
            .insert([{
              from_material_id: toId,
              to_material_id: fromId,
              link_text: linkText,
            }]);
        }
      } catch (error) {
        console.error('Error creating bidirectional link:', error);
      }
    }
  }

  // Get all links for a material
  async getMaterialLinks(materialId: string): Promise<MaterialLink[]> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from('clinical_material_links')
          .select('*')
          .eq('from_material_id', materialId)
          .order('position');

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching material links from Supabase:', error);
        return this.getMockMaterialLinks(materialId);
      }
    }
    return this.getMockMaterialLinks(materialId);
  }

  // Get related materials (materials linked to this one)
  async getRelatedMaterials(materialId: string): Promise<Material[]> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .rpc('get_related_materials', { material_id: materialId });

        if (error) throw error;

        // Get full material details
        if (data && data.length > 0) {
          const materialIds = data.map((item: any) => item.id);
          const { data: materials, error: materialsError } = await supabase
            .from('clinical_materials')
            .select(`
              *,
              clinical_material_categories!inner(name)
            `)
            .in('id', materialIds)
            .eq('status', 'published');

          if (materialsError) throw materialsError;

          return materials.map(material => ({
            ...material,
            category: { id: material.category_id, name: material.clinical_material_categories.name, materials: [] }
          }));
        }

        return [];
      } catch (error) {
        console.error('Error fetching related materials from Supabase:', error);
        return this.getMockRelatedMaterials(materialId);
      }
    }
    return this.getMockRelatedMaterials(materialId);
  }

  // Search materials for linking
  async searchMaterialsForLink(query: string, excludeId?: string): Promise<LinkSearchResult[]> {
    if (this.useSupabase) {
      try {
        let searchQuery = supabase
          .from('clinical_materials')
          .select(`
            *,
            clinical_material_categories!inner(name)
          `)
          .eq('status', 'published')
          .textSearch('fts', query);

        if (excludeId) {
          searchQuery = searchQuery.not('id', 'eq', excludeId);
        }

        const { data: materials, error } = await searchQuery.limit(10);

        if (error) throw error;

        // Get link counts for each material
        const materialsWithLinks = await Promise.all(
          materials.map(async (material) => {
            const { data: links } = await supabase
              .from('clinical_material_links')
              .select('id')
              .or(`from_material_id.eq.${material.id},to_material_id.eq.${material.id}`);

            const linkCount = links?.length || 0;

            return {
              material: {
                ...material,
                category: { id: material.category_id, name: material.clinical_material_categories.name, materials: [] }
              },
              linkCount,
              isBidirectional: linkCount > 0
            };
          })
        );

        return materialsWithLinks.sort((a, b) => b.linkCount - a.linkCount);
      } catch (error) {
        console.error('Error searching materials for link from Supabase:', error);
        return this.getMockSearchResults(query);
      }
    }
    return this.getMockSearchResults(query);
  }

  // Delete a link
  async deleteLink(linkId: string): Promise<void> {
    if (this.useSupabase) {
      try {
        const { error } = await supabase
          .from('clinical_material_links')
          .delete()
          .eq('id', linkId);

        if (error) throw error;
      } catch (error) {
        console.error('Error deleting link from Supabase:', error);
        throw error;
      }
    }
  }

  // Parse wiki links from content
  parseWikiLinks(content: string): string[] {
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    const matches = [];
    let match;

    while ((match = wikiLinkRegex.exec(content)) !== null) {
      matches.push(match[1].trim());
    }

    return matches;
  }

  // Extract and create links from content
  async extractLinksFromContent(materialId: string, content: string): Promise<MaterialLink[]> {
    const linkTexts = this.parseWikiLinks(content);
    const createdLinks: MaterialLink[] = [];

    for (const linkText of linkTexts) {
      try {
        // Search for material by name
        const searchResults = await this.searchMaterialsForLink(linkText, materialId);
        
        if (searchResults.length > 0) {
          const targetMaterial = searchResults[0].material;
          const link = await this.createLink({
            fromMaterialId: materialId,
            toMaterialId: targetMaterial.id,
            linkText: linkText,
          });
          createdLinks.push(link);
        }
      } catch (error) {
        console.error(`Error creating link for "${linkText}":`, error);
      }
    }

    return createdLinks;
  }

  // Mock data methods
  private getMockMaterialLinks(materialId: string): MaterialLink[] {
    const mockLinks: MaterialLink[] = [
      {
        id: 'link-1',
        fromMaterialId: materialId,
        toMaterialId: 'mat002',
        linkText: 'Protocolo de Fisioterapia',
        position: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'link-2',
        fromMaterialId: materialId,
        toMaterialId: 'mat003',
        linkText: 'Escala de Avaliação',
        position: 2,
        createdAt: new Date().toISOString(),
      },
    ];

    return mockLinks;
  }

  private getMockRelatedMaterials(materialId: string): Material[] {
    return [
      {
        id: 'mat002',
        name: 'Protocolo de Fisioterapia Respiratória',
        type: 'Protocolo Clínico',
        category: { id: 'cat2', name: 'Protocolos Clínicos', materials: [] },
        updatedAt: new Date().toISOString(),
        description: 'Protocolo completo para fisioterapia respiratória',
      },
      {
        id: 'mat003',
        name: 'Escala de Avaliação de Dor',
        type: 'Escala de Avaliação',
        category: { id: 'cat1', name: 'Avaliação e Diagnóstico', materials: [] },
        updatedAt: new Date().toISOString(),
        description: 'Escala para avaliação da intensidade da dor',
      },
    ];
  }

  private getMockSearchResults(query: string): LinkSearchResult[] {
    const mockMaterials = [
      {
        id: 'mat001',
        name: 'Protocolo de Fisioterapia Respiratória',
        type: 'Protocolo Clínico',
        category: { id: 'cat2', name: 'Protocolos Clínicos', materials: [] },
        updatedAt: new Date().toISOString(),
        description: 'Protocolo completo para fisioterapia respiratória',
      },
      {
        id: 'mat002',
        name: 'Escala de Avaliação de Dor',
        type: 'Escala de Avaliação',
        category: { id: 'cat1', name: 'Avaliação e Diagnóstico', materials: [] },
        updatedAt: new Date().toISOString(),
        description: 'Escala para avaliação da intensidade da dor',
      },
    ];

    return mockMaterials
      .filter(material => 
        material.name.toLowerCase().includes(query.toLowerCase()) ||
        material.description.toLowerCase().includes(query.toLowerCase())
      )
      .map(material => ({
        material,
        linkCount: Math.floor(Math.random() * 5),
        isBidirectional: Math.random() > 0.5,
      }));
  }
}

// Export singleton instance
export const materialLinkService = new MaterialLinkService();
