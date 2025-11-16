import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { getProgressToNextRank } from '../../types/gamification';
import { motion } from 'framer-motion';
import { TrendingUp, Award } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ProgressTrackerProps {
  totalPoints: number;
  className?: string;
  showDetails?: boolean;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  totalPoints,
  className,
  showDetails = true
}) => {
  const { current, next, progress } = getProgressToNextRank(totalPoints);

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        {/* Current Rank */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="text-4xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {current.icon}
            </motion.div>
            <div>
              <h3 className="font-bold text-xl">{current.name}</h3>
              <p className="text-sm text-muted-foreground">Rank Atual</p>
            </div>
          </div>

          <Badge className="gap-1 text-base px-3 py-1">
            <Award className="w-4 h-4" />
            {totalPoints.toLocaleString()} pts
          </Badge>
        </div>

        {/* Progress to Next Rank */}
        {next && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>Progresso para</span>
                  <span className="font-semibold">{next.name}</span>
                  <span className="text-xl">{next.icon}</span>
                </div>
                <span className="font-semibold">{Math.round(progress)}%</span>
              </div>

              <div className="relative">
                <Progress value={progress} className="h-3" />
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 h-4 w-1 bg-white dark:bg-slate-900 rounded-full shadow-lg"
                  style={{ left: `${progress}%` }}
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{current.minPoints} pts</span>
                <span>{next.minPoints} pts</span>
              </div>
            </div>

            {showDetails && (
              <div className="pt-3 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-muted-foreground">
                    Faltam <strong className="text-foreground">{next.minPoints - totalPoints}</strong> pontos para {next.name}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {!next && (
          <div className="text-center py-4">
            <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              🎉 Rank Máximo Alcançado! 🎉
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Você é um Mestre!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProgressTracker;

