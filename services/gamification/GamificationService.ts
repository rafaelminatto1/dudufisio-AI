/**
 * Gamification Service - Sistema de Gamificação
 * Activity Fisioterapia Integration - Fase 4
 */

import { supabase } from '@/lib/supabase';

export interface GamificationPoints {
  patient_id: string;
  points: number;
  reason: string;
  category: 'attendance' | 'exercises' | 'engagement' | 'referral' | 'milestone' | 'bonus';
  reference_type?: string;
  reference_id?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_required: number;
  category: string;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_cost: number;
  reward_type: string;
  reward_value: string;
  is_active: boolean;
  stock_quantity?: number;
}

export interface PatientLevel {
  level_name: string;
  level_number: number;
  current_points: number;
  points_to_next: number;
}

export class GamificationService {
  /**
   * Adicionar pontos ao paciente
   */
  static async addPoints(input: GamificationPoints): Promise<void> {
    try {
      const { error } = await supabase
        .from('gamification_points')
        .insert({
          patient_id: input.patient_id,
          clinic_id: await this.getPatientClinicId(input.patient_id),
          points: input.points,
          reason: input.reason,
          category: input.category,
          reference_type: input.reference_type,
          reference_id: input.reference_id,
        });

      if (error) {
        throw error;
      }

      // Verificar se desbloqueou alguma conquista
      await this.checkAchievements(input.patient_id);
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      throw error;
    }
  }

  /**
   * Obter saldo de pontos do paciente
   */
  static async getPatientBalance(patientId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('patient_points_balance')
        .select('current_balance')
        .eq('patient_id', patientId)
        .single();

      if (error) {
        throw error;
      }

      return data?.current_balance || 0;
    } catch (error) {
      console.error('Erro ao buscar saldo:', error);
      return 0;
    }
  }

  /**
   * Obter nível do paciente
   */
  static async getPatientLevel(patientId: string): Promise<PatientLevel> {
    try {
      const { data, error } = await supabase
        .rpc('get_patient_level', { p_patient_id: patientId });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        return data[0] as PatientLevel;
      }

      return {
        level_name: 'Iniciante',
        level_number: 1,
        current_points: 0,
        points_to_next: 500,
      };
    } catch (error) {
      console.error('Erro ao buscar nível:', error);
      return {
        level_name: 'Iniciante',
        level_number: 1,
        current_points: 0,
        points_to_next: 500,
      };
    }
  }

  /**
   * Listar conquistas do paciente
   */
  static async getPatientAchievements(patientId: string): Promise<Achievement[]> {
    try {
      const clinicId = await this.getPatientClinicId(patientId);

      // Buscar todas as conquistas
      const { data: allAchievements } = await supabase
        .from('gamification_achievements')
        .select('*')
        .or(`clinic_id.is.null,clinic_id.eq.${clinicId}`)
        .eq('is_active', true)
        .eq('is_hidden', false);

      // Buscar conquistas desbloqueadas
      const { data: unlockedAchievements } = await supabase
        .from('patient_achievements')
        .select('achievement_id, unlocked_at')
        .eq('patient_id', patientId);

      const unlockedMap = new Map(
        unlockedAchievements?.map((a) => [a.achievement_id, a.unlocked_at]) || []
      );

      return (allAchievements || []).map((achievement) => ({
        ...achievement,
        unlocked: unlockedMap.has(achievement.id),
        unlocked_at: unlockedMap.get(achievement.id),
      }));
    } catch (error) {
      console.error('Erro ao buscar conquistas:', error);
      return [];
    }
  }

  /**
   * Listar recompensas disponíveis
   */
  static async getAvailableRewards(clinicId: string): Promise<Reward[]> {
    try {
      const { data, error } = await supabase
        .from('gamification_rewards')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .or('valid_until.is.null,valid_until.gte.' + new Date().toISOString())
        .order('points_cost');

      if (error) {
        throw error;
      }

      return data as Reward[];
    } catch (error) {
      console.error('Erro ao buscar recompensas:', error);
      return [];
    }
  }

  /**
   * Resgatar recompensa
   */
  static async redeemReward(
    patientId: string,
    rewardId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const clinicId = await this.getPatientClinicId(patientId);

      // 1. Verificar saldo
      const balance = await this.getPatientBalance(patientId);
      
      // 2. Buscar recompensa
      const { data: reward } = await supabase
        .from('gamification_rewards')
        .select('*')
        .eq('id', rewardId)
        .single();

      if (!reward) {
        return { success: false, message: 'Recompensa não encontrada' };
      }

      if (balance < reward.points_cost) {
        return {
          success: false,
          message: `Pontos insuficientes. Você tem ${balance}, precisa de ${reward.points_cost}`,
        };
      }

      // 3. Verificar estoque
      if (reward.stock_quantity !== null && reward.stock_quantity <= 0) {
        return { success: false, message: 'Recompensa esgotada' };
      }

      // 4. Criar resgate
      const { error } = await supabase
        .from('reward_redemptions')
        .insert({
          patient_id: patientId,
          reward_id: rewardId,
          clinic_id: clinicId,
          points_spent: reward.points_cost,
          status: 'pending',
        });

      if (error) {
        throw error;
      }

      // 5. Atualizar estoque (se limitado)
      if (reward.stock_quantity !== null) {
        await supabase
          .from('gamification_rewards')
          .update({ stock_quantity: reward.stock_quantity - 1 })
          .eq('id', rewardId);
      }

      return {
        success: true,
        message: 'Recompensa resgatada! Aguarde aprovação.',
      };
    } catch (error) {
      console.error('Erro ao resgatar recompensa:', error);
      return { success: false, message: 'Erro ao processar resgate' };
    }
  }

  /**
   * Verificar e desbloquear conquistas
   */
  private static async checkAchievements(patientId: string): Promise<void> {
    try {
      const clinicId = await this.getPatientClinicId(patientId);

      // Buscar conquistas não desbloqueadas
      const { data: achievements } = await supabase
        .from('gamification_achievements')
        .select('*')
        .or(`clinic_id.is.null,clinic_id.eq.${clinicId}`)
        .eq('is_active', true);

      // Buscar já desbloqueadas
      const { data: unlocked } = await supabase
        .from('patient_achievements')
        .select('achievement_id')
        .eq('patient_id', patientId);

      const unlockedIds = new Set(unlocked?.map((a) => a.achievement_id) || []);

      // Verificar cada conquista
      for (const achievement of achievements || []) {
        if (unlockedIds.has(achievement.id)) {
          continue; // Já desbloqueada
        }

        const shouldUnlock = await this.checkAchievementConditions(
          patientId,
          achievement
        );

        if (shouldUnlock) {
          await this.unlockAchievement(patientId, achievement.id, clinicId);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
    }
  }

  /**
   * Verificar condições de uma conquista
   */
  private static async checkAchievementConditions(
    patientId: string,
    achievement: any
  ): Promise<boolean> {
    try {
      const trigger = achievement.trigger_type;

      // Exemplos de verificação (expandir conforme necessário)
      if (trigger === 'first_appointment') {
        const { count } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('patient_id', patientId)
          .eq('status', 'completed');

        return (count || 0) >= 1;
      }

      if (trigger === '5_consecutive_appointments') {
        // Lógica para verificar 5 consultas consecutivas
        return false; // Placeholder
      }

      if (trigger === '10_appointments') {
        const { count } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('patient_id', patientId)
          .eq('status', 'completed');

        return (count || 0) >= 10;
      }

      // Outras condições...
      return false;
    } catch (error) {
      console.error('Erro ao verificar condições:', error);
      return false;
    }
  }

  /**
   * Desbloquear conquista
   */
  private static async unlockAchievement(
    patientId: string,
    achievementId: string,
    clinicId: string
  ): Promise<void> {
    try {
      await supabase.from('patient_achievements').insert({
        patient_id: patientId,
        achievement_id: achievementId,
        clinic_id: clinicId,
      });

      console.log(`🏆 Conquista desbloqueada para paciente ${patientId}:`, achievementId);

      // TODO: Enviar notificação ao paciente
    } catch (error) {
      console.error('Erro ao desbloquear conquista:', error);
    }
  }

  /**
   * Helper: Buscar clinic_id do paciente
   */
  private static async getPatientClinicId(patientId: string): Promise<string> {
    const { data } = await supabase
      .from('patients')
      .select('clinic_id')
      .eq('id', patientId)
      .single();

    return data?.clinic_id || '';
  }

  /**
   * Eventos de pontuação (helpers)
   */
  static readonly POINTS_RULES = {
    attendance: {
      firstAppointment: 50,
      appointmentCompleted: 20,
      consecutiveStreak: 100, // Por mês sem faltas
      earlyArrival: 10, // Chegou 15min+ antes
    },
    exercises: {
      completeExercise: 10,
      allDailyExercises: 30,
      weekStreak: 100,
      monthStreak: 500,
    },
    engagement: {
      provideFeedback: 15,
      uploadProgressPhoto: 25,
      writeReview: 50,
      shareSocialMedia: 30,
    },
    referral: {
      referFriend: 200,
      friendSchedules: 300,
      friendCompletes: 500,
    },
  };

  /**
   * Eventos automáticos de pontuação
   */
  static async onAppointmentCompleted(appointmentId: string): Promise<void> {
    const { data: appointment } = await supabase
      .from('appointments')
      .select('patient_id')
      .eq('id', appointmentId)
      .single();

    if (appointment) {
      await this.addPoints({
        patient_id: appointment.patient_id,
        points: this.POINTS_RULES.attendance.appointmentCompleted,
        reason: 'Consulta realizada',
        category: 'attendance',
        reference_type: 'appointment',
        reference_id: appointmentId,
      });
    }
  }

  static async onExerciseCompleted(patientId: string, exerciseId: string): Promise<void> {
    await this.addPoints({
      patient_id: patientId,
      points: this.POINTS_RULES.exercises.completeExercise,
      reason: 'Exercício concluído',
      category: 'exercises',
      reference_type: 'exercise',
      reference_id: exerciseId,
    });
  }

  static async onReviewSubmitted(patientId: string): Promise<void> {
    await this.addPoints({
      patient_id: patientId,
      points: this.POINTS_RULES.engagement.writeReview,
      reason: 'Avaliação enviada',
      category: 'engagement',
    });
  }

  static async onReferralScheduled(referrerId: string, referredId: string): Promise<void> {
    await this.addPoints({
      patient_id: referrerId,
      points: this.POINTS_RULES.referral.friendSchedules,
      reason: 'Indicação agendou consulta',
      category: 'referral',
      reference_type: 'referral',
      reference_id: referredId,
    });
  }
}

