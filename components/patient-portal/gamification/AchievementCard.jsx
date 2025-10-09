// components/patient-portal/gamification/AchievementCard.tsx
import React from 'react';
import { Lock, CheckCircle } from 'lucide-react';
const AchievementCard = ({ achievement }) => {
    const { name, description, icon: Icon, unlocked, rewardPoints, progress } = achievement;
    const progressValue = progress !== undefined ? Math.min(1, Math.max(0, progress)) : undefined;
    return (<div className={`p-4 rounded-xl border-2 flex flex-col items-center text-center transition-all duration-300 ${unlocked ? 'border-teal-400 bg-teal-50 shadow-md' : 'border-slate-200 bg-slate-100'}`}>
            <div className={`relative w-20 h-20 rounded-full flex items-center justify-center mb-3 ${unlocked ? 'bg-teal-100 text-teal-500' : 'bg-slate-200 text-slate-400'}`}>
                <Icon className="w-10 h-10"/>
                {!unlocked && (<div className="absolute inset-0 bg-slate-200/60 rounded-full flex items-center justify-center">
                         <Lock className="w-6 h-6 text-slate-500"/>
                    </div>)}
                 {unlocked && (<div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                         <CheckCircle className="w-5 h-5 text-green-500 fill-white"/>
                    </div>)}
            </div>
            <h4 className={`font-bold ${unlocked ? 'text-teal-800' : 'text-slate-600'}`}>{name}</h4>
            <p className={`text-xs mt-1 ${unlocked ? 'text-teal-700' : 'text-slate-500'}`}>{description}</p>
            {rewardPoints && (<p className="text-xs font-semibold text-amber-600 mt-2">Recompensa: +{rewardPoints} pts</p>)}
            {!unlocked && progressValue !== undefined && progressValue > 0 && (<div className="w-full mt-3">
                    <div className="w-full h-2 bg-slate-300 rounded-full">
                        <div className="h-2 bg-slate-500 rounded-full" style={{ width: `${Math.min(100, Math.round(progressValue * 100))}%` }}/>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">{Math.round(progressValue * 100)}% concluído</p>
                </div>)}
        </div>);
};
export default AchievementCard;
