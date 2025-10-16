/**
 * services/supabase/goalsService.ts
 * 
 * Serviço para gerenciamento de metas de pacientes
 */

import { supabase } from '@/lib/supabaseClient';
import { PatientGoal } from '@/types';

export class GoalsService {
  
  /**
   * Criar nova meta
   */
  async createGoal(data: Omit<PatientGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<PatientGoal> {
    const { data: goal, error } = await supabase
      .from('patient_goals')
      .insert({
        patient_id: data.patientId,
        title: data.title,
        description: data.description,
        category: data.category,
        target_date: data.targetDate,
        target_value: data.targetValue,
        current_value: data.currentValue,
        current_progress: data.currentProgress || 0,
        unit: data.unit,
        priority: data.priority,
        status: data.status,
        notes: data.notes,
        created_by: data.createdBy
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar meta:', error);
      throw new Error(`Erro ao criar meta: ${error.message}`);
    }

    return this.mapGoalFromDb(goal);
  }

  /**
   * Buscar todas as metas de um paciente
   */
  async getGoalsByPatient(patientId: string): Promise<PatientGoal[]> {
    const { data, error } = await supabase
      .from('patient_goals')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar metas:', error);
      throw new Error(`Erro ao buscar metas: ${error.message}`);
    }

    return (data || []).map(g => this.mapGoalFromDb(g));
  }

  /**
   * Buscar metas ativas de um paciente
   */
  async getActiveGoals(patientId: string): Promise<PatientGoal[]> {
    const { data, error } = await supabase
      .from('patient_goals')
      .select('*')
      .eq('patient_id', patientId)
      .eq('status', 'active')
      .order('priority', { ascending: false });

    if (error) {
      console.error('Erro ao buscar metas ativas:', error);
      throw new Error(`Erro ao buscar metas ativas: ${error.message}`);
    }

    return (data || []).map(g => this.mapGoalFromDb(g));
  }

  /**
   * Buscar meta por ID
   */
  async getGoalById(id: string): Promise<PatientGoal | null> {
    const { data, error } = await supabase
      .from('patient_goals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar meta:', error);
      throw new Error(`Erro ao buscar meta: ${error.message}`);
    }

    return data ? this.mapGoalFromDb(data) : null;
  }

  /**
   * Atualizar meta
   */
  async updateGoal(id: string, data: Partial<PatientGoal>): Promise<PatientGoal> {
    const updateData: any = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.targetDate !== undefined) updateData.target_date = data.targetDate;
    if (data.targetValue !== undefined) updateData.target_value = data.targetValue;
    if (data.currentValue !== undefined) updateData.current_value = data.currentValue;
    if (data.currentProgress !== undefined) updateData.current_progress = data.currentProgress;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const { data: goal, error } = await supabase
      .from('patient_goals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar meta:', error);
      throw new Error(`Erro ao atualizar meta: ${error.message}`);
    }

    return this.mapGoalFromDb(goal);
  }

  /**
   * Atualizar progresso de uma meta
   */
  async updateProgress(id: string, progress: number, currentValue?: string): Promise<PatientGoal> {
    const updateData: any = {
      current_progress: Math.max(0, Math.min(100, progress))
    };

    if (currentValue !== undefined) {
      updateData.current_value = currentValue;
    }

    const { data: goal, error } = await supabase
      .from('patient_goals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar progresso:', error);
      throw new Error(`Erro ao atualizar progresso: ${error.message}`);
    }

    return this.mapGoalFromDb(goal);
  }

  /**
   * Marcar meta como concluída
   */
  async completeGoal(id: string): Promise<PatientGoal> {
    const { data: goal, error } = await supabase
      .from('patient_goals')
      .update({
        status: 'completed',
        current_progress: 100,
        achieved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao concluir meta:', error);
      throw new Error(`Erro ao concluir meta: ${error.message}`);
    }

    return this.mapGoalFromDb(goal);
  }

  /**
   * Deletar meta
   */
  async deleteGoal(id: string): Promise<void> {
    const { error } = await supabase
      .from('patient_goals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar meta:', error);
      throw new Error(`Erro ao deletar meta: ${error.message}`);
    }
  }

  /**
   * Calcular taxa de sucesso histórica
   */
  async getHistoricalSuccessRate(patientId: string): Promise<number> {
    const { data, error } = await supabase
      .from('patient_goals')
      .select('status')
      .eq('patient_id', patientId);

    if (error) {
      console.error('Erro ao calcular taxa de sucesso:', error);
      return 0;
    }

    const total = data?.length || 0;
    const completed = data?.filter(g => g.status === 'completed').length || 0;

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  /**
   * Mapear dados do banco para interface TypeScript
   */
  private mapGoalFromDb(data: any): PatientGoal {
    return {
      id: data.id,
      patientId: data.patient_id,
      title: data.title,
      description: data.description,
      category: data.category,
      targetDate: data.target_date,
      targetValue: data.target_value,
      currentValue: data.current_value,
      currentProgress: data.current_progress,
      unit: data.unit,
      priority: data.priority,
      status: data.status,
      achievedAt: data.achieved_at,
      notes: data.notes,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

// Exportar instância singleton
export const goalsService = new GoalsService();

