/**
 * services/supabase/pathologyService.ts
 * 
 * Serviço para gerenciamento de patologias de pacientes
 */

import { supabase } from '@/lib/supabaseClient';
import { Pathology } from '@/types';

export class PathologyService {
  
  /**
   * Criar nova patologia
   */
  async createPathology(data: Omit<Pathology, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pathology> {
    const { data: pathology, error } = await supabase
      .from('patient_pathologies')
      .insert({
        patient_id: data.patientId,
        name: data.name,
        icd_code: data.icdCode,
        diagnosis_date: data.diagnosisDate,
        status: data.status,
        severity: data.severity,
        affected_region: data.affectedRegion,
        description: data.description,
        treatment_plan: data.treatmentPlan,
        notes: data.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar patologia:', error);
      throw new Error(`Erro ao criar patologia: ${error.message}`);
    }

    return this.mapPathologyFromDb(pathology);
  }

  /**
   * Buscar todas as patologias de um paciente
   */
  async getPathologiesByPatient(patientId: string): Promise<Pathology[]> {
    const { data, error } = await supabase
      .from('patient_pathologies')
      .select('*')
      .eq('patient_id', patientId)
      .order('diagnosis_date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar patologias:', error);
      throw new Error(`Erro ao buscar patologias: ${error.message}`);
    }

    return (data || []).map(p => this.mapPathologyFromDb(p));
  }

  /**
   * Buscar patologias ativas de um paciente
   */
  async getActivePathologies(patientId: string): Promise<Pathology[]> {
    const { data, error } = await supabase
      .from('patient_pathologies')
      .select('*')
      .eq('patient_id', patientId)
      .eq('status', 'active')
      .order('diagnosis_date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar patologias ativas:', error);
      throw new Error(`Erro ao buscar patologias ativas: ${error.message}`);
    }

    return (data || []).map(p => this.mapPathologyFromDb(p));
  }

  /**
   * Buscar patologia por ID
   */
  async getPathologyById(id: string): Promise<Pathology | null> {
    const { data, error } = await supabase
      .from('patient_pathologies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar patologia:', error);
      throw new Error(`Erro ao buscar patologia: ${error.message}`);
    }

    return data ? this.mapPathologyFromDb(data) : null;
  }

  /**
   * Atualizar patologia
   */
  async updatePathology(id: string, data: Partial<Pathology>): Promise<Pathology> {
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.icdCode !== undefined) updateData.icd_code = data.icdCode;
    if (data.diagnosisDate !== undefined) updateData.diagnosis_date = data.diagnosisDate;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.severity !== undefined) updateData.severity = data.severity;
    if (data.affectedRegion !== undefined) updateData.affected_region = data.affectedRegion;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.treatmentPlan !== undefined) updateData.treatment_plan = data.treatmentPlan;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const { data: pathology, error } = await supabase
      .from('patient_pathologies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar patologia:', error);
      throw new Error(`Erro ao atualizar patologia: ${error.message}`);
    }

    return this.mapPathologyFromDb(pathology);
  }

  /**
   * Deletar patologia
   */
  async deletePathology(id: string): Promise<void> {
    const { error } = await supabase
      .from('patient_pathologies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar patologia:', error);
      throw new Error(`Erro ao deletar patologia: ${error.message}`);
    }
  }

  /**
   * Calcular score de impacto no tratamento (0-100%)
   */
  calculateImpactScore(pathology: Pathology): number {
    const severityScores = {
      mild: 25,
      moderate: 50,
      severe: 75,
      critical: 100
    };

    return severityScores[pathology.severity || 'moderate'];
  }

  /**
   * Mapear dados do banco para interface TypeScript
   */
  private mapPathologyFromDb(data: any): Pathology {
    return {
      id: data.id,
      patientId: data.patient_id,
      name: data.name,
      icdCode: data.icd_code,
      diagnosisDate: data.diagnosis_date,
      status: data.status,
      severity: data.severity,
      affectedRegion: data.affected_region,
      description: data.description,
      treatmentPlan: data.treatment_plan,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

// Exportar instância singleton
export const pathologyService = new PathologyService();

