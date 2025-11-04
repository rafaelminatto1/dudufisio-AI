import React from 'react';
import { Gift, CheckCircle } from 'lucide-react';
import { GamificationReward } from '../../../types';

interface RewardCardProps {
  reward: GamificationReward;
}

const RewardCard: React.FC<RewardCardProps> = ({ reward }) => {
  const { title, description, pointsRequired, unlocked, claimed } = reward;

  return (
    <div className={`p-5 rounded-lg border shadow-md hover:shadow-lg transition-all duration-200 ${claimed ? 'border-green-200 bg-green-50' : unlocked ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${unlocked ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-300'}`}>
          <Gift className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-slate-900">{title}</h4>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">{pointsRequired} pts</span>
        {claimed ? (
          <span className="inline-flex items-center text-xs text-green-700 font-semibold">
            <CheckCircle className="w-4 h-4 mr-1" /> Resgatado
          </span>
        ) : unlocked ? (
          <span className="text-xs font-semibold text-blue-700">Disponível para resgate</span>
        ) : (
          <span className="text-xs text-slate-500">Acumule mais pontos</span>
        )}
      </div>
    </div>
  );
};

export default RewardCard;
