import React from 'react';
import { Clock } from 'lucide-react';
const RecentActivityList = ({ activities }) => {
    if (!activities.length)
        return null;
    return (<div className="bg-white p-6 rounded-2xl shadow-sm h-full">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-indigo-500"/>
        <h3 className="text-lg font-semibold text-slate-800">Atividades recentes</h3>
      </div>
      <div className="space-y-3">
        {activities.map((activity, index) => (<div key={`${activity.label}-${index}`} className="flex items-center justify-between border border-slate-200 rounded-xl px-3 py-2 text-sm">
            <div>
              <p className="font-medium text-slate-700">{activity.label}</p>
              <p className="text-xs text-slate-500">{activity.timestamp.toLocaleString('pt-BR')}</p>
            </div>
            <span className="text-xs font-semibold text-teal-600">+{activity.points} pts</span>
          </div>))}
      </div>
    </div>);
};
export default RecentActivityList;
