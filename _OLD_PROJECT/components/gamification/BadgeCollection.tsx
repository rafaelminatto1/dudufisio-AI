import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Achievement, UserAchievement } from '../../types/gamification';
import { motion } from 'framer-motion';
import { Lock, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';

interface BadgeCollectionProps {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  className?: string;
}

const BadgeCollection: React.FC<BadgeCollectionProps> = ({
  achievements,
  userAchievements,
  className
}) => {
  const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500'
  };

  const rarityBorderColors = {
    common: 'border-gray-300',
    rare: 'border-blue-300',
    epic: 'border-purple-300',
    legendary: 'border-yellow-300'
  };

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4", className)}>
      {achievements.map((achievement, index) => {
        const isUnlocked = unlockedIds.has(achievement.id);
        const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);

        return (
          <HoverCard key={achievement.id}>
            <HoverCardTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={cn(
                    "p-4 text-center cursor-pointer transition-all hover:scale-105 border-2",
                    isUnlocked ? rarityBorderColors[achievement.rarity] : "border-slate-200 opacity-50 grayscale"
                  )}
                >
                  <div className="relative mb-3">
                    {isUnlocked ? (
                      <div className={cn(
                        "w-16 h-16 mx-auto rounded-full bg-gradient-to-br flex items-center justify-center",
                        rarityColors[achievement.rarity]
                      )}>
                        <span className="text-3xl">{achievement.icon}</span>
                      </div>
                    ) : (
                      <div className="w-16 h-16 mx-auto rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-slate-400" />
                      </div>
                    )}

                    {isUnlocked && userAchievement?.isNew && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <span className="text-white text-xs font-bold">!</span>
                      </motion.div>
                    )}
                  </div>

                  <h4 className={cn(
                    "font-semibold text-sm mb-1",
                    !isUnlocked && "text-slate-400"
                  )}>
                    {isUnlocked ? achievement.name : '???'}
                  </h4>

                  <Badge variant="outline" className={cn(
                    "text-xs capitalize",
                    !isUnlocked && "opacity-50"
                  )}>
                    {achievement.rarity}
                  </Badge>

                  {isUnlocked && (
                    <div className="mt-2 text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {achievement.points}
                    </div>
                  )}
                </Card>
              </motion.div>
            </HoverCardTrigger>

            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{isUnlocked ? achievement.icon : '🔒'}</span>
                  <h4 className="font-semibold">{isUnlocked ? achievement.name : 'Bloqueado'}</h4>
                </div>

                {isUnlocked ? (
                  <>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold">{achievement.points} pontos</span>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {achievement.category}
                      </Badge>
                    </div>

                    {userAchievement && (
                      <p className="text-xs text-muted-foreground">
                        Desbloqueado em {new Date(userAchievement.unlockedAt).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Complete os requisitos para desbloquear esta conquista
                  </p>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>
        );
      })}
    </div>
  );
};

export default BadgeCollection;

