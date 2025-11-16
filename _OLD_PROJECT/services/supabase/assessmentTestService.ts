/**
 * services/supabase/assessmentTestService.ts
 * 
 * Serviço para gerenciamento de configurações de testes de avaliação
 */

import { supabase } from '@/lib/supabaseClient';
import { AssessmentTestConfig } from '@/types';

export class AssessmentTestService {
  
  /**
   * Criar nova configuração de teste
   */
  async createTestConfig(data: Omit<AssessmentTestConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssessmentTestConfig> {
    const { data: config, error } = await supabase
      .from('assessment_test_configs')
      .insert({
        patient_id: data.patientId,
        test_name: data.testName,
        test_type: data.testType,
        frequency_sessions: data.frequencySessions,
        frequency_days: data.frequencyDays,
        is_mandatory: data.isMandatory,
        notes: data.notes
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar configuração de teste:', error);
      throw new Error(`Erro ao criar configuração de teste: ${error.message}`);
    }

    return this.mapConfigFromDb(config);
  }

  /**
   * Buscar todas as configurações de teste de um paciente
   */
  async getTestConfigsByPatient(patientId: string): Promise<AssessmentTestConfig[]> {
    const { data, error } = await supabase
      .from('assessment_test_configs')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar configurações de teste:', error);
      throw new Error(`Erro ao buscar configurações de teste: ${error.message}`);
    }

    return (data || []).map(c => this.mapConfigFromDb(c));
  }

  /**
   * Buscar configurações de teste obrigatórias
   */
  async getMandatoryTests(patientId: string): Promise<AssessmentTestConfig[]> {
    const { data, error } = await supabase
      .from('assessment_test_configs')
      .select('*')
      .eq('patient_id', patientId)
      .eq('is_mandatory', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar testes obrigatórios:', error);
      throw new Error(`Erro ao buscar testes obrigatórios: ${error.message}`);
    }

    return (data || []).map(c => this.mapConfigFromDb(c));
  }

  /**
   * Buscar testes em atraso
   */
  async getOverdueTests(patientId: string): Promise<AssessmentTestConfig[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('assessment_test_configs')
      .select('*')
      .eq('patient_id', patientId)
      .eq('is_mandatory', true)
      .lte('next_due_date', today)
      .order('next_due_date', { ascending: true });

    if (error) {
      console.error('Erro ao buscar testes em atraso:', error);
      throw new Error(`Erro ao buscar testes em atraso: ${error.message}`);
    }

    return (data || []).map(c => this.mapConfigFromDb(c));
  }

  /**
   * Buscar configuração por ID
   */
  async getTestConfigById(id: string): Promise<AssessmentTestConfig | null> {
    const { data, error } = await supabase
      .from('assessment_test_configs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar configuração:', error);
      throw new Error(`Erro ao buscar configuração: ${error.message}`);
    }

    return data ? this.mapConfigFromDb(data) : null;
  }

  /**
   * Atualizar configuração de teste
   */
  async updateTestConfig(id: string, data: Partial<AssessmentTestConfig>): Promise<AssessmentTestConfig> {
    const updateData: any = {};
    
    if (data.testName !== undefined) updateData.test_name = data.testName;
    if (data.testType !== undefined) updateData.test_type = data.testType;
    if (data.frequencySessions !== undefined) updateData.frequency_sessions = data.frequencySessions;
    if (data.frequencyDays !== undefined) updateData.frequency_days = data.frequencyDays;
    if (data.isMandatory !== undefined) updateData.is_mandatory = data.isMandatory;
    if (data.lastPerformedDate !== undefined) updateData.last_performed_date = data.lastPerformedDate;
    if (data.nextDueDate !== undefined) updateData.next_due_date = data.nextDueDate;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const { data: config, error } = await supabase
      .from('assessment_test_configs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar configuração:', error);
      throw new Error(`Erro ao atualizar configuração: ${error.message}`);
    }

    return this.mapConfigFromDb(config);
  }

  /**
   * Registrar que um teste foi realizado
   */
  async recordTestPerformed(configId: string, assessmentId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    // Atualizar last_performed_date
    const { error: updateError } = await supabase
      .from('assessment_test_configs')
      .update({
        last_performed_date: today
      } as any)
      .eq('id', configId);

    if (updateError) {
      console.error('Erro ao registrar teste realizado:', updateError);
      throw new Error(`Erro ao registrar teste realizado: ${updateError.message}`);
    }

    // Calcular próxima data
    const config = await this.getTestConfigById(configId);
    if (config) {
      const nextDate = await this.calculateNextDueDate(config, today);
      
      await supabase
        .from('assessment_test_configs')
        .update({
          next_due_date: nextDate
        } as any)
        .eq('id', configId);
    }
  }

  /**
   * Calcular próxima data de realização do teste
   */
  async calculateNextDueDate(config: AssessmentTestConfig, lastDate: string): Promise<string> {
    const last = new Date(lastDate);
    let nextDate: Date;

    if (config.frequencyDays) {
      // Baseado em dias
      nextDate = new Date(last);
      nextDate.setDate(nextDate.getDate() + config.frequencyDays);
    } else if (config.frequencySessions) {
      // Baseado em sessões (assumir 2 sessões por semana)
      const daysToAdd = Math.ceil(config.frequencySessions * 3.5);
      nextDate = new Date(last);
      nextDate.setDate(nextDate.getDate() + daysToAdd);
    } else {
      // Padrão: 30 dias
      nextDate = new Date(last);
      nextDate.setDate(nextDate.getDate() + 30);
    }

    return nextDate.toISOString().split('T')[0];
  }

  /**
   * Deletar configuração de teste
   */
  async deleteTestConfig(id: string): Promise<void> {
    const { error } = await supabase
      .from('assessment_test_configs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar configuração:', error);
      throw new Error(`Erro ao deletar configuração: ${error.message}`);
    }
  }

  /**
   * Calcular dias até o próximo teste
   */
  calculateDaysUntilTest(nextDueDate: string): number {
    const today = new Date();
    const dueDate = new Date(nextDueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  /**
   * Mapear dados do banco para interface TypeScript
   */
  private mapConfigFromDb(data: any): AssessmentTestConfig {
    return {
      id: data.id,
      patientId: data.patient_id,
      testName: data.test_name,
      testType: data.test_type,
      frequencySessions: data.frequency_sessions,
      frequencyDays: data.frequency_days,
      isMandatory: data.is_mandatory,
      lastPerformedDate: data.last_performed_date,
      nextDueDate: data.next_due_date,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

// Exportar instância singleton
export const assessmentTestService = new AssessmentTestService();

