
// components/patient-portal/gamification/LevelProgress.tsx
import React from 'react';
import { Award } from 'lucide-react';

interface LevelProgressProps {
    level: number;
    pointsTowardsLevel: number;
    xpForNextLevel: number;
    totalPoints: number;
}

const LevelProgress: React.FC<LevelProgressProps> = ({ level, pointsTowardsLevel, xpForNextLevel, totalPoints }) => {
    const progressPercentage = Math.min(100, (pointsTowardsLevel / xpForNextLevel) * 100);
    const remaining = Math.max(0, xpForNextLevel - pointsTowardsLevel);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 flex items-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-blue-200 mr-4">
                <Award className="w-8 h-8" />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-lg font-bold text-slate-900">Nível {level}</h3>
                    <p className="text-sm font-medium text-slate-600">{pointsTowardsLevel} / {xpForNextLevel} XP</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4">
                    <div
                        className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-600">
                    <span>Total acumulado: {totalPoints} pts</span>
                    <span>Faltam {remaining} XP para o próximo nível</span>
                </div>
            </div>
        </div>
    );
};

export default LevelProgress;
