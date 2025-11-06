/**
 * Leaderboard Service
 * Gerencia rankings e competições
 */

import { Leaderboard, LeaderboardEntry, UserStats } from '../types/gamification';
import { achievementService } from './achievementService';
import { indexedDB } from '../lib/indexedDB';

class LeaderboardService {
  private readonly LEADERBOARDS_KEY = 'leaderboards';

  /**
   * Gera leaderboard de pontos
   */
  async generatePointsLeaderboard(
    userIds: string[],
    period: Leaderboard['period'] = 'all-time'
  ): Promise<Leaderboard> {
    const entries: LeaderboardEntry[] = [];

    for (const userId of userIds) {
      const stats = await achievementService.getUserStats(userId);
      
      entries.push({
        rank: 0, // Will be calculated below
        userId: stats.userId,
        userName: `User ${userId}`, // Should fetch from user service
        userRole: 'Therapist', // Should fetch from user service
        score: stats.totalPoints,
        change: 0 // Would need historical data
      });
    }

    // Sort by score and assign ranks
    entries.sort((a, b) => b.score - a.score);
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
      
      // Assign badges to top 3
      if (entry.rank === 1) entry.badge = '🥇';
      else if (entry.rank === 2) entry.badge = '🥈';
      else if (entry.rank === 3) entry.badge = '🥉';
    });

    const leaderboard: Leaderboard = {
      id: `points-${period}-${Date.now()}`,
      name: `Ranking de Pontos - ${period}`,
      period,
      category: 'points',
      entries,
      updatedAt: new Date()
    };

    await this.saveLeaderboard(leaderboard);

    return leaderboard;
  }

  /**
   * Gera leaderboard customizado
   */
  async generateCustomLeaderboard(
    name: string,
    category: Leaderboard['category'],
    entries: Omit<LeaderboardEntry, 'rank' | 'badge'>[],
    period: Leaderboard['period'] = 'monthly'
  ): Promise<Leaderboard> {
    // Sort and assign ranks
    const sortedEntries = entries.sort((a, b) => b.score - a.score);
    const rankedEntries: LeaderboardEntry[] = sortedEntries.map((entry, index) => {
      const ranked: LeaderboardEntry = {
        ...entry,
        rank: index + 1
      };

      if (ranked.rank === 1) ranked.badge = '🥇';
      else if (ranked.rank === 2) ranked.badge = '🥈';
      else if (ranked.rank === 3) ranked.badge = '🥉';

      return ranked;
    });

    const leaderboard: Leaderboard = {
      id: `custom-${category}-${Date.now()}`,
      name,
      period,
      category,
      entries: rankedEntries,
      updatedAt: new Date()
    };

    await this.saveLeaderboard(leaderboard);

    return leaderboard;
  }

  /**
   * Salva leaderboard
   */
  private async saveLeaderboard(leaderboard: Leaderboard): Promise<void> {
    const stored = await indexedDB.get('settings', this.LEADERBOARDS_KEY);
    const leaderboards = stored?.value || [];

    // Keep only last 10 of each category
    const filtered = leaderboards.filter(
      (l: Leaderboard) =>
        !(l.category === leaderboard.category && l.period === leaderboard.period)
    );

    filtered.push(leaderboard);

    await indexedDB.set('settings', {
      key: this.LEADERBOARDS_KEY,
      value: filtered.slice(-10),
      updatedAt: new Date()
    });
  }

  /**
   * Retorna leaderboard por categoria e período
   */
  async getLeaderboard(
    category: Leaderboard['category'],
    period: Leaderboard['period']
  ): Promise<Leaderboard | null> {
    const stored = await indexedDB.get('settings', this.LEADERBOARDS_KEY);
    if (!stored?.value) return null;

    const leaderboards: Leaderboard[] = stored.value;
    
    return leaderboards
      .filter(l => l.category === category && l.period === period)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0] || null;
  }

  /**
   * Retorna todas as leaderboards
   */
  async getAllLeaderboards(): Promise<Leaderboard[]> {
    const stored = await indexedDB.get('settings', this.LEADERBOARDS_KEY);
    return stored?.value || [];
  }

  /**
   * Calcula posição de um usuário em um leaderboard
   */
  getUserRank(leaderboard: Leaderboard, userId: string): LeaderboardEntry | null {
    return leaderboard.entries.find(e => e.userId === userId) || null;
  }
}

export const leaderboardService = new LeaderboardService();

