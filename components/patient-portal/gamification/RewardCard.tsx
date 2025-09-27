import React from 'react';
import { Gift, CheckCircle } from 'lucide-react';
import { GamificationReward } from '../../../types';

interface RewardCardProps {
  reward: GamificationReward;
}

const RewardCard: React.FC<RewardCardProps> = ({ reward }) => {
  const { title, description, pointsRequired, unlocked, claimed } = reward;

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 ${claimed ? 'border-green-200 bg-green-50/80' : unlocked ? 'border-teal-200 bg-teal-50/80' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`rounded-full p-3 ${unlocked ? 'bg-teal-100 text-teal-600' : 'bg-slate-200 text-slate-500'}`}>
          <Gift className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-slate-800">{title}</h4>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">{pointsRequired} pts</span>
        {claimed ? (
          <span className="inline-flex items-center text-xs text-green-600 font-semibold">
            <CheckCircle className="w-4 h-4 mr-1" /> Resgatado
          </span>
        ) : unlocked ? (
          <span className="text-xs font-semibold text-teal-600">Disponível para resgate</span>
        ) : (
          <span className="text-xs text-slate-500">Acumule mais pontos</span>
        )}
      </div>
    </div>
  );
};

export default RewardCard;
