import React from 'react';
import { BarChart3 } from 'lucide-react';
const palette = ['bg-teal-100 text-teal-700', 'bg-indigo-100 text-indigo-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700'];
const PointsBreakdown = ({ items }) => {
    if (!items.length)
        return null;
    const total = items.reduce((sum, item) => sum + item.points, 0) || 1;
    return (<div className="bg-white p-6 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Pontuação acumulada</h3>
        <BarChart3 className="w-5 h-5 text-teal-500"/>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => {
            const percentage = Math.round((item.points / total) * 100);
            const paletteClass = palette[index % palette.length];
            return (<div key={item.id} className="space-y-1">
              <div className="flex justify-between text-sm font-medium text-slate-600">
                <span>{item.label}</span>
                <span>{item.points} pts ({percentage}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full">
                <div className={`h-3 rounded-full transition-all duration-500 ${paletteClass}`} style={{ width: `${percentage}%` }}/>
              </div>
              {item.description && (<p className="text-xs text-slate-500">{item.description}</p>)}
            </div>);
        })}
      </div>
    </div>);
};
export default PointsBreakdown;
