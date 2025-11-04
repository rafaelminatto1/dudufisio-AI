// components/analytics/MetricCard.tsx
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-start justify-between border border-slate-200">
        <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
         <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            {icon}
        </div>
    </div>
  );
};

export default MetricCard;
