// components/dashboard/StatCard.tsx
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'increase' | 'decrease';
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, changeType, subtitle }) => {
  const isIncrease = changeType === 'increase';
  const changeColor = isIncrease ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg border border-slate-200 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 truncate">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className="w-12 h-12 bg-blue-50 text-blue-600 p-3 rounded-lg border-2 border-blue-200 flex items-center justify-center">
            {icon}
        </div>
      </div>
      <div className="mt-2 flex items-center text-sm">
        {change && (
            <div className={`flex items-center font-semibold ${changeColor}`}>
                {isIncrease ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{change}</span>
                 <span className="text-slate-600 font-normal ml-1.5">vs. mês anterior</span>
            </div>
        )}
        {!change && subtitle && (
            <p className="text-slate-600">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;