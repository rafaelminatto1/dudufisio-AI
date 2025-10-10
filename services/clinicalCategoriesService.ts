import { supabase } from '../lib/supabase';
import type {
  ClinicalCaseCategory,
  AssessmentTemplate
} from '../types';

/**
 * Serviço para gerenciamento de categorias clínicas e templates de avaliação
 */

// ============================================================================
// CATEGORIAS CLÍNICAS
// ============================================================================

/**
 * Buscar todas as categorias clínicas
 */
export async function getCategories(): Promise<ClinicalCaseCategory[]> {
  const { data, error } = await supabase
    .from('clinical_case_categories')
    .select('*')
    .is('deleted_at', null)
    .order('name');

  if (error) {
    console.error('Erro ao buscar categorias:', error);
    throw new Error('Não foi possível carregar as categorias clínicas');
  }

  return data.map(mapCategoryFromDb);
}

/**
 * Buscar categoria por ID
 */
export async function getCategoryById(id: string): Promise<ClinicalCaseCategory | null> {
  const { data, error } = await supabase
    .from('clinical_case_categories')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Erro ao buscar categoria:', error);
    throw new Error('Não foi possível carregar a categoria');
  }

  return mapCategoryFromDb(data);
}

/**
 * Criar nova categoria clínica
 */
export async function createCategory(
  data: Omit<ClinicalCaseCategory, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ClinicalCaseCategory> {
  const { data: user } = await supabase.auth.getUser();

  const categoryData = {
    name: data.name,
    specialty: data.specialty,
    description: data.description,
    is_system_default: data.isSystemDefault,
    created_by: user?.user?.id
  };

  const { data: created, error } = await supabase
    .from('clinical_case_categories')
    .insert(categoryData)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar categoria:', error);
    throw new Error('Não foi possível criar a categoria');
  }

  return mapCategoryFromDb(created);
}

/**
 * Atualizar categoria existente
 */
export async function updateCategory(
  id: string,
  data: Partial<Omit<ClinicalCaseCategory, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ClinicalCaseCategory> {
  const updateData: any = {};
  
  if (data.name) updateData.name = data.name;
  if (data.specialty) updateData.specialty = data.specialty;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.isSystemDefault !== undefined) updateData.is_system_default = data.isSystemDefault;
  
  const { data: updated, error } = await supabase
    .from('clinical_case_categories')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar categoria:', error);
    throw new Error('Não foi possível atualizar a categoria');
  }

  return mapCategoryFromDb(updated);
}

/**
 * Excluir categoria (soft delete)
 */
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('clinical_case_categories')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir categoria:', error);
    throw new Error('Não foi possível excluir a categoria');
  }
}

// ============================================================================
// TEMPLATES DE AVALIAÇÃO
// ============================================================================

/**
 * Buscar todos os templates de avaliação
 */
export async function getAllTemplates(): Promise<AssessmentTemplate[]> {
  const { data, error } = await supabase
    .from('assessment_templates')
    .select('*')
    .is('deleted_at', null)
    .order('display_order');

  if (error) {
    console.error('Erro ao buscar templates:', error);
    throw new Error('Não foi possível carregar os templates');
  }

  return data.map(mapTemplateFromDb);
}

/**
 * Buscar templates por categoria
 */
export async function getTemplatesByCategory(categoryId: string): Promise<AssessmentTemplate[]> {
  const { data, error } = await supabase
    .from('assessment_templates')
    .select('*')
    .eq('category_id', categoryId)
    .is('deleted_at', null)
    .order('display_order');

  if (error) {
    console.error('Erro ao buscar templates por categoria:', error);
    throw new Error('Não foi possível carregar os templates');
  }

  return data.map(mapTemplateFromDb);
}

/**
 * Buscar template por ID
 */
export async function getTemplateById(id: string): Promise<AssessmentTemplate | null> {
  const { data, error } = await supabase
    .from('assessment_templates')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Erro ao buscar template:', error);
    throw new Error('Não foi possível carregar o template');
  }

  return mapTemplateFromDb(data);
}

/**
 * Criar novo template de avaliação
 */
export async function createAssessmentTemplate(
  categoryId: string,
  data: Omit<AssessmentTemplate, 'id' | 'categoryId' | 'createdAt'>
): Promise<AssessmentTemplate> {
  const templateData = {
    category_id: categoryId,
    name: data.name,
    field_type: data.fieldType,
    unit: data.unit,
    min_value: data.minValue,
    max_value: data.maxValue,
    options: data.options ? JSON.stringify(data.options) : null,
    is_required: data.isRequired,
    display_order: data.displayOrder,
    help_text: data.helpText
  };

  const { data: created, error } = await supabase
    .from('assessment_templates')
    .insert(templateData)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar template:', error);
    throw new Error('Não foi possível criar o template');
  }

  return mapTemplateFromDb(created);
}

/**
 * Atualizar template existente
 */
export async function updateAssessmentTemplate(
  id: string,
  data: Partial<Omit<AssessmentTemplate, 'id' | 'categoryId' | 'createdAt'>>
): Promise<AssessmentTemplate> {
  const updateData: any = {};
  
  if (data.name) updateData.name = data.name;
  if (data.fieldType) updateData.field_type = data.fieldType;
  if (data.unit !== undefined) updateData.unit = data.unit;
  if (data.minValue !== undefined) updateData.min_value = data.minValue;
  if (data.maxValue !== undefined) updateData.max_value = data.maxValue;
  if (data.options !== undefined) updateData.options = data.options ? JSON.stringify(data.options) : null;
  if (data.isRequired !== undefined) updateData.is_required = data.isRequired;
  if (data.displayOrder !== undefined) updateData.display_order = data.displayOrder;
  if (data.helpText !== undefined) updateData.help_text = data.helpText;

  const { data: updated, error } = await supabase
    .from('assessment_templates')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar template:', error);
    throw new Error('Não foi possível atualizar o template');
  }

  return mapTemplateFromDb(updated);
}

/**
 * Excluir template (soft delete)
 */
export async function deleteAssessmentTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('assessment_templates')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir template:', error);
    throw new Error('Não foi possível excluir o template');
  }
}

/**
 * Reordenar templates de uma categoria
 */
export async function reorderTemplates(
  categoryId: string,
  templateIds: string[]
): Promise<void> {
  const updates = templateIds.map((id, index) => ({
    id,
    display_order: index
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from('assessment_templates')
      .update({ display_order: update.display_order })
      .eq('id', update.id)
      .eq('category_id', categoryId);

    if (error) {
      console.error('Erro ao reordenar templates:', error);
      throw new Error('Não foi possível reordenar os templates');
    }
  }
}

// ============================================================================
// FUNÇÕES AUXILIARES - MAPEAMENTO
// ============================================================================

function mapCategoryFromDb(data: any): ClinicalCaseCategory {
  return {
    id: data.id,
    name: data.name,
    specialty: data.specialty,
    description: data.description,
    isSystemDefault: data.is_system_default,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

function mapTemplateFromDb(data: any): AssessmentTemplate {
  return {
    id: data.id,
    categoryId: data.category_id,
    name: data.name,
    fieldType: data.field_type,
    unit: data.unit,
    minValue: data.min_value,
    maxValue: data.max_value,
    options: typeof data.options === 'string' ? JSON.parse(data.options) : data.options,
    isRequired: data.is_required,
    displayOrder: data.display_order,
    helpText: data.help_text,
    createdAt: data.created_at
  };
}

// ============================================================================
// EXPORTS DEFAULT
// ============================================================================

export default {
  // Categories
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Templates
  getAllTemplates,
  getTemplatesByCategory,
  getTemplateById,
  createAssessmentTemplate,
  updateAssessmentTemplate,
  deleteAssessmentTemplate,
  reorderTemplates
};

