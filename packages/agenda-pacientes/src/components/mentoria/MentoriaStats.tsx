// components/mentoria/MentoriaStats.tsx
import React from 'react';
import { Users, BookOpenCheck, Star } from 'lucide-react';

interface MentoriaStatsProps {
    activeInterns: number;
    totalCases: number;
    avgGrade: number;
}

const StatCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg border border-slate-200 transition-all duration-200">
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4">{icon}</div>
        <div>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          <p className="text-sm font-medium text-slate-600">{title}</p>
        </div>
      </div>
    </div>
);

const MentoriaStats: React.FC<MentoriaStatsProps> = ({ activeInterns, totalCases, avgGrade }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Estagiários Ativos" value={activeInterns.toString()} icon={<Users />} />
            <StatCard title="Casos Clínicos" value={totalCases.toString()} icon={<BookOpenCheck />} />
            <StatCard title="Média de Avaliações" value={avgGrade.toFixed(1)} icon={<Star />} />
        </div>
    );
};

export default MentoriaStats;
