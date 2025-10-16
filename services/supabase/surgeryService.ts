/**
 * services/supabase/surgeryService.ts
 * 
 * Serviço para gerenciamento de cirurgias de pacientes
 */

import { supabase } from '@/lib/supabaseClient';
import { Surgery } from '@/types';

export class SurgeryService {
  
  /**
   * Criar nova cirurgia
   */
  async createSurgery(data: Omit<Surgery, 'id' | 'createdAt' | 'updatedAt'>): Promise<Surgery> {
    const { data: surgery, error } = await supabase
      .from('patient_surgeries')
      .insert({
        patient_id: data.patientId,
        name: data.name,
        date: data.date,
        description: data.description,
        surgeon: data.surgeon,
        hospital: data.hospital,
        complications: data.complications,
        recovery_time_days: data.recoveryTimeDays,
        notes: data.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar cirurgia:', error);
      throw new Error(`Erro ao criar cirurgia: ${error.message}`);
    }

    return this.mapSurgeryFromDb(surgery);
  }

  /**
   * Buscar todas as cirurgias de um paciente
   */
  async getSurgeriesByPatient(patientId: string): Promise<Surgery[]> {
    const { data, error } = await supabase
      .from('patient_surgeries')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar cirurgias:', error);
      throw new Error(`Erro ao buscar cirurgias: ${error.message}`);
    }

    return (data || []).map(s => this.mapSurgeryFromDb(s));
  }

  /**
   * Buscar cirurgia por ID
   */
  async getSurgeryById(id: string): Promise<Surgery | null> {
    const { data, error } = await supabase
      .from('patient_surgeries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar cirurgia:', error);
      throw new Error(`Erro ao buscar cirurgia: ${error.message}`);
    }

    return data ? this.mapSurgeryFromDb(data) : null;
  }

  /**
   * Atualizar cirurgia
   */
  async updateSurgery(id: string, data: Partial<Surgery>): Promise<Surgery> {
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.surgeon !== undefined) updateData.surgeon = data.surgeon;
    if (data.hospital !== undefined) updateData.hospital = data.hospital;
    if (data.complications !== undefined) updateData.complications = data.complications;
    if (data.recoveryTimeDays !== undefined) updateData.recovery_time_days = data.recoveryTimeDays;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const { data: surgery, error } = await supabase
      .from('patient_surgeries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar cirurgia:', error);
      throw new Error(`Erro ao atualizar cirurgia: ${error.message}`);
    }

    return this.mapSurgeryFromDb(surgery);
  }

  /**
   * Deletar cirurgia
   */
  async deleteSurgery(id: string): Promise<void> {
    const { error } = await supabase
      .from('patient_surgeries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar cirurgia:', error);
      throw new Error(`Erro ao deletar cirurgia: ${error.message}`);
    }
  }

  /**
   * Buscar última cirurgia de um paciente
   */
  async getLatestSurgery(patientId: string): Promise<Surgery | null> {
    const { data, error } = await supabase
      .from('patient_surgeries')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhuma cirurgia encontrada
        return null;
      }
      console.error('Erro ao buscar última cirurgia:', error);
      throw new Error(`Erro ao buscar última cirurgia: ${error.message}`);
    }

    return data ? this.mapSurgeryFromDb(data) : null;
  }

  /**
   * Calcular dias/semanas/meses desde a cirurgia
   */
  calculateDaysSinceSurgery(surgeryDate: string): { days: number; weeks: number; months: number } {
    const surgery = new Date(surgeryDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - surgery.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    return {
      days: diffDays,
      weeks: diffWeeks,
      months: diffMonths
    };
  }

  /**
   * Calcular progresso de recuperação (0-100%)
   */
  calculateRecoveryProgress(surgery: Surgery): number {
    if (!surgery.recoveryTimeDays) {
      return 0;
    }

    const { days } = this.calculateDaysSinceSurgery(surgery.date);
    const progress = Math.min((days / surgery.recoveryTimeDays) * 100, 100);
    
    return Math.round(progress);
  }

  /**
   * Mapear dados do banco para interface TypeScript
   */
  private mapSurgeryFromDb(data: any): Surgery {
    return {
      id: data.id,
      patientId: data.patient_id,
      name: data.name,
      date: data.date,
      description: data.description,
      surgeon: data.surgeon,
      hospital: data.hospital,
      complications: data.complications,
      recoveryTimeDays: data.recovery_time_days,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

// Exportar instância singleton
export const surgeryService = new SurgeryService();

