import { createServerComponentClient } from '~/lib/supabase/server';

export type PointsType = 'sessao' | 'meta' | 'exercicio' | 'feedback' | 'sem_faltas' | 'bonus';

export class XPService {
  private static readonly POINTS_CONFIG = {
    sessao: 10,
    meta: 50,
    exercicio: 5,
    feedback: 5,
    sem_faltas: 100,
  };

  static async awardPoints(params: {
    patientId: string;
    pointsType: PointsType;
    points?: number;
    description: string;
  }) {
    try {
      const supabase = createServerComponentClient();
      const pointsEarned = params.points || this.POINTS_CONFIG[params.pointsType] || 0;

      const { data, error } = await supabase
        .from('gamification_points')
        .insert({
          patient_id: params.patientId,
          points_earned: pointsEarned,
          points_type: params.pointsType,
          description: params.description,
        })
        .select()
        .single();

      if (error) throw error;

      // Update patient XP
      const { data: patient } = await supabase
        .from('patients')
        .select('xp_points')
        .eq('id', params.patientId)
        .single();

      if (patient) {
        await supabase
          .from('patients')
          .update({ xp_points: patient.xp_points + pointsEarned })
          .eq('id', params.patientId);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error awarding points:', error);
      return { data: null, error };
    }
  }

  static async getPatientXP(patientId: string) {
    try {
      const supabase = createServerComponentClient();
      const { data: patient, error } = await supabase
        .from('patients')
        .select('xp_points, level')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      return {
        data: {
          currentXP: patient?.xp_points || 0,
          currentLevel: patient?.level || 1,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error fetching patient XP:', error);
      return { data: null, error };
    }
  }
}

