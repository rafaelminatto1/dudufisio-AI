/**
 * ExercisePrescriptionService - Business logic for patient exercise prescriptions
 * Manages exercise prescriptions using the junction table architecture
 */

import { prescriptionExerciseRepository } from '../repositories/PrescriptionExerciseRepository';
import type { Database } from '@/types/supabase';
import { eventService } from '../eventService';
import { secureLogger } from '@/lib/secureLogger';
import { withSupabaseQuery, withSupabaseMutation } from '@/lib/supabase/errorHandler';
import { supabase } from '@/lib/supabaseClient';

type PrescriptionRow = Database['public']['Tables']['patient_exercise_prescriptions']['Row'];
type PrescriptionInsert = Database['public']['Tables']['patient_exercise_prescriptions']['Insert'];
type PrescriptionUpdate = Database['public']['Tables']['patient_exercise_prescriptions']['Update'];

export interface PrescriptionWithExercises extends PrescriptionRow {
  prescription_exercises?: Array<{
    id: string;
    position: number;
    sets?: number;
    reps?: number;
    hold_time_seconds?: number;
    rest_time_seconds?: number;
    frequency_per_week?: number;
    intensity?: string;
    notes?: string;
    exercise?: Database['public']['Tables']['exercises']['Row'];
  }>;
}

export interface PrescriptionFilters {
  patientId?: string;
  therapistId?: string;
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  startDate?: string | Date;
  endDate?: string | Date;
}

export interface CreatePrescriptionData {
  patientId: string;
  therapistId: string;
  protocolId?: string;
  title: string;
  description?: string;
  startDate: Date | string;
  endDate?: Date | string;
  frequencyPerWeek?: number;
  notes?: string;
  exercises: Array<{
    exerciseId: string;
    position?: number;
    sets?: number;
    reps?: number;
    holdTimeSeconds?: number;
    restTimeSeconds?: number;
    frequencyPerWeek?: number;
    intensity?: string;
    notes?: string;
  }>;
}

export interface UpdatePrescriptionData {
  title?: string;
  description?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  frequencyPerWeek?: number;
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  notes?: string;
  exercises?: Array<{
    exerciseId: string;
    position?: number;
    sets?: number;
    reps?: number;
    holdTimeSeconds?: number;
    restTimeSeconds?: number;
    frequencyPerWeek?: number;
    intensity?: string;
    notes?: string;
  }>;
}

export class ExercisePrescriptionService {
  /**
   * Get all prescriptions with filters
   */
  async findMany(filters?: PrescriptionFilters): Promise<PrescriptionWithExercises[]> {
    return withSupabaseQuery(
      async () => {
        let query = supabase
          .from('patient_exercise_prescriptions')
          .select(`
            *,
            prescription_exercises (
              id,
              position,
              sets,
              reps,
              hold_time_seconds,
              rest_time_seconds,
              frequency_per_week,
              intensity,
              notes,
              exercise:exercises (*)
            )
          `)
          .order('created_at', { ascending: false });

        if (filters?.patientId) {
          query = query.eq('patient_id', filters.patientId);
        }

        if (filters?.therapistId) {
          query = query.eq('therapist_id', filters.therapistId);
        }

        if (filters?.status) {
          query = query.eq('status', filters.status);
        }

        if (filters?.startDate) {
          const date = typeof filters.startDate === 'string' 
            ? filters.startDate 
            : filters.startDate.toISOString();
          query = query.gte('start_date', date);
        }

        if (filters?.endDate) {
          const date = typeof filters.endDate === 'string' 
            ? filters.endDate 
            : filters.endDate.toISOString();
          query = query.lte('end_date', date);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data || [];
      },
      {
        operation: 'findMany',
        fallbackMessage: 'Erro ao buscar prescrições',
      }
    );
  }

  /**
   * Get prescription by ID
   */
  async findById(id: string): Promise<PrescriptionWithExercises | null> {
    return withSupabaseQuery(
      async () => {
        const { data, error } = await supabase
          .from('patient_exercise_prescriptions')
          .select(`
            *,
            prescription_exercises (
              id,
              position,
              sets,
              reps,
              hold_time_seconds,
              rest_time_seconds,
              frequency_per_week,
              intensity,
              notes,
              exercise:exercises (*)
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return null;
          throw error;
        }

        return data;
      },
      {
        operation: 'findById',
        fallbackMessage: 'Erro ao buscar prescrição',
      }
    );
  }

  /**
   * Get active prescriptions for a patient
   */
  async getActiveByPatient(patientId: string): Promise<PrescriptionWithExercises[]> {
    return this.findMany({ patientId, status: 'active' });
  }

  /**
   * Create a new prescription with exercises
   */
  async create(data: CreatePrescriptionData): Promise<PrescriptionWithExercises> {
    return withSupabaseMutation(
      async () => {
        // Validate
        this.validatePrescription(data);

        // Create prescription
        const prescriptionData: PrescriptionInsert = {
          patient_id: data.patientId,
          therapist_id: data.therapistId,
          protocol_id: data.protocolId,
          title: data.title,
          description: data.description,
          start_date: typeof data.startDate === 'string' 
            ? data.startDate 
            : data.startDate.toISOString().split('T')[0],
          end_date: data.endDate 
            ? (typeof data.endDate === 'string' 
                ? data.endDate 
                : data.endDate.toISOString().split('T')[0])
            : undefined,
          frequency_per_week: data.frequencyPerWeek || 3,
          status: 'active',
          notes: data.notes,
        };

        const { data: prescription, error: prescriptionError } = await supabase
          .from('patient_exercise_prescriptions')
          .insert(prescriptionData)
          .select()
          .single();

        if (prescriptionError) throw prescriptionError;

        // Create prescription exercises
        if (data.exercises && data.exercises.length > 0) {
          const exercisesToSave = data.exercises.map((ex, index) => ({
            prescription_id: prescription.id,
            exercise_id: ex.exerciseId,
            position: ex.position ?? index,
            sets: ex.sets,
            reps: ex.reps,
            hold_time_seconds: ex.holdTimeSeconds,
            rest_time_seconds: ex.restTimeSeconds,
            frequency_per_week: ex.frequencyPerWeek,
            intensity: ex.intensity,
            notes: ex.notes,
          }));

          await prescriptionExerciseRepository.createMany(exercisesToSave);
        }

        secureLogger.info('Prescrição criada', { prescriptionId: prescription.id });
        eventService.emit('prescriptions:changed');

        // Return complete prescription with exercises
        const completePrescription = await this.findById(prescription.id);
        return completePrescription!;
      },
      {
        operation: 'create',
        fallbackMessage: 'Erro ao criar prescrição',
      }
    );
  }

  /**
   * Update a prescription
   */
  async update(id: string, data: UpdatePrescriptionData): Promise<PrescriptionWithExercises> {
    return withSupabaseMutation(
      async () => {
        // Update prescription base data
        const updateData: Partial<PrescriptionUpdate> = {};
        
        if (data.title) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.startDate) {
          updateData.start_date = typeof data.startDate === 'string' 
            ? data.startDate 
            : data.startDate.toISOString().split('T')[0];
        }
        if (data.endDate !== undefined) {
          updateData.end_date = data.endDate 
            ? (typeof data.endDate === 'string' 
                ? data.endDate 
                : data.endDate.toISOString().split('T')[0])
            : null;
        }
        if (data.frequencyPerWeek) updateData.frequency_per_week = data.frequencyPerWeek;
        if (data.status) updateData.status = data.status;
        if (data.notes !== undefined) updateData.notes = data.notes;

        if (Object.keys(updateData).length > 0) {
          updateData.updated_at = new Date().toISOString();
          
          const { error } = await supabase
            .from('patient_exercise_prescriptions')
            .update(updateData)
            .eq('id', id);

          if (error) throw error;
        }

        // Update exercises if provided
        if (data.exercises) {
          const exercisesToSave = data.exercises.map((ex, index) => ({
            prescription_id: id,
            exercise_id: ex.exerciseId,
            position: ex.position ?? index,
            sets: ex.sets,
            reps: ex.reps,
            hold_time_seconds: ex.holdTimeSeconds,
            rest_time_seconds: ex.restTimeSeconds,
            frequency_per_week: ex.frequencyPerWeek,
            intensity: ex.intensity,
            notes: ex.notes,
          }));

          await prescriptionExerciseRepository.replacePrescriptionExercises(id, exercisesToSave);
        }

        secureLogger.info('Prescrição atualizada', { prescriptionId: id });
        eventService.emit('prescriptions:changed');

        // Return complete prescription with exercises
        const updatedPrescription = await this.findById(id);
        return updatedPrescription!;
      },
      {
        operation: 'update',
        fallbackMessage: 'Erro ao atualizar prescrição',
      }
    );
  }

  /**
   * Delete a prescription (soft delete)
   */
  async delete(id: string): Promise<void> {
    return withSupabaseMutation(
      async () => {
        // Soft delete by setting deleted_at
        const { error } = await supabase
          .from('patient_exercise_prescriptions')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id);

        if (error) throw error;

        secureLogger.info('Prescrição deletada', { prescriptionId: id });
        eventService.emit('prescriptions:changed');
      },
      {
        operation: 'delete',
        fallbackMessage: 'Erro ao deletar prescrição',
      }
    );
  }

  /**
   * Complete a prescription
   */
  async complete(id: string, feedback?: string): Promise<PrescriptionWithExercises> {
    return this.update(id, {
      status: 'completed',
      notes: feedback,
    });
  }

  /**
   * Pause a prescription
   */
  async pause(id: string, reason?: string): Promise<PrescriptionWithExercises> {
    return this.update(id, {
      status: 'paused',
      notes: reason,
    });
  }

  /**
   * Resume a paused prescription
   */
  async resume(id: string): Promise<PrescriptionWithExercises> {
    return this.update(id, {
      status: 'active',
    });
  }

  /**
   * Cancel a prescription
   */
  async cancel(id: string, reason?: string): Promise<PrescriptionWithExercises> {
    return this.update(id, {
      status: 'cancelled',
      notes: reason,
    });
  }

  /**
   * Create prescription from protocol
   */
  async createFromProtocol(
    patientId: string,
    therapistId: string,
    protocolId: string,
    startDate: Date | string,
    customTitle?: string
  ): Promise<PrescriptionWithExercises> {
    return withSupabaseMutation(
      async () => {
        // Fetch protocol with exercises
        const { data: protocol, error: protocolError } = await supabase
          .from('exercise_protocols')
          .select(`
            *,
            protocol_exercises (
              position,
              sets,
              reps,
              hold_time_seconds,
              rest_time_seconds,
              frequency_per_week,
              intensity,
              notes,
              exercise_id
            )
          `)
          .eq('id', protocolId)
          .single();

        if (protocolError) throw protocolError;
        if (!protocol) throw new Error('Protocolo não encontrado');

        // Map protocol exercises to prescription format
        const exercises = (protocol.protocol_exercises || [])
          .sort((a: any, b: any) => a.position - b.position)
          .map((pe: any) => ({
            exerciseId: pe.exercise_id,
            position: pe.position,
            sets: pe.sets,
            reps: pe.reps,
            holdTimeSeconds: pe.hold_time_seconds,
            restTimeSeconds: pe.rest_time_seconds,
            frequencyPerWeek: pe.frequency_per_week,
            intensity: pe.intensity,
            notes: pe.notes,
          }));

        // Create prescription
        return this.create({
          patientId,
          therapistId,
          protocolId,
          title: customTitle || protocol.name,
          description: protocol.description,
          startDate,
          frequencyPerWeek: protocol.frequency_per_week,
          exercises,
        });
      },
      {
        operation: 'createFromProtocol',
        fallbackMessage: 'Erro ao criar prescrição do protocolo',
      }
    );
  }

  /**
   * Validate prescription data
   */
  private validatePrescription(data: CreatePrescriptionData): void {
    if (!data.patientId) {
      throw new Error('Patient ID é obrigatório');
    }

    if (!data.therapistId) {
      throw new Error('Therapist ID é obrigatório');
    }

    if (!data.title) {
      throw new Error('Título é obrigatório');
    }

    if (!data.startDate) {
      throw new Error('Data de início é obrigatória');
    }

    if (data.exercises && data.exercises.length === 0) {
      throw new Error('Pelo menos um exercício deve ser incluído');
    }
  }

  /**
   * Get prescription statistics for a patient
   */
  async getPatientStats(patientId: string): Promise<{
    total: number;
    active: number;
    completed: number;
    paused: number;
    cancelled: number;
  }> {
    return withSupabaseQuery(
      async () => {
        const { data, error } = await supabase
          .from('patient_exercise_prescriptions')
          .select('status')
          .eq('patient_id', patientId)
          .is('deleted_at', null);

        if (error) throw error;

        const prescriptions = data || [];
        
        return {
          total: prescriptions.length,
          active: prescriptions.filter(p => p.status === 'active').length,
          completed: prescriptions.filter(p => p.status === 'completed').length,
          paused: prescriptions.filter(p => p.status === 'paused').length,
          cancelled: prescriptions.filter(p => p.status === 'cancelled').length,
        };
      },
      {
        operation: 'getPatientStats',
        fallbackMessage: 'Erro ao buscar estatísticas',
      }
    );
  }
}

// Singleton instance
export const exercisePrescriptionService = new ExercisePrescriptionService();

