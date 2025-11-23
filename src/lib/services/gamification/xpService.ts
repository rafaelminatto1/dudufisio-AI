import { createServerComponentClient } from '~/lib/supabase/server';

export type PointsType = 'sessao' | 'meta' | 'exercicio' | 'feedback' | 'sem_faltas' | 'bonus';

export class XPService {
  private static readonly POINTS_CONFIG: Record<PointsType, number> = {
    sessao: 10,
    meta: 50,
    exercicio: 5,
    feedback: 5,
    sem_faltas: 100,
    bonus: 0, // Added to match PointsType
  };

  static async awardPoints(params: {
    patientId: string;
    pointsType: PointsType;
    points?: number;
    description: string;
  }) {
    try {
      const supabase = await createServerComponentClient();
      const pointsEarned = params.points || this.POINTS_CONFIG[params.pointsType] || 0;

      const { data, error } = await supabase
        .from('gamification_points' as any)
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
        .from('patients' as any)
        .select('xp_points')
        .eq('id', params.patientId)
        .single();

      if (patient) {
        await supabase
          .from('patients' as any)
          .update({ xp_points: (patient as any).xp_points + pointsEarned } as any)
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
      const supabase = await createServerComponentClient();
      const { data: patient, error } = await supabase
        .from('patients' as any)
        .select('xp_points, level')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      return {
        data: {
          currentXP: (patient as any)?.xp_points || 0,
          currentLevel: (patient as any)?.level || 1,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error fetching patient XP:', error);
      return { data: null, error };
    }
  }
}

