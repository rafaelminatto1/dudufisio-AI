import React from 'react';
import { CalendarClock, Trophy } from 'lucide-react';
const ChallengeCard = ({ challenge }) => {
    const { title, description, progressPercentage, currentValue, targetValue, rewardPoints, status, expiresAt, } = challenge;
    const isCompleted = status === 'completed';
    const isExpired = status === 'expired';
    const badgeColor = isCompleted
        ? 'bg-green-100 text-green-700 border-green-200'
        : isExpired
            ? 'bg-slate-100 text-slate-500 border-slate-200'
            : 'bg-amber-100 text-amber-700 border-amber-200';
    const statusLabel = isCompleted
        ? 'Concluído'
        : isExpired
            ? 'Expirado'
            : 'Em andamento';
    return (<div className={`p-5 rounded-2xl border shadow-sm flex flex-col gap-3 ${isCompleted ? 'border-green-200 bg-green-50/60' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold text-slate-800">{title}</h4>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${badgeColor}`}>{statusLabel}</span>
      </div>

      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{currentValue} / {targetValue}</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 rounded-full">
          <div className={`h-2.5 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-amber-400'}`} style={{ width: `${Math.min(100, progressPercentage)}%` }}/>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <div className="flex items-center gap-2 font-medium text-indigo-600">
          <Trophy className="w-4 h-4"/>
          +{rewardPoints} pts
        </div>
        {expiresAt && !isCompleted && !isExpired && (<div className="flex items-center gap-1 text-xs text-slate-500">
            <CalendarClock className="w-4 h-4"/>
            expira em {expiresAt.toLocaleDateString('pt-BR')}
          </div>)}
      </div>
    </div>);
};
export default ChallengeCard;
