import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Achievement } from '../../services/gamificationService';
import { Lock, CheckCircle2 } from 'lucide-react';

interface AchievementCardProps {
  achievement: Achievement;
  onClick?: () => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onClick }) => {
  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getRarityLabel = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'Comum';
      case 'rare': return 'Raro';
      case 'epic': return 'Épico';
      case 'legendary': return 'Lendário';
      default: return rarity;
    }
  };

  const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 ${
        achievement.isUnlocked 
          ? 'hover:shadow-lg cursor-pointer border-2' 
          : 'opacity-60 hover:opacity-80'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Rarity Badge */}
        <div className="absolute top-2 right-2">
          <Badge className={`${getRarityColor(achievement.rarity)} border text-xs`}>
            {getRarityLabel(achievement.rarity)}
          </Badge>
        </div>

        {/* Icon */}
        <div className="flex items-center gap-4 mb-3">
          <div className={`text-4xl ${achievement.isUnlocked ? '' : 'grayscale opacity-50'}`}>
            {achievement.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              {achievement.name}
              {achievement.isUnlocked && (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
              {!achievement.isUnlocked && (
                <Lock className="w-4 h-4 text-slate-400" />
              )}
            </h3>
            <p className="text-sm text-slate-600 mt-1">{achievement.description}</p>
          </div>
        </div>

        {/* Progress Bar */}
        {!achievement.isUnlocked && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Progresso</span>
              <span>{achievement.progress}/{achievement.maxProgress}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Points */}
        <div className="mt-3 flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            <span className="text-yellow-600 mr-1">⭐</span>
            {achievement.points} pontos
          </Badge>
          {achievement.isUnlocked && achievement.unlockedAt && (
            <span className="text-xs text-slate-500">
              Desbloqueado em {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementCard;
