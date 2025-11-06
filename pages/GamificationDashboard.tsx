import React, { useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useData } from '../contexts/AppContext';
import { useGamification } from '../hooks/useGamification';
import BadgeCollection from '../components/gamification/BadgeCollection';
import ProgressTracker from '../components/gamification/ProgressTracker';
import LeaderboardPanel from '../components/gamification/LeaderboardPanel';
import AchievementUnlocked from '../components/gamification/AchievementUnlocked';
import { Trophy, Target, Flame, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '../components/ui/badge';

const GamificationDashboard: React.FC = () => {
  const { user } = useSupabaseAuth();
  const { therapists, patients } = useData();
  const {
    stats,
    achievements,
    loading,
    newAchievement,
    dismissNewAchievement,
    refresh
  } = useGamification(user?.id || 'demo-user');

  useEffect(() => {
    // Initialize achievements on mount
    const init = async () => {
      const { achievementService } = await import('../services/achievementService');
      await achievementService.initializeAchievements();
      refresh();
    };
    init();
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-xl space-y-xl">
        <div className="animate-pulse space-y-md">
          <div className="h-12 bg-neutral-bgDark rounded w-1/3" />
          <div className="grid grid-cols-4 gap-md">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-neutral-bgDark rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const longestStreak = stats.streaks.reduce((max, s) => Math.max(max, s.longest), 0);
  const currentStreaks = stats.streaks.filter(s => s.current > 0);

  // Get all user IDs for leaderboard
  const allUserIds = [
    ...therapists.map(t => t.id),
    ...patients.map(p => p.id),
    user?.id || ''
  ].filter(Boolean);

  return (
    <div className="p-lg space-y-xl max-w-7xl mx-auto">
      {/* Achievement Unlock Notification */}
      <AchievementUnlocked
        achievement={newAchievement}
        onClose={dismissNewAchievement}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-sm">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Gamificação
          </h1>
          <p className="text-neutral-textSecondary">Conquistas, ranking e progresso</p>
        </div>

        <ProgressTracker totalPoints={stats.totalPoints} showDetails={false} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-md">
            <div className="flex items-center justify-between mb-sm">
              <Trophy className="w-5 h-5 text-warning" />
              <Badge variant="secondary">Pontos</Badge>
            </div>
            <p className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</p>
            <p className="text-xs text-neutral-textSecondary">Total acumulado</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-md">
            <div className="flex items-center justify-between mb-sm">
              <Target className="w-5 h-5 text-primary" />
              <Badge variant="secondary">Conquistas</Badge>
            </div>
            <p className="text-2xl font-bold">{stats.achievements.length}/{achievements.length}</p>
            <p className="text-xs text-neutral-textSecondary">
              {Math.round((stats.achievements.length / achievements.length) * 100)}% completo
            </p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-md">
            <div className="flex items-center justify-between mb-sm">
              <Flame className="w-5 h-5 text-warning" />
              <Badge variant="secondary">Streak</Badge>
            </div>
            <p className="text-2xl font-bold text-warning">{longestStreak}</p>
            <p className="text-xs text-neutral-textSecondary">Sequência máxima</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-md">
            <div className="flex items-center justify-between mb-sm">
              <TrendingUp className="w-5 h-5 text-success" />
              <Badge variant="secondary">Rank</Badge>
            </div>
            <p className="text-2xl font-bold">{stats.rank}</p>
            <p className="text-xs text-neutral-textSecondary">Nível {stats.level}</p>
          </Card>
        </motion.div>
      </div>

      {/* Progress to Next Rank */}
      <ProgressTracker totalPoints={stats.totalPoints} />

      {/* Active Streaks */}
      {currentStreaks.length > 0 && (
        <Card className="p-lg">
          <h3 className="font-semibold text-lg mb-md flex items-center gap-sm">
            <Flame className="w-5 h-5 text-orange-500" />
            Sequências Ativas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {currentStreaks.map((streak, index) => (
              <motion.div
                key={streak.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-md bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-warning">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold capitalize">
                        {streak.type.replace(/-/g, ' ')}
                      </p>
                      <p className="text-xs text-neutral-textSecondary">
                        Máximo: {streak.longest} {streak.longest === 1 ? 'dia' : 'dias'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-warning">{streak.current}</p>
                      <p className="text-xs text-neutral-textSecondary">
                        {streak.current === 1 ? 'dia' : 'dias'}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="achievements" className="space-y-md">
        <TabsList>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements">
          <BadgeCollection
            achievements={achievements}
            userAchievements={stats.achievements}
          />
        </TabsContent>

        <TabsContent value="leaderboard">
          <LeaderboardPanel
            userIds={allUserIds}
            currentUserId={user?.id || 'demo-user'}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamificationDashboard;

