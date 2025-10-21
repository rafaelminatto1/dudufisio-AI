import { useState, useEffect } from 'react';
import { gamificationService, PlayerStats, Achievement, Leaderboard, DailyChallenge } from '../services/gamificationService';

export interface GamificationProgress {
  level: number;
  points: number;
  xpForNextLevel: number;
  pointsTowardsLevel: number;
  streak: number;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress: number;
    maxProgress: number;
    points: number;
    rarity: string;
  }>;
  pointsBreakdown: Array<{
    source: string;
    points: number;
    percentage: number;
  }>;
  activeChallenges: DailyChallenge[];
  completedChallenges: DailyChallenge[];
  availableRewards: Array<{
    id: string;
    name: string;
    description: string;
    pointsCost: number;
    isUnlocked: boolean;
  }>;
  unlockedRewards: Array<{
    id: string;
    name: string;
    description: string;
    pointsCost: number;
    isUnlocked: boolean;
  }>;
  leaderboard: Array<{
    rank: number;
    patientName: string;
    points: number;
    level: number;
    avatar?: string;
  }>;
  nextMilestone: {
    description: string;
    targetPoints: number;
    pointsRemaining: number;
  };
  recentActivities: Array<{
    id: string;
    description: string;
    points: number;
    timestamp: Date;
    type: string;
  }>;
}

export const useGamification = (patientId: string) => {
  const [progress, setProgress] = useState<GamificationProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGamificationData = async () => {
      if (!patientId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Carregar dados em paralelo
        const [stats, achievements, leaderboard, dailyChallenges] = await Promise.all([
          gamificationService.getPlayerStats(patientId),
          gamificationService.getAchievements(patientId),
          gamificationService.getLeaderboard(patientId),
          gamificationService.getDailyChallenges(patientId)
        ]);

        // Transformar achievements para o formato esperado
        const formattedAchievements = achievements.map(ach => ({
          id: ach.id,
          name: ach.name,
          description: ach.description,
          icon: ach.icon,
          unlocked: ach.isUnlocked,
          progress: ach.progress,
          maxProgress: ach.maxProgress,
          points: ach.points,
          rarity: ach.rarity
        }));

        // Calcular breakdown de pontos
        const pointsBreakdown = [
          { source: 'Sessões completadas', points: stats.sessionsCompleted * 50, percentage: 45 },
          { source: 'Exercícios', points: stats.exercisesCompleted * 5, percentage: 30 },
          { source: 'Conquistas', points: stats.unlockedAchievements * 100, percentage: 20 },
          { source: 'Bônus de sequência', points: stats.streak * 10, percentage: 5 }
        ];

        // Separar desafios
        const activeChallenges = dailyChallenges.filter(c => !c.isCompleted);
        const completedChallenges = dailyChallenges.filter(c => c.isCompleted);

        // Mock de recompensas
        const availableRewards = [
          { id: 'reward_1', name: 'Consulta Bônus', description: 'Ganhe uma sessão extra', pointsCost: 500, isUnlocked: false },
          { id: 'reward_2', name: 'Desconto 10%', description: 'Desconto no próximo mês', pointsCost: 300, isUnlocked: false }
        ];

        const unlockedRewards = [
          { id: 'reward_3', name: 'Certificado Bronze', description: 'Primeira conquista!', pointsCost: 100, isUnlocked: true }
        ];

        // Transformar leaderboard
        const formattedLeaderboard = leaderboard.map(entry => ({
          rank: entry.rank,
          patientName: entry.userName,
          points: entry.points,
          level: entry.level,
          avatar: entry.avatar
        }));

        // Calcular próxima meta
        const nextMilestone = {
          description: 'Próximo nível',
          targetPoints: stats.nextLevelPoints,
          pointsRemaining: stats.nextLevelPoints - stats.totalPoints
        };

        // Atividades recentes (mock)
        const recentActivities = [
          { id: '1', description: 'Sessão completada', points: 50, timestamp: new Date(), type: 'session' },
          { id: '2', description: 'Exercício concluído', points: 10, timestamp: new Date(), type: 'exercise' },
          { id: '3', description: 'Conquista desbloqueada', points: 100, timestamp: new Date(), type: 'achievement' }
        ];

        const progressData: GamificationProgress = {
          level: stats.level,
          points: stats.totalPoints,
          xpForNextLevel: stats.nextLevelPoints,
          pointsTowardsLevel: stats.currentLevelProgress,
          streak: stats.streak,
          achievements: formattedAchievements,
          pointsBreakdown,
          activeChallenges,
          completedChallenges,
          availableRewards,
          unlockedRewards,
          leaderboard: formattedLeaderboard,
          nextMilestone,
          recentActivities
        };

        setProgress(progressData);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar dados de gamificação:', err);
        setError('Falha ao carregar dados de gamificação');
      } finally {
        setIsLoading(false);
      }
    };

    loadGamificationData();
  }, [patientId]);

  return { progress, isLoading, error };
};