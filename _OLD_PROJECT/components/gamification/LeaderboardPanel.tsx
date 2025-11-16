import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Leaderboard, LeaderboardEntry } from '../../types/gamification';
import { leaderboardService } from '../../services/leaderboardService';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface LeaderboardPanelProps {
  userIds: string[];
  currentUserId: string;
  category?: Leaderboard['category'];
  className?: string;
}

const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  userIds,
  currentUserId,
  category = 'points',
  className
}) => {
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [period, setPeriod] = useState<Leaderboard['period']>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [period, category]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await leaderboardService.getLeaderboard(category, period);
      
      if (!data) {
        // Generate new leaderboard
        const generated = await leaderboardService.generatePointsLeaderboard(userIds, period);
        setLeaderboard(generated);
      } else {
        setLeaderboard(data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3" />
          <div className="h-12 bg-slate-200 rounded" />
          <div className="h-12 bg-slate-200 rounded" />
          <div className="h-12 bg-slate-200 rounded" />
        </div>
      </Card>
    );
  }

  if (!leaderboard) return null;

  const userEntry = leaderboard.entries.find(e => e.userId === currentUserId);

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-lg">Ranking</h3>
        </div>

        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
          <TabsList>
            <TabsTrigger value="weekly" className="text-xs">Semanal</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">Mensal</TabsTrigger>
            <TabsTrigger value="all-time" className="text-xs">Geral</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* User's position */}
      {userEntry && (
        <Card className="p-4 mb-4 bg-blue-50 dark:bg-blue-950 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                #{userEntry.rank}
              </div>
              <div>
                <p className="font-semibold">Sua Posição</p>
                <p className="text-sm text-muted-foreground">{userEntry.score} pontos</p>
              </div>
            </div>
            {userEntry.badge && (
              <span className="text-3xl">{userEntry.badge}</span>
            )}
          </div>
        </Card>
      )}

      {/* Top rankings */}
      <div className="space-y-2">
        {leaderboard.entries.slice(0, 10).map((entry, index) => (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg transition-colors",
              entry.userId === currentUserId && "bg-blue-50 dark:bg-blue-950 border border-blue-200",
              entry.userId !== currentUserId && "hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                entry.rank === 1 && "bg-yellow-400 text-white",
                entry.rank === 2 && "bg-gray-300 text-white",
                entry.rank === 3 && "bg-orange-400 text-white",
                entry.rank > 3 && "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
              )}>
                {entry.rank}
              </div>

              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                  {entry.userName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="font-semibold text-sm">{entry.userName}</p>
                <p className="text-xs text-muted-foreground">{entry.userRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {entry.badge && (
                <span className="text-2xl">{entry.badge}</span>
              )}

              <div className="text-right">
                <p className="font-bold">{entry.score}</p>
                {entry.change !== 0 && (
                  <div className={cn(
                    "flex items-center gap-1 text-xs",
                    entry.change > 0 && "text-green-600",
                    entry.change < 0 && "text-red-600"
                  )}>
                    {entry.change > 0 && <TrendingUp className="w-3 h-3" />}
                    {entry.change < 0 && <TrendingDown className="w-3 h-3" />}
                    {entry.change === 0 && <Minus className="w-3 h-3" />}
                    {Math.abs(entry.change)}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {leaderboard.entries.length > 10 && (
        <Button variant="outline" className="w-full mt-4" size="sm">
          Ver Ranking Completo
        </Button>
      )}
    </Card>
  );
};

export default LeaderboardPanel;

