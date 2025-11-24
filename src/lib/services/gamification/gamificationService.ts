import { createServerComponentClient } from '~/lib/supabase/server';
import { XPService } from './xpService';
import { BadgeService } from './badgeService';
import { VoucherService } from './voucherService';
import { LeaderboardService } from './leaderboardService';

/**
 * Service principal de gamificação
 * Orquestra todos os serviços de gamificação
 * Adaptado para Next.js App Router
 */
export class GamificationService {
  /**
   * Processa conclusão de sessão e concede recompensas
   */
  static async processSessionCompletion(params: {
    patientId: string;
    appointmentId: string;
    wasOnTime: boolean;
    completedExercises?: number;
  }) {
    try {
      const rewards = [];

      // Conceder pontos por sessão
      const xpResult = await XPService.awardPoints({
        patientId: params.patientId,
        pointsType: 'sessao',
        description: 'Sessão completada',
      });
      if (xpResult.data) {
        const xpData = xpResult.data as Record<string, unknown>;
        const pointsEarned = typeof xpData.points_earned === 'number' ? xpData.points_earned : 0;
        rewards.push({ type: 'xp', value: pointsEarned });
      }

      // Bônus por pontualidade
      if (params.wasOnTime) {
        const bonusResult = await XPService.awardPoints({
          patientId: params.patientId,
          pointsType: 'sem_faltas',
          description: 'Sessão realizada sem atraso',
        });
        if (bonusResult.data) {
          const bonusData = bonusResult.data as Record<string, unknown>;
          const bonusPoints = typeof bonusData.points_earned === 'number' ? bonusData.points_earned : 0;
          rewards.push({ type: 'bonus', value: bonusPoints });
        }
      }

      // Pontos por exercícios completados
      if (params.completedExercises && params.completedExercises > 0) {
        const exercisesResult = await XPService.awardPoints({
          patientId: params.patientId,
          pointsType: 'exercicio',
          points: params.completedExercises * 5,
          description: `${params.completedExercises} exercícios completados`,
        });
        if (exercisesResult.data) {
          const exercisesData = exercisesResult.data as Record<string, unknown>;
          const exercisePoints = typeof exercisesData.points_earned === 'number' ? exercisesData.points_earned : 0;
          rewards.push({ type: 'exercises', value: exercisePoints });
        }
      }

      // Verificar se paciente atingiu novo nível
      const xpData = await XPService.getPatientXP(params.patientId);
      if (xpData.data) {
        const newLevel = this.calculateLevel(xpData.data.currentXP);
        if (newLevel > xpData.data.currentLevel) {
          // Atualizar nível do paciente
          const supabase = await createServerComponentClient();
          await (supabase as any)
            .from('patients')
            .update({ level: newLevel })
            .eq('id', params.patientId);

          rewards.push({ type: 'level_up', value: newLevel });
        }
      }

      // Verificar badges a serem concedidos
      const badgesResult = await this.checkAndAwardBadges(params.patientId);
      if (badgesResult.data && badgesResult.data.length > 0) {
        rewards.push({ type: 'badges', value: badgesResult.data });
      }

      return { data: { rewards }, error: null };
    } catch (error) {
      console.error('Error processing session completion:', error);
      return { data: null, error };
    }
  }

  /**
   * Verifica e concede badges baseado em conquistas
   */
  static async checkAndAwardBadges(patientId: string) {
    try {
      const supabase = await createServerComponentClient();
      const awardedBadges = [];

      // Obter estatísticas do paciente
      const { data: patient } = await supabase
        .from('patients')
        .select('xp_points, level')
        .eq('id', patientId)
        .single();

      if (!patient) return { data: [], error: null };

      // Contar sessões completadas
      const { data: sessions } = await supabase
        .from('appointments')
        .select('id', { count: 'exact' })
        .eq('patient_id', patientId)
        .eq('status', 'concluido');

      const sessionCount = sessions?.length || 0;

      // Verificar badges disponíveis
      const { data: allBadges } = await supabase
        .from('badges')
        .select('*');

      // Badge: Primeira Sessão
      if (sessionCount >= 1) {
        const firstSessionBadge = allBadges?.find(b => b.slug === 'primeira-sessao');
        if (firstSessionBadge) {
          const result = await BadgeService.awardBadge({
            patientId,
            badgeId: firstSessionBadge.id,
          });
          if (result.data) awardedBadges.push(result.data);
        }
      }

      // Badge: 10 Sessões
      if (sessionCount >= 10) {
        const tenSessionsBadge = allBadges?.find(b => b.slug === '10-sessoes');
        if (tenSessionsBadge) {
          const result = await BadgeService.awardBadge({
            patientId,
            badgeId: tenSessionsBadge.id,
          });
          if (result.data) awardedBadges.push(result.data);
        }
      }

      // Badge: Nível 5
      const patientData = patient as any;
      const patientLevel = typeof patientData.level === 'number' ? patientData.level : 1;
      if (patientLevel >= 5) {
        const level5Badge = allBadges?.find(b => b.slug === 'nivel-5');
        if (level5Badge) {
          const result = await BadgeService.awardBadge({
            patientId,
            badgeId: level5Badge.id,
          });
          if (result.data) awardedBadges.push(result.data);
        }
      }

      return { data: awardedBadges, error: null };
    } catch (error) {
      console.error('Error checking badges:', error);
      return { data: [], error };
    }
  }

  /**
   * Obtém dashboard de gamificação do paciente
   */
  static async getPatientDashboard(patientId: string) {
    try {
      const [xpData, badgesData, rankData] = await Promise.all([
        XPService.getPatientXP(patientId),
        BadgeService.getPatientBadges(patientId),
        LeaderboardService.getPatientRank(patientId, 'points'),
      ]);

      return {
        data: {
          xp: xpData.data,
          badges: badgesData.data || [],
          rank: rankData.data,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error getting patient dashboard:', error);
      return { data: null, error };
    }
  }

  /**
   * Calcula nível baseado em XP
   */
  private static calculateLevel(xp: number): number {
    // Fórmula: nível = floor(sqrt(xp / 100)) + 1
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  /**
   * Obtém XP necessário para próximo nível
   */
  static getXPForNextLevel(currentLevel: number): number {
    // XP necessário = (nível^2 - 1) * 100
    return (currentLevel * currentLevel) * 100;
  }
}

