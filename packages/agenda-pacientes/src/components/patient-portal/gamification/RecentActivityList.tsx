import React from 'react';
import { Clock } from 'lucide-react';

interface ActivityItem {
  label: string;
  timestamp: Date;
  points: number;
}

interface RecentActivityListProps {
  activities: ActivityItem[];
}

const RecentActivityList: React.FC<RecentActivityListProps> = ({ activities }) => {
  if (!activities.length) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-900">Atividades recentes</h3>
      </div>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={`${activity.label}-${index}`} className="flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 transition-all duration-200">
            <div>
              <p className="font-medium text-slate-900">{activity.label}</p>
              <p className="text-xs text-slate-600">{activity.timestamp.toLocaleString('pt-BR')}</p>
            </div>
            <span className="text-xs font-semibold text-blue-600">+{activity.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivityList;
