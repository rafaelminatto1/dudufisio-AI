import { createServerComponentClient } from '~/lib/supabase/server';
import { ExerciseService } from './exerciseService';
import { ProtocolService } from './protocolService';

export interface ExerciseProtocolLink {
  exercise_id: string;
  protocol_id: string;
  phase?: string;
  order?: number;
  sets?: number;
  repetitions?: number;
  duration?: number;
  notes?: string;
}

export interface ProtocolWithExercises {
  protocol: any;
  exercises: Array<{
    exercise: any;
    link: ExerciseProtocolLink;
  }>;
}

/**
 * Service para gerenciar vínculos entre exercícios e protocolos
 * Adaptado para Next.js App Router
 */
export class ExerciseProtocolService {
  /**
   * Obtém protocolo com seus exercícios vinculados
   */
  static async getProtocolWithExercises(protocolId: string) {
    try {
      const supabase = await createServerComponentClient();
      
      // Buscar protocolo
      const protocolResult = await ProtocolService.getProtocolById(protocolId);
      if (protocolResult.error || !protocolResult.data) {
        return { data: null, error: protocolResult.error };
      }

      // Buscar exercícios prescritos para este protocolo
      const { data: prescribedExercises, error } = await supabase
        .from('prescribed_exercises')
        .select('*, exercise:exercises_library(*)')
        .eq('protocol_id', protocolId)
        .order('order', { ascending: true });

      if (error) throw error;

      const exercises = (prescribedExercises || []).map((pe: any) => ({
        exercise: pe.exercise,
        link: {
          exercise_id: pe.exercise_id,
          protocol_id: protocolId,
          phase: pe.phase,
          order: pe.order,
          sets: pe.sets,
          repetitions: pe.repetitions,
          duration: pe.duration,
          notes: pe.notes,
        },
      }));

      return {
        data: {
          protocol: protocolResult.data,
          exercises,
        } as ProtocolWithExercises,
        error: null,
      };
    } catch (error) {
      console.error('Error getting protocol with exercises:', error);
      return { data: null, error };
    }
  }

  /**
   * Vincula um exercício a um protocolo
   */
  static async linkExerciseToProtocol(link: ExerciseProtocolLink) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('prescribed_exercises')
        .insert({
          exercise_id: link.exercise_id,
          protocol_id: link.protocol_id,
          phase: link.phase,
          order: link.order || 0,
          sets: link.sets,
          repetitions: link.repetitions,
          duration: link.duration,
          notes: link.notes,
          status: 'ativo',
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error linking exercise to protocol:', error);
      return { data: null, error };
    }
  }

  /**
   * Remove vínculo entre exercício e protocolo
   */
  static async unlinkExerciseFromProtocol(exerciseId: string, protocolId: string) {
    try {
      const supabase = await createServerComponentClient();
      const { error } = await supabase
        .from('prescribed_exercises')
        .delete()
        .eq('exercise_id', exerciseId)
        .eq('protocol_id', protocolId);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error unlinking exercise from protocol:', error);
      return { data: null, error };
    }
  }

  /**
   * Atualiza vínculo entre exercício e protocolo
   */
  static async updateExerciseProtocolLink(
    exerciseId: string,
    protocolId: string,
    updates: Partial<ExerciseProtocolLink>
  ) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('prescribed_exercises')
        .update({
          phase: updates.phase,
          order: updates.order,
          sets: updates.sets,
          repetitions: updates.repetitions,
          duration: updates.duration,
          notes: updates.notes,
        })
        .eq('exercise_id', exerciseId)
        .eq('protocol_id', protocolId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating exercise protocol link:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtém exercícios sugeridos para um protocolo baseado em tags e categoria
   */
  static async getSuggestedExercisesForProtocol(protocolId: string) {
    try {
      const protocolResult = await ProtocolService.getProtocolById(protocolId);
      if (protocolResult.error || !protocolResult.data) {
        return { data: [], error: protocolResult.error };
      }

      const protocol = protocolResult.data;
      
      // Buscar exercícios que correspondem à categoria ou patologia do protocolo
      const exercisesResult = await ExerciseService.getExercises({
        category: protocol.category,
        search: protocol.pathology,
      });

      return exercisesResult;
    } catch (error) {
      console.error('Error getting suggested exercises:', error);
      return { data: null, error };
    }
  }
}

