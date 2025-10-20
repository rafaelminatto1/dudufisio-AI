import React from 'react';
import { GamificationPointsBreakdown } from '../../../types';
import { BarChart3 } from 'lucide-react';

interface PointsBreakdownProps {
  items: GamificationPointsBreakdown[];
}

const palette = ['bg-blue-50 text-blue-700', 'bg-purple-50 text-purple-700', 'bg-yellow-50 text-yellow-700', 'bg-orange-50 text-orange-700'];

const PointsBreakdown: React.FC<PointsBreakdownProps> = ({ items }) => {
  if (!items.length) return null;

  const total = items.reduce((sum, item) => sum + item.points, 0) || 1;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Pontuação acumulada</h3>
        <BarChart3 className="w-5 h-5 text-blue-600" />
      </div>
      <div className="space-y-3">
        {items.map((item, index) => {
          const percentage = Math.round((item.points / total) * 100);
          const paletteClass = palette[index % palette.length];
          return (
            <div key={item.id} className="space-y-1">
              <div className="flex justify-between text-sm font-medium text-slate-600">
                <span>{item.label}</span>
                <span>{item.points} pts ({percentage}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${paletteClass}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {item.description && (
                <p className="text-xs text-slate-500">{item.description}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PointsBreakdown;
