
// services/clinicalMaterialService.ts
import { mockMaterialCategories } from '../data/mockClinicalMaterials';
import { 
    Material, 
    MaterialCategory, 
    MaterialMention, 
    MaterialTask, 
    MaterialLink, 
    MediaAttachment,
    MaterialVersion 
} from '../types';
import { supabase } from '../lib/supabaseClient';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export interface MaterialDetails extends Material {
    category: MaterialCategory;
}

export interface MaterialCreateData {
    name: string;
    description?: string;
    type: string;
    categoryId: string;
    content?: string;
    tags?: string[];
    status?: 'draft' | 'published' | 'archived';
}

export interface MaterialUpdateData extends Partial<MaterialCreateData> {
    id: string;
}

export interface MaterialSearchParams {
    query?: string;
    categoryId?: string;
    tags?: string[];
    status?: string;
    createdBy?: string;
    limit?: number;
    offset?: number;
}

class ClinicalMaterialService {
    private useSupabase = false; // Toggle between mock and Supabase
    private autoSaveTimeout: NodeJS.Timeout | null = null;

    constructor() {
        // Check if Supabase is available
        this.initializeSupabase();
    }

    private async initializeSupabase() {
        try {
            const { data, error } = await supabase.from('clinical_materials').select('count').limit(1);
            if (!error) {
                this.useSupabase = true;
                console.log('Clinical Material Service: Using Supabase');
            }
        } catch (error) {
            console.log('Clinical Material Service: Using Mock data');
        }
    }

    // Categories
    async getCategories(): Promise<MaterialCategory[]> {
        if (this.useSupabase) {
            try {
                const { data, error } = await supabase
                    .from('clinical_material_categories')
                    .select('*')
                    .order('name');

                if (error) throw error;
                
                // Get materials for each category
                const categoriesWithMaterials = await Promise.all(
                    data.map(async (category) => {
                        const materials = await this.getMaterialsByCategory(category.id);
                        return {
                            ...category,
                            materials
                        };
                    })
                );

                return categoriesWithMaterials;
            } catch (error) {
                console.error('Error fetching categories from Supabase:', error);
                return this.getMockCategories();
            }
        }
        return this.getMockCategories();
    }

    private getMockCategories(): MaterialCategory[] {
    return [...mockMaterialCategories];
    }

    // Materials CRUD
    async getMaterials(params: MaterialSearchParams = {}): Promise<Material[]> {
        if (this.useSupabase) {
            try {
                let query = supabase.from('clinical_materials').select('*');

                if (params.query) {
                    query = query.textSearch('fts', params.query);
                }
                if (params.categoryId) {
                    query = query.eq('category_id', params.categoryId);
                }
                if (params.tags && params.tags.length > 0) {
                    query = query.overlaps('tags', params.tags);
                }
                if (params.status) {
                    query = query.eq('status', params.status);
                }
                if (params.createdBy) {
                    query = query.eq('created_by', params.createdBy);
                }

                query = query
                    .order('updated_at', { ascending: false })
                    .limit(params.limit || 50)
                    .range(params.offset || 0, (params.offset || 0) + (params.limit || 50) - 1);

                const { data, error } = await query;
                if (error) throw error;

                return data.map(material => ({
                    ...material,
                    category: { id: material.category_id, name: '', materials: [] }
                }));
            } catch (error) {
                console.error('Error fetching materials from Supabase:', error);
                return this.getMockMaterials();
            }
        }
        return this.getMockMaterials();
    }

    private getMockMaterials(): Material[] {
        return mockMaterialCategories.flatMap(category => category.materials);
    }

    async getMaterialById(id: string): Promise<MaterialDetails | undefined> {
        if (this.useSupabase) {
            try {
                const { data: material, error } = await supabase
                    .from('clinical_materials')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                const { data: category } = await supabase
                    .from('clinical_material_categories')
                    .select('*')
                    .eq('id', material.category_id)
                    .single();

                return {
                    ...material,
                    category: { ...category, materials: [] }
                };
            } catch (error) {
                console.error('Error fetching material from Supabase:', error);
                return this.getMockMaterialById(id);
            }
        }
        return this.getMockMaterialById(id);
    }

    private getMockMaterialById(id: string): MaterialDetails | undefined {
    for (const category of mockMaterialCategories) {
        const material = category.materials.find(m => m.id === id);
        if (material) {
            return { ...material, category };
        }
    }
    return undefined;
    }

    async createMaterial(data: MaterialCreateData): Promise<Material> {
        if (this.useSupabase) {
            try {
                const { data: material, error } = await supabase
                    .from('clinical_materials')
                    .insert([{
                        name: data.name,
                        description: data.description,
                        type: data.type,
                        category_id: data.categoryId,
                        content: data.content,
                        tags: data.tags || [],
                        status: data.status || 'draft',
                        created_by: (await supabase.auth.getUser()).data.user?.id,
                    }])
                    .select()
                    .single();

                if (error) throw error;

                // Get category info
                const { data: category } = await supabase
                    .from('clinical_material_categories')
                    .select('*')
                    .eq('id', material.category_id)
                    .single();

                return {
                    ...material,
                    category: { ...category, materials: [] }
                };
            } catch (error) {
                console.error('Error creating material in Supabase:', error);
                throw error;
            }
        }
        
        // Mock creation
        const newMaterial: Material = {
            id: `mat${Date.now()}`,
            name: data.name,
            description: data.description,
            type: data.type,
            category: mockMaterialCategories.find(c => c.id === data.categoryId) || mockMaterialCategories[0],
            updatedAt: new Date().toISOString(),
            content: data.content,
            tags: data.tags,
            status: data.status || 'draft',
            version: 1,
            createdBy: 'mock-user',
        };

        return newMaterial;
    }

    async updateMaterial(data: MaterialUpdateData): Promise<Material> {
        if (this.useSupabase) {
            try {
                const { data: material, error } = await supabase
                    .from('clinical_materials')
                    .update({
                        name: data.name,
                        description: data.description,
                        type: data.type,
                        category_id: data.categoryId,
                        content: data.content,
                        tags: data.tags,
                        status: data.status,
                        updated_by: (await supabase.auth.getUser()).data.user?.id,
                    })
                    .eq('id', data.id)
                    .select()
                    .single();

                if (error) throw error;

                // Get category info
                const { data: category } = await supabase
                    .from('clinical_material_categories')
                    .select('*')
                    .eq('id', material.category_id)
                    .single();

                return {
                    ...material,
                    category: { ...category, materials: [] }
                };
            } catch (error) {
                console.error('Error updating material in Supabase:', error);
                throw error;
            }
        }

        // Mock update - would need to implement proper mock update logic
        throw new Error('Mock update not implemented');
    }

    async deleteMaterial(id: string): Promise<void> {
        if (this.useSupabase) {
            try {
                const { error } = await supabase
                    .from('clinical_materials')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
            } catch (error) {
                console.error('Error deleting material from Supabase:', error);
                throw error;
            }
        } else {
            // Mock deletion - would need to implement proper mock deletion logic
            throw new Error('Mock deletion not implemented');
        }
    }

    // Auto-save functionality
    async autoSave(materialId: string, content: string): Promise<void> {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        this.autoSaveTimeout = setTimeout(async () => {
            try {
                if (this.useSupabase) {
                    const { error } = await supabase
                        .from('clinical_materials')
                        .update({ 
                            content,
                            last_edited_at: new Date().toISOString(),
                        })
                        .eq('id', materialId);

                    if (error) throw error;
                }
                console.log('Auto-saved material:', materialId);
            } catch (error) {
                console.error('Error auto-saving material:', error);
            }
        }, 30000); // Auto-save after 30 seconds of inactivity
    }

    // Mentions and Tasks
    async createMention(materialId: string, userId: string, userName: string, position: number, content: string): Promise<MaterialMention> {
        if (this.useSupabase) {
            try {
                const { data: mention, error } = await supabase
                    .from('clinical_material_mentions')
                    .insert([{
                        material_id: materialId,
                        user_id: userId,
                        user_name: userName,
                        position,
                        content,
                        status: 'pending'
                    }])
                    .select()
                    .single();

                if (error) throw error;

                // Create task
                await this.createTask(materialId, mention.id, userId, userName, content);

                return mention;
            } catch (error) {
                console.error('Error creating mention in Supabase:', error);
                throw error;
            }
        }

        // Mock mention
        return {
            id: `mention-${Date.now()}`,
            userId,
            userName,
            position,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
    }

    async createTask(materialId: string, mentionId: string, userId: string, userName: string, content: string): Promise<MaterialTask> {
        if (this.useSupabase) {
            try {
                const { data: task, error } = await supabase
                    .from('clinical_material_tasks')
                    .insert([{
                        material_id: materialId,
                        mention_id: mentionId,
                        user_id: userId,
                        user_name: userName,
                        content,
                        status: 'pending',
                        priority: 'medium'
                    }])
                    .select()
                    .single();

                if (error) throw error;
                return task;
            } catch (error) {
                console.error('Error creating task in Supabase:', error);
                throw error;
            }
        }

        // Mock task
        return {
            id: `task-${Date.now()}`,
            materialId,
            mentionedUserId: userId,
            mentionedUserName: userName,
            content,
            status: 'pending',
            priority: 'medium',
            assignedAt: new Date().toISOString(),
        };
    }

    async getTasksByUser(userId: string): Promise<MaterialTask[]> {
        if (this.useSupabase) {
            try {
                const { data, error } = await supabase
                    .from('clinical_material_tasks')
                    .select('*')
                    .eq('user_id', userId)
                    .order('assigned_at', { ascending: false });

                if (error) throw error;
                return data;
            } catch (error) {
                console.error('Error fetching tasks from Supabase:', error);
                return [];
            }
        }
        return [];
    }

    // Links
    async createLink(fromMaterialId: string, toMaterialId: string, linkText: string, position?: number): Promise<MaterialLink> {
        if (this.useSupabase) {
            try {
                const { data: link, error } = await supabase
                    .from('clinical_material_links')
                    .insert([{
                        from_material_id: fromMaterialId,
                        to_material_id: toMaterialId,
                        link_text: linkText,
                        position
                    }])
                    .select()
                    .single();

                if (error) throw error;
                return link;
            } catch (error) {
                console.error('Error creating link in Supabase:', error);
                throw error;
            }
        }

        // Mock link
        return {
            id: `link-${Date.now()}`,
            fromMaterialId,
            toMaterialId,
            linkText,
            position,
            createdAt: new Date().toISOString(),
        };
    }

    async getRelatedMaterials(materialId: string): Promise<Material[]> {
        if (this.useSupabase) {
            try {
                const { data, error } = await supabase
                    .rpc('get_related_materials', { material_id: materialId });

                if (error) throw error;
                return data;
            } catch (error) {
                console.error('Error fetching related materials from Supabase:', error);
                return [];
            }
        }
        return [];
    }

    // Helper methods
    private async getMaterialsByCategory(categoryId: string): Promise<Material[]> {
        try {
            const { data, error } = await supabase
                .from('clinical_materials')
                .select('*')
                .eq('category_id', categoryId)
                .eq('status', 'published')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching materials by category:', error);
            return [];
        }
    }
}

// Export singleton instance
export const clinicalMaterialService = new ClinicalMaterialService();

// Legacy exports for backward compatibility
export const getMaterialCategories = () => clinicalMaterialService.getCategories();
export const getMaterialById = (id: string) => clinicalMaterialService.getMaterialById(id);
