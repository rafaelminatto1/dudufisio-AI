/**
 * useGamification Hook
 * Hook principal para gerenciar gamificação
 */

import { useState, useEffect, useCallback } from 'react';
import { Achievement, UserStats, UserAchievement } from '../types/gamification';
import { achievementService } from '../services/achievementService';
import { leaderboardService } from '../services/leaderboardService';

export const useGamification = (userId: string) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userStats, allAchievements] = await Promise.all([
        achievementService.getUserStats(userId),
        achievementService.getAllAchievements()
      ]);

      setStats(userStats);
      setAchievements(allAchievements);
    } catch (error) {
      console.error('Failed to load gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndUnlock = useCallback(async (metrics: Record<string, number>) => {
    if (!userId) return;

    const unlocked = await achievementService.checkAchievements(userId, metrics);
    
    if (unlocked.length > 0) {
      // Show first unlocked achievement
      setNewAchievement(unlocked[0]);
      
      // Reload stats
      await loadData();
    }
  }, [userId]);

  const addPoints = useCallback(async (points: number, reason: string) => {
    if (!userId) return;

    const updated = await achievementService.addPoints(userId, points, reason);
    setStats(updated);
  }, [userId]);

  const updateStreak = useCallback(async (type: UserStats['streaks'][0]['type'], increment: boolean = true) => {
    if (!userId) return;

    await achievementService.updateStreak(userId, type, increment);
    await loadData();
  }, [userId]);

  const dismissNewAchievement = useCallback(() => {
    if (newAchievement) {
      achievementService.markAchievementAsSeen(userId, newAchievement.id);
    }
    setNewAchievement(null);
  }, [userId, newAchievement]);

  const getAchievementProgress = useCallback((achievementId: string, currentMetrics: Record<string, number>): number => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return 0;

    const value = currentMetrics[achievement.criteria.metric] || 0;
    return Math.min(100, (value / achievement.criteria.target) * 100);
  }, [achievements]);

  return {
    stats,
    achievements,
    loading,
    newAchievement,
    checkAndUnlock,
    addPoints,
    updateStreak,
    dismissNewAchievement,
    getAchievementProgress,
    refresh: loadData
  };
};
