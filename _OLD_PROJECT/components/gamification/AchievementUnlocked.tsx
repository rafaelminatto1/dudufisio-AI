import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Star } from 'lucide-react';
import { Achievement } from '../../types/gamification';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface AchievementUnlockedProps {
  achievement: Achievement | null;
  onClose: () => void;
  autoClose?: number; // ms
}

const AchievementUnlocked: React.FC<AchievementUnlockedProps> = ({
  achievement,
  onClose,
  autoClose = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);

      if (autoClose) {
        const timeout = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 500);
        }, autoClose);

        return () => clearTimeout(timeout);
      }
    }
  }, [achievement, autoClose, onClose]);

  if (!achievement) return null;

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 500);
          }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', duration: 0.7 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="relative overflow-hidden max-w-md">
              {/* Background gradient */}
              <div className={cn(
                "absolute inset-0 opacity-10 bg-gradient-to-br",
                rarityColors[achievement.rarity]
              )} />

              {/* Confetti effect */}
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 30 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    initial={{
                      x: '50%',
                      y: '50%',
                      scale: 0
                    }}
                    animate={{
                      x: `${Math.random() * 100}%`,
                      y: `${Math.random() * 100}%`,
                      scale: [0, 1, 0],
                      rotate: Math.random() * 360
                    }}
                    transition={{
                      duration: 1 + Math.random(),
                      delay: Math.random() * 0.3
                    }}
                  />
                ))}
              </div>

              <div className="relative p-8 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 500);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>

                {/* Trophy icon */}
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4"
                >
                  <div className={cn(
                    "w-24 h-24 mx-auto rounded-full bg-gradient-to-br flex items-center justify-center",
                    rarityColors[achievement.rarity]
                  )}>
                    <span className="text-5xl">{achievement.icon}</span>
                  </div>
                </motion.div>

                {/* Achievement unlocked text */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-sm text-muted-foreground mb-2">Conquista Desbloqueada!</p>
                  <h2 className="text-2xl font-bold mb-2">{achievement.name}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>
                </motion.div>

                {/* Badges and points */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center gap-2 mb-4"
                >
                  <Badge variant="secondary" className={cn("capitalize", {
                    'bg-gray-100 text-gray-800': achievement.rarity === 'common',
                    'bg-blue-100 text-blue-800': achievement.rarity === 'rare',
                    'bg-purple-100 text-purple-800': achievement.rarity === 'epic',
                    'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800': achievement.rarity === 'legendary'
                  })}>
                    {achievement.rarity}
                  </Badge>

                  <Badge className="gap-1">
                    <Star className="w-3 h-3" />
                    +{achievement.points} pontos
                  </Badge>
                </motion.div>

                {/* Sparkle animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Trophy className="w-8 h-8 mx-auto text-yellow-500" />
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementUnlocked;

