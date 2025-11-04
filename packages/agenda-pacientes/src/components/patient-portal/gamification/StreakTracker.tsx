
// components/patient-portal/gamification/StreakTracker.tsx
import React from 'react';
import { Flame } from 'lucide-react';

interface StreakTrackerProps {
    streak: number;
}

const StreakTracker: React.FC<StreakTrackerProps> = ({ streak }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold text-slate-900">Sequência de Atividades</h3>
            <div className="my-2 flex items-center text-orange-600">
                <Flame className="w-12 h-12" strokeWidth={1.5} />
                <span className="text-6xl font-bold ml-2">{streak}</span>
            </div>
            <p className="text-sm text-slate-600">
                {streak > 0 ? `Dias consecutivos de atividades! Continue assim!` : 'Faça uma atividade hoje para começar!'}
            </p>
        </div>
    );
};

export default StreakTracker;