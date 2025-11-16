/**
 * Service para gerenciamento de templates de evolução
 * Permite salvar e reutilizar evoluções comuns
 * MODO HÍBRIDO: Tenta Supabase primeiro, fallback para Mock
 */

import { supabase } from '@/lib/supabaseClient';
import { EvolutionTemplate, CreateTemplateData } from '@/types';
import { shouldUseSupabase, logDataSource } from '@/config/supabaseTablesConfig';

// Mock storage (desenvolvimento)
let mockTemplates: EvolutionTemplate[] = [];

/**
 * Busca todos os templates do terapeuta
 */
export async function getMyTemplates(therapistId: string): Promise<EvolutionTemplate[]> {
  try {
    if (shouldUseSupabase()) {
      logDataSource('supabase', `getMyTemplates(${therapistId})`);
      
      const { data, error } = await supabase
        .from('evolution_templates')
        .select('*')
        .eq('therapist_id', therapistId)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(template => ({
        ...template,
        conducts: template.conducts || [],
        exercises: template.exercises || []
      }));
    }
  } catch (error) {
    console.warn('⚠️ Erro ao buscar templates do Supabase, usando mock:', error);
  }
  
  // Fallback para mock
  logDataSource('mock', `getMyTemplates(${therapistId})`);
  return mockTemplates
    .filter(t => t.therapist_id === therapistId)
    .sort((a, b) => b.usage_count - a.usage_count);
}

/**
 * Cria um novo template
 */
export async function createTemplate(
  therapistId: string,
  data: CreateTemplateData
): Promise<EvolutionTemplate> {
  const newTemplate: EvolutionTemplate = {
    id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    therapist_id: therapistId,
    name: data.name,
    description: data.description,
    subjective_template: data.subjective_template,
    objective_template: data.objective_template,
    assessment_template: data.assessment_template,
    conducts: data.conducts || [],
    exercises: data.exercises || [],
    usage_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    if (shouldUseSupabase()) {
      logDataSource('supabase', 'createTemplate');
      
      const { data: inserted, error } = await supabase
        .from('evolution_templates')
        .insert([{
          name: newTemplate.name,
          description: newTemplate.description,
          therapist_id: newTemplate.therapist_id,
          subjective_template: newTemplate.subjective_template,
          objective_template: newTemplate.objective_template,
          assessment_template: newTemplate.assessment_template,
          conducts: newTemplate.conducts,
          exercises: newTemplate.exercises,
          usage_count: 0
        }])
        .select()
        .single();

      if (error) throw error;
      return inserted as EvolutionTemplate;
    }
  } catch (error) {
    console.warn('⚠️ Erro ao criar template no Supabase, usando mock:', error);
  }

  // Fallback para mock
  logDataSource('mock', 'createTemplate');
  mockTemplates.push(newTemplate);
  return newTemplate;
}

/**
 * Atualiza um template existente
 */
export async function updateTemplate(
  id: string,
  data: Partial<EvolutionTemplate>
): Promise<EvolutionTemplate> {
  try {
    if (shouldUseSupabase()) {
      logDataSource('supabase', `updateTemplate(${id})`);
      
      const { data: updated, error } = await supabase
        .from('evolution_templates')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated as EvolutionTemplate;
    }
  } catch (error) {
    console.warn('⚠️ Erro ao atualizar template no Supabase, usando mock:', error);
  }

  // Fallback para mock
  logDataSource('mock', `updateTemplate(${id})`);
  const index = mockTemplates.findIndex(t => t.id === id);
  
  if (index === -1) {
    throw new Error(`Template ${id} não encontrado`);
  }

  mockTemplates[index] = {
    ...mockTemplates[index],
    ...data,
    updated_at: new Date().toISOString()
  };

  return mockTemplates[index];
}

/**
 * Deleta um template
 */
export async function deleteTemplate(id: string): Promise<void> {
  try {
    if (shouldUseSupabase()) {
      logDataSource('supabase', `deleteTemplate(${id})`);
      
      const { error } = await supabase
        .from('evolution_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return;
    }
  } catch (error) {
    console.warn('⚠️ Erro ao deletar template no Supabase, usando mock:', error);
  }

  // Fallback para mock
  logDataSource('mock', `deleteTemplate(${id})`);
  mockTemplates = mockTemplates.filter(t => t.id !== id);
}

/**
 * Incrementa o contador de uso de um template
 */
export async function incrementUsage(id: string): Promise<void> {
  try {
    if (shouldUseSupabase()) {
      logDataSource('supabase', `incrementUsage(${id})`);
      
      const { error } = await supabase.rpc('increment_template_usage', {
        template_id: id
      });

      if (error) {
        // Se a função não existir, fazer manualmente
        const { data: template } = await supabase
          .from('evolution_templates')
          .select('usage_count')
          .eq('id', id)
          .single();

        if (template) {
          await supabase
            .from('evolution_templates')
            .update({
              usage_count: (template.usage_count || 0) + 1,
              last_used_at: new Date().toISOString()
            })
            .eq('id', id);
        }
      }
      return;
    }
  } catch (error) {
    console.warn('⚠️ Erro ao incrementar uso no Supabase, usando mock:', error);
  }

  // Fallback para mock
  logDataSource('mock', `incrementUsage(${id})`);
  const index = mockTemplates.findIndex(t => t.id === id);
  
  if (index !== -1) {
    mockTemplates[index].usage_count++;
    mockTemplates[index].last_used_at = new Date().toISOString();
  }
}

/**
 * Busca template por ID
 */
export async function getTemplateById(id: string): Promise<EvolutionTemplate | null> {
  try {
    if (shouldUseSupabase()) {
      logDataSource('supabase', `getTemplateById(${id})`);
      
      const { data, error } = await supabase
        .from('evolution_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as EvolutionTemplate;
    }
  } catch (error) {
    console.warn('⚠️ Erro ao buscar template do Supabase, usando mock:', error);
  }

  // Fallback para mock
  logDataSource('mock', `getTemplateById(${id})`);
  return mockTemplates.find(t => t.id === id) || null;
}

/**
 * Limpa dados mock (útil para testes)
 */
export function clearMockTemplates(): void {
  mockTemplates = [];
}

/**
 * Popula dados mock para desenvolvimento
 */
export function populateMockTemplates(therapistId: string): void {
  mockTemplates = [
    {
      id: 'template_1',
      name: 'Lombalgia Aguda',
      description: 'Template padrão para lombalgia aguda',
      therapist_id: therapistId,
      subjective_template: 'Paciente relata dor lombar intensa, início há X dias',
      objective_template: 'Espasmo muscular paravertebral, ADM lombar limitada',
      assessment_template: 'Lombalgia aguda com limitação funcional',
      conducts: [
        {
          id: 'conduct_1',
          category: 'manual_therapy',
          name: 'Liberação miofascial',
          details: 'Região lombar',
          duration: '15min'
        },
        {
          id: 'conduct_2',
          category: 'electrotherapy',
          name: 'TENS',
          details: 'Lombar',
          duration: '20min'
        }
      ],
      exercises: [],
      usage_count: 15,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'template_2',
      name: 'Pós-operatório Joelho',
      description: 'Protocolo pós-operatório joelho fase inicial',
      therapist_id: therapistId,
      subjective_template: 'Paciente no pós-operatório de X dias',
      objective_template: 'Edema leve, ADM limitada',
      assessment_template: 'Pós-operatório joelho, evolução adequada',
      conducts: [
        {
          id: 'conduct_3',
          category: 'mobilization',
          name: 'Mobilização patelar',
          details: 'Todas as direções',
          duration: '10min'
        }
      ],
      exercises: [],
      usage_count: 8,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
}

