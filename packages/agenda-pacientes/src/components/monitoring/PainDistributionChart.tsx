import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { PainDistributionData } from '../../types';

interface PainDistributionChartProps {
  data: PainDistributionData[];
  onBarClick?: (category: 'none' | 'low' | 'moderate' | 'severe') => void;
}

export const PainDistributionChart: React.FC<PainDistributionChartProps> = ({ 
  data, 
  onBarClick 
}) => {
  const handleBarClick = (data: any) => {
    if (onBarClick && data && data.category) {
      onBarClick(data.category);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900 mb-2">{data.label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-slate-700">
              <span className="font-medium">Pacientes:</span> {data.count}
            </p>
            <p className="text-slate-700">
              <span className="font-medium">Percentual:</span> {data.percentage}%
            </p>
          </div>
          {onBarClick && (
            <p className="text-xs text-slate-500 mt-2 italic">
              Clique para filtrar
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg">Distribuição de Dor</CardTitle>
        <CardDescription>Níveis de dor reportados pelos pacientes</CardDescription>
      </CardHeader>
      
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={data} 
            layout="vertical"
            margin={{ top: 5, right: 30, bottom: 5, left: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis 
              type="number"
              className="text-xs"
              stroke="#64748b"
            />
            <YAxis 
              type="category"
              dataKey="label" 
              className="text-xs"
              stroke="#64748b"
              width={90}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              radius={[0, 8, 8, 0]}
              cursor={onBarClick ? 'pointer' : 'default'}
              onClick={handleBarClick}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {data.map((item) => (
            <div 
              key={item.category} 
              className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg"
            >
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-700 truncate">{item.label}</span>
              <span className="ml-auto font-semibold text-slate-900">{item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </>
  );
};

