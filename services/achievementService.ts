/**
 * Achievement Service
 * Gerencia conquistas e desbloqueios
 */

import {
  Achievement,
  UserAchievement,
  UserStats,
  AchievementCriteria,
  ACHIEVEMENT_TEMPLATES,
  getRankByPoints
} from '../types/gamification';
import { indexedDB } from '../lib/indexedDB';

class AchievementService {
  private readonly ACHIEVEMENTS_KEY = 'achievements';
  private readonly USER_STATS_KEY = 'user-stats';

  /**
   * Inicializa achievements padrão
   */
  async initializeAchievements(): Promise<void> {
    const stored = await indexedDB.get('settings', this.ACHIEVEMENTS_KEY);
    
    if (!stored || !stored.value) {
      const achievements: Achievement[] = ACHIEVEMENT_TEMPLATES.map((template, index) => ({
        ...template,
        id: `ach-${index + 1}`,
        createdAt: new Date()
      }));

      await indexedDB.set('settings', {
        key: this.ACHIEVEMENTS_KEY,
        value: achievements,
        updatedAt: new Date()
      });
    }
  }

  /**
   * Retorna todas as conquistas
   */
  async getAllAchievements(): Promise<Achievement[]> {
    const stored = await indexedDB.get('settings', this.ACHIEVEMENTS_KEY);
    if (!stored || !stored.value) {
      await this.initializeAchievements();
      return this.getAllAchievements();
    }

    return stored.value.map((ach: any) => ({
      ...ach,
      createdAt: new Date(ach.createdAt)
    }));
  }

  /**
   * Retorna stats do usuário
   */
  async getUserStats(userId: string): Promise<UserStats> {
    const stored = await indexedDB.get('settings', `${this.USER_STATS_KEY}-${userId}`);

    if (!stored || !stored.value) {
      // Create default stats
      const defaultStats: UserStats = {
        userId,
        totalPoints: 0,
        level: 1,
        rank: 'Bronze',
        achievements: [],
        streaks: [],
        badges: [],
        updatedAt: new Date()
      };

      await this.saveUserStats(defaultStats);
      return defaultStats;
    }

    return {
      ...stored.value,
      updatedAt: new Date(stored.value.updatedAt)
    };
  }

  /**
   * Salva stats do usuário
   */
  private async saveUserStats(stats: UserStats): Promise<void> {
    await indexedDB.set('settings', {
      key: `${this.USER_STATS_KEY}-${stats.userId}`,
      value: stats,
      updatedAt: new Date()
    });
  }

  /**
   * Verifica e desbloqueia conquistas
   */
  async checkAchievements(userId: string, metrics: Record<string, number>): Promise<Achievement[]> {
    const achievements = await this.getAllAchievements();
    const userStats = await this.getUserStats(userId);
    const unlockedAchievements: Achievement[] = [];

    for (const achievement of achievements) {
      // Skip if already unlocked
      if (userStats.achievements.some(ua => ua.achievementId === achievement.id)) {
        continue;
      }

      // Check if criteria is met
      if (this.checkCriteria(achievement.criteria, metrics)) {
        unlockedAchievements.push(achievement);
        await this.unlockAchievement(userId, achievement);
      }
    }

    return unlockedAchievements;
  }

  /**
   * Verifica se critério foi atingido
   */
  private checkCriteria(criteria: AchievementCriteria, metrics: Record<string, number>): boolean {
    const value = metrics[criteria.metric];
    if (value === undefined) return false;

    switch (criteria.type) {
      case 'count':
      case 'threshold':
        const comparison = criteria.comparison || 'gte';
        if (comparison === 'gte') return value >= criteria.target;
        if (comparison === 'lte') return value <= criteria.target;
        if (comparison === 'eq') return value === criteria.target;
        return false;

      case 'streak':
        return value >= criteria.target;

      case 'completion':
        return value >= 100; // 100% completion

      case 'rating':
        return value >= criteria.target;

      case 'custom':
        // Custom logic would be implemented here
        return value >= criteria.target;

      default:
        return false;
    }
  }

  /**
   * Desbloqueia conquista para usuário
   */
  async unlockAchievement(userId: string, achievement: Achievement): Promise<void> {
    const stats = await this.getUserStats(userId);

    const userAchievement: UserAchievement = {
      userId,
      achievementId: achievement.id,
      unlockedAt: new Date(),
      progress: 100,
      isNew: true
    };

    stats.achievements.push(userAchievement);
    stats.totalPoints += achievement.points;

    // Update rank
    const rank = getRankByPoints(stats.totalPoints);
    stats.level = rank.level;
    stats.rank = rank.name;

    await this.saveUserStats(stats);

    // Trigger notification (handled by caller)
    console.log(`🎉 Achievement unlocked for ${userId}:`, achievement.name);
  }

  /**
   * Adiciona pontos ao usuário
   */
  async addPoints(userId: string, points: number, reason: string): Promise<UserStats> {
    const stats = await this.getUserStats(userId);
    
    stats.totalPoints += points;

    const rank = getRankByPoints(stats.totalPoints);
    stats.level = rank.level;
    stats.rank = rank.name;

    await this.saveUserStats(stats);

    console.log(`➕ Added ${points} points to ${userId} for: ${reason}`);

    return stats;
  }

  /**
   * Atualiza streak do usuário
   */
  async updateStreak(userId: string, type: UserStats['streaks'][0]['type'], increment: boolean = true): Promise<void> {
    const stats = await this.getUserStats(userId);
    
    const streakIndex = stats.streaks.findIndex(s => s.type === type);

    if (streakIndex === -1) {
      // Create new streak
      stats.streaks.push({
        type,
        current: increment ? 1 : 0,
        longest: increment ? 1 : 0,
        lastUpdated: new Date()
      });
    } else {
      const streak = stats.streaks[streakIndex];
      
      if (increment) {
        streak.current += 1;
        streak.longest = Math.max(streak.longest, streak.current);
      } else {
        streak.current = 0;
      }

      streak.lastUpdated = new Date();
    }

    await this.saveUserStats(stats);
  }

  /**
   * Retorna progresso de conquista
   */
  async getAchievementProgress(userId: string, achievementId: string, currentMetrics: Record<string, number>): Promise<number> {
    const achievements = await this.getAllAchievements();
    const achievement = achievements.find(a => a.id === achievementId);
    
    if (!achievement) return 0;

    const value = currentMetrics[achievement.criteria.metric] || 0;
    const progress = Math.min(100, (value / achievement.criteria.target) * 100);

    return Math.round(progress);
  }

  /**
   * Marca conquista como vista (remove isNew flag)
   */
  async markAchievementAsSeen(userId: string, achievementId: string): Promise<void> {
    const stats = await this.getUserStats(userId);
    const achievement = stats.achievements.find(a => a.achievementId === achievementId);
    
    if (achievement) {
      achievement.isNew = false;
      await this.saveUserStats(stats);
    }
  }
}

export const achievementService = new AchievementService();

