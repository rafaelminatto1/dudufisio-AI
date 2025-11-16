import { supabase } from '../lib/supabase';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'attendance' | 'progress' | 'milestone' | 'special';
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockCondition: string;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  order: number;
}

export interface PlayerStats {
  userId: string;
  totalPoints: number;
  level: number;
  currentLevelProgress: number;
  nextLevelPoints: number;
  rank: string;
  streak: number;
  longestStreak: number;
  totalAchievements: number;
  unlockedAchievements: number;
  sessionsCompleted: number;
  exercisesCompleted: number;
  painReduction: number;
}

export interface Leaderboard {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  points: number;
  level: number;
  achievements: number;
  isCurrentUser: boolean;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  expiresAt: Date;
}

// Configuração de níveis e pontos
const LEVEL_CONFIG = [
  { level: 1, minPoints: 0, maxPoints: 100, rank: 'Iniciante' },
  { level: 2, minPoints: 100, maxPoints: 250, rank: 'Dedicado' },
  { level: 3, minPoints: 250, maxPoints: 500, rank: 'Comprometido' },
  { level: 4, minPoints: 500, maxPoints: 1000, rank: 'Persistente' },
  { level: 5, minPoints: 1000, maxPoints: 2000, rank: 'Determinado' },
  { level: 6, minPoints: 2000, maxPoints: 3500, rank: 'Campeão' },
  { level: 7, minPoints: 3500, maxPoints: 5500, rank: 'Mestre' },
  { level: 8, minPoints: 5500, maxPoints: 8000, rank: 'Lenda' },
  { level: 9, minPoints: 8000, maxPoints: 12000, rank: 'Titã' },
  { level: 10, minPoints: 12000, maxPoints: Infinity, rank: 'Imortal' },
];

// Conquistas pré-definidas
const ACHIEVEMENTS_CATALOG: Omit<Achievement, 'progress' | 'isUnlocked' | 'unlockedAt'>[] = [
  // Conquistas de Presença
  {
    id: 'first_session',
    name: 'Primeiro Passo',
    description: 'Complete sua primeira sessão de fisioterapia',
    icon: '🎯',
    category: 'attendance',
    points: 50,
    rarity: 'common',
    unlockCondition: 'sessions_completed >= 1',
    maxProgress: 1,
    order: 1
  },
  {
    id: 'five_sessions',
    name: 'Persistente',
    description: 'Complete 5 sessões de fisioterapia',
    icon: '💪',
    category: 'attendance',
    points: 100,
    rarity: 'common',
    unlockCondition: 'sessions_completed >= 5',
    maxProgress: 5,
    order: 2
  },
  {
    id: 'ten_sessions',
    name: 'Dedicado',
    description: 'Complete 10 sessões de fisioterapia',
    icon: '🏆',
    category: 'attendance',
    points: 200,
    rarity: 'rare',
    unlockCondition: 'sessions_completed >= 10',
    maxProgress: 10,
    order: 3
  },
  {
    id: 'twenty_sessions',
    name: 'Comprometido',
    description: 'Complete 20 sessões de fisioterapia',
    icon: '⭐',
    category: 'attendance',
    points: 400,
    rarity: 'epic',
    unlockCondition: 'sessions_completed >= 20',
    maxProgress: 20,
    order: 4
  },
  {
    id: 'fifty_sessions',
    name: 'Lendário',
    description: 'Complete 50 sessões de fisioterapia',
    icon: '👑',
    category: 'attendance',
    points: 1000,
    rarity: 'legendary',
    unlockCondition: 'sessions_completed >= 50',
    maxProgress: 50,
    order: 5
  },

  // Conquistas de Sequência
  {
    id: 'streak_7',
    name: 'Uma Semana Forte',
    description: 'Mantenha uma sequência de 7 dias consecutivos',
    icon: '🔥',
    category: 'milestone',
    points: 150,
    rarity: 'rare',
    unlockCondition: 'streak >= 7',
    maxProgress: 7,
    order: 6
  },
  {
    id: 'streak_30',
    name: 'Mês de Ouro',
    description: 'Mantenha uma sequência de 30 dias consecutivos',
    icon: '🌟',
    category: 'milestone',
    points: 500,
    rarity: 'epic',
    unlockCondition: 'streak >= 30',
    maxProgress: 30,
    order: 7
  },
  {
    id: 'streak_100',
    name: 'Centenário',
    description: 'Mantenha uma sequência de 100 dias consecutivos',
    icon: '💎',
    category: 'milestone',
    points: 2000,
    rarity: 'legendary',
    unlockCondition: 'streak >= 100',
    maxProgress: 100,
    order: 8
  },

  // Conquistas de Progresso
  {
    id: 'pain_reduced_30',
    name: 'Alívio Inicial',
    description: 'Reduza sua dor em 30%',
    icon: '😌',
    category: 'progress',
    points: 200,
    rarity: 'rare',
    unlockCondition: 'pain_reduction >= 30',
    maxProgress: 30,
    order: 9
  },
  {
    id: 'pain_reduced_50',
    name: 'Meio Caminho',
    description: 'Reduza sua dor em 50%',
    icon: '😊',
    category: 'progress',
    points: 400,
    rarity: 'epic',
    unlockCondition: 'pain_reduction >= 50',
    maxProgress: 50,
    order: 10
  },
  {
    id: 'pain_reduced_70',
    name: 'Quase Lá',
    description: 'Reduza sua dor em 70%',
    icon: '😄',
    category: 'progress',
    points: 600,
    rarity: 'epic',
    unlockCondition: 'pain_reduction >= 70',
    maxProgress: 70,
    order: 11
  },
  {
    id: 'pain_free',
    name: 'Sem Dor!',
    description: 'Atinja nível zero de dor',
    icon: '🎉',
    category: 'progress',
    points: 1000,
    rarity: 'legendary',
    unlockCondition: 'pain_scale == 0',
    maxProgress: 1,
    order: 12
  },

  // Conquistas de Exercícios
  {
    id: 'exercises_50',
    name: 'Praticante',
    description: 'Complete 50 exercícios',
    icon: '🏃',
    category: 'progress',
    points: 100,
    rarity: 'common',
    unlockCondition: 'exercises_completed >= 50',
    maxProgress: 50,
    order: 13
  },
  {
    id: 'exercises_200',
    name: 'Atleta',
    description: 'Complete 200 exercícios',
    icon: '🏋️',
    category: 'progress',
    points: 300,
    rarity: 'rare',
    unlockCondition: 'exercises_completed >= 200',
    maxProgress: 200,
    order: 14
  },
  {
    id: 'exercises_500',
    name: 'Guerreiro',
    description: 'Complete 500 exercícios',
    icon: '🥇',
    category: 'progress',
    points: 800,
    rarity: 'epic',
    unlockCondition: 'exercises_completed >= 500',
    maxProgress: 500,
    order: 15
  },

  // Conquistas Especiais
  {
    id: 'early_bird',
    name: 'Madrugador',
    description: 'Complete uma sessão antes das 8h',
    icon: '🌅',
    category: 'special',
    points: 100,
    rarity: 'rare',
    unlockCondition: 'session_before_8am == true',
    maxProgress: 1,
    order: 16
  },
  {
    id: 'weekend_warrior',
    name: 'Guerreiro de Fim de Semana',
    description: 'Complete sessões em 5 fins de semana consecutivos',
    icon: '⚔️',
    category: 'special',
    points: 250,
    rarity: 'epic',
    unlockCondition: 'weekend_sessions >= 5',
    maxProgress: 5,
    order: 17
  },
  {
    id: 'perfect_week',
    name: 'Semana Perfeita',
    description: 'Complete todos os exercícios prescritos em uma semana',
    icon: '✨',
    category: 'special',
    points: 300,
    rarity: 'epic',
    unlockCondition: 'weekly_completion == 100',
    maxProgress: 1,
    order: 18
  },
  {
    id: 'feedback_master',
    name: 'Voz Ativa',
    description: 'Forneça feedback em 10 sessões',
    icon: '💬',
    category: 'special',
    points: 200,
    rarity: 'rare',
    unlockCondition: 'feedback_count >= 10',
    maxProgress: 10,
    order: 19
  },
  {
    id: 'goal_achiever',
    name: 'Realizador de Metas',
    description: 'Atinja 3 metas de tratamento',
    icon: '🎯',
    category: 'special',
    points: 500,
    rarity: 'epic',
    unlockCondition: 'goals_achieved >= 3',
    maxProgress: 3,
    order: 20
  }
];

class GamificationService {
  /**
   * Busca estatísticas do jogador
   */
  async getPlayerStats(userId: string): Promise<PlayerStats> {
    try {
      // Mock data para desenvolvimento
      const mockStats: PlayerStats = {
        userId,
        totalPoints: 850,
        level: 4,
        currentLevelProgress: 350,
        nextLevelPoints: 1000,
        rank: 'Persistente',
        streak: 12,
        longestStreak: 25,
        totalAchievements: 20,
        unlockedAchievements: 8,
        sessionsCompleted: 15,
        exercisesCompleted: 120,
        painReduction: 45
      };

      return mockStats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas do jogador:', error);
      throw new Error('Falha ao carregar estatísticas');
    }
  }

  /**
   * Busca conquistas do usuário
   */
  async getAchievements(userId: string): Promise<Achievement[]> {
    try {
      const stats = await this.getPlayerStats(userId);

      // Calcular progresso para cada conquista
      const achievements = ACHIEVEMENTS_CATALOG.map(achievement => {
        let progress = 0;
        let isUnlocked = false;

        // Avaliar condição de desbloqueio
        if (achievement.unlockCondition.includes('sessions_completed')) {
          progress = stats.sessionsCompleted;
          isUnlocked = stats.sessionsCompleted >= achievement.maxProgress;
        } else if (achievement.unlockCondition.includes('streak')) {
          progress = stats.streak;
          isUnlocked = stats.streak >= achievement.maxProgress;
        } else if (achievement.unlockCondition.includes('pain_reduction')) {
          progress = stats.painReduction;
          isUnlocked = stats.painReduction >= achievement.maxProgress;
        } else if (achievement.unlockCondition.includes('exercises_completed')) {
          progress = stats.exercisesCompleted;
          isUnlocked = stats.exercisesCompleted >= achievement.maxProgress;
        }

        return {
          ...achievement,
          progress: Math.min(progress, achievement.maxProgress),
          isUnlocked,
          unlockedAt: isUnlocked ? new Date() : undefined
        };
      });

      return achievements.sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Erro ao buscar conquistas:', error);
      throw new Error('Falha ao carregar conquistas');
    }
  }

  /**
   * Busca ranking de jogadores
   */
  async getLeaderboard(userId: string, limit: number = 10): Promise<Leaderboard[]> {
    try {
      // Mock data para desenvolvimento
      const mockLeaderboard: Leaderboard[] = [
        { rank: 1, userId: 'user_001', userName: 'Maria Silva', points: 2500, level: 6, achievements: 15, isCurrentUser: false },
        { rank: 2, userId: 'user_002', userName: 'João Santos', points: 2200, level: 5, achievements: 13, isCurrentUser: false },
        { rank: 3, userId: 'user_003', userName: 'Ana Costa', points: 1800, level: 5, achievements: 12, isCurrentUser: false },
        { rank: 4, userId: userId, userName: 'Você', points: 850, level: 4, achievements: 8, isCurrentUser: true },
        { rank: 5, userId: 'user_005', userName: 'Pedro Lima', points: 800, level: 4, achievements: 7, isCurrentUser: false },
        { rank: 6, userId: 'user_006', userName: 'Carla Souza', points: 650, level: 3, achievements: 6, isCurrentUser: false },
        { rank: 7, userId: 'user_007', userName: 'Lucas Oliveira', points: 500, level: 3, achievements: 5, isCurrentUser: false },
        { rank: 8, userId: 'user_008', userName: 'Julia Alves', points: 400, level: 2, achievements: 4, isCurrentUser: false },
        { rank: 9, userId: 'user_009', userName: 'Rafael Dias', points: 300, level: 2, achievements: 3, isCurrentUser: false },
        { rank: 10, userId: 'user_010', userName: 'Beatriz Rocha', points: 250, level: 2, achievements: 3, isCurrentUser: false },
      ];

      return mockLeaderboard.slice(0, limit);
    } catch (error) {
      console.error('Erro ao buscar leaderboard:', error);
      throw new Error('Falha ao carregar ranking');
    }
  }

  /**
   * Busca desafios diários
   */
  async getDailyChallenges(userId: string): Promise<DailyChallenge[]> {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const mockChallenges: DailyChallenge[] = [
        {
          id: 'daily_1',
          title: 'Sessão Matinal',
          description: 'Complete uma sessão antes do meio-dia',
          icon: '☀️',
          points: 50,
          progress: 0,
          maxProgress: 1,
          isCompleted: false,
          expiresAt: tomorrow
        },
        {
          id: 'daily_2',
          title: 'Trio de Exercícios',
          description: 'Complete 3 exercícios diferentes',
          icon: '🎯',
          points: 30,
          progress: 1,
          maxProgress: 3,
          isCompleted: false,
          expiresAt: tomorrow
        },
        {
          id: 'daily_3',
          title: 'Feedback do Dia',
          description: 'Forneça feedback sobre sua sessão',
          icon: '💭',
          points: 20,
          progress: 0,
          maxProgress: 1,
          isCompleted: false,
          expiresAt: tomorrow
        }
      ];

      return mockChallenges;
    } catch (error) {
      console.error('Erro ao buscar desafios diários:', error);
      throw new Error('Falha ao carregar desafios');
    }
  }

  /**
   * Adiciona pontos ao jogador
   */
  async addPoints(userId: string, points: number, reason: string): Promise<PlayerStats> {
    try {
      const currentStats = await this.getPlayerStats(userId);
      const newPoints = currentStats.totalPoints + points;

      // Calcular novo nível
      const newLevel = LEVEL_CONFIG.find(level => newPoints >= level.minPoints && newPoints < level.maxPoints);

      const updatedStats: PlayerStats = {
        ...currentStats,
        totalPoints: newPoints,
        level: newLevel?.level || currentStats.level,
        rank: newLevel?.rank || currentStats.rank,
        currentLevelProgress: newLevel ? newPoints - newLevel.minPoints : currentStats.currentLevelProgress,
        nextLevelPoints: newLevel?.maxPoints || currentStats.nextLevelPoints
      };

      // Em produção, salvar no Supabase
      console.log(`Adicionados ${points} pontos para ${userId}. Razão: ${reason}`);

      return updatedStats;
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      throw new Error('Falha ao adicionar pontos');
    }
  }

  /**
   * Desbloqueia uma conquista
   */
  async unlockAchievement(userId: string, achievementId: string): Promise<Achievement> {
    try {
      const achievement = ACHIEVEMENTS_CATALOG.find(a => a.id === achievementId);
      if (!achievement) {
        throw new Error('Conquista não encontrada');
      }

      // Adicionar pontos ao jogador
      await this.addPoints(userId, achievement.points, `Conquista desbloqueada: ${achievement.name}`);

      const unlockedAchievement: Achievement = {
        ...achievement,
        progress: achievement.maxProgress,
        isUnlocked: true,
        unlockedAt: new Date()
      };

      // Em produção, salvar no Supabase
      console.log(`Conquista ${achievementId} desbloqueada para ${userId}`);

      return unlockedAchievement;
    } catch (error) {
      console.error('Erro ao desbloquear conquista:', error);
      throw new Error('Falha ao desbloquear conquista');
    }
  }

  /**
   * Calcula nível baseado em pontos
   */
  calculateLevel(points: number): { level: number; rank: string; progress: number; nextLevelPoints: number } {
    const levelInfo = LEVEL_CONFIG.find(level => points >= level.minPoints && points < level.maxPoints);
    
    if (!levelInfo) {
      return {
        level: 10,
        rank: 'Imortal',
        progress: 0,
        nextLevelPoints: Infinity
      };
    }

    return {
      level: levelInfo.level,
      rank: levelInfo.rank,
      progress: points - levelInfo.minPoints,
      nextLevelPoints: levelInfo.maxPoints
    };
  }

  /**
   * Busca conquistas por categoria
   */
  async getAchievementsByCategory(userId: string, category: Achievement['category']): Promise<Achievement[]> {
    const allAchievements = await this.getAchievements(userId);
    return allAchievements.filter(a => a.category === category);
  }

  /**
   * Busca progresso de uma conquista específica
   */
  async getAchievementProgress(userId: string, achievementId: string): Promise<Achievement | undefined> {
    const achievements = await this.getAchievements(userId);
    return achievements.find(a => a.id === achievementId);
  }
}

export const gamificationService = new GamificationService();