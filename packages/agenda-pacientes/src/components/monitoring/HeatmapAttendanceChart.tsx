import React from 'react';
import { CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';

export interface HeatmapData {
  dayOfWeek: string;
  hour: number;
  attendance: number; // 0-100%
  total: number;
}

interface HeatmapAttendanceChartProps {
  data: HeatmapData[];
}

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7h - 18h

export const HeatmapAttendanceChart: React.FC<HeatmapAttendanceChartProps> = ({ data }) => {
  const getColor = (attendance: number) => {
    if (attendance >= 90) return 'bg-green-600';
    if (attendance >= 75) return 'bg-green-400';
    if (attendance >= 60) return 'bg-yellow-400';
    if (attendance >= 40) return 'bg-orange-400';
    if (attendance > 0) return 'bg-red-400';
    return 'bg-slate-100';
  };

  const getCellData = (day: string, hour: number) => {
    return data.find(d => d.dayOfWeek === day && d.hour === hour);
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg">Mapa de Calor - Presença</CardTitle>
        <CardDescription>Padrões de comparecimento por dia e horário</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Grid do heatmap */}
            <div className="flex">
              {/* Coluna de horários */}
              <div className="flex flex-col">
                <div className="h-8" /> {/* Espaço para header de dias */}
                {HOURS.map(hour => (
                  <div 
                    key={hour} 
                    className="h-8 w-12 flex items-center justify-end pr-2 text-xs text-slate-600"
                  >
                    {hour}h
                  </div>
                ))}
              </div>

              {/* Grid principal */}
              <div className="flex-1">
                {/* Header de dias */}
                <div className="flex h-8">
                  {DAYS.map(day => (
                    <div 
                      key={day} 
                      className="flex-1 flex items-center justify-center text-xs font-medium text-slate-700"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Células do heatmap */}
                {HOURS.map(hour => (
                  <div key={hour} className="flex h-8 gap-1">
                    {DAYS.map(day => {
                      const cellData = getCellData(day, hour);
                      const attendance = cellData?.attendance || 0;
                      const total = cellData?.total || 0;

                      return (
                        <div
                          key={`${day}-${hour}`}
                          className={`flex-1 ${getColor(attendance)} rounded transition-all hover:scale-105 hover:shadow-md cursor-pointer group relative`}
                          title={`${day} ${hour}h: ${attendance.toFixed(0)}% (${total} sessões)`}
                        >
                          {/* Tooltip on hover */}
                          <div className="opacity-0 group-hover:opacity-100 absolute z-10 -top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs p-2 rounded shadow-lg whitespace-nowrap pointer-events-none transition-opacity">
                            <p className="font-semibold">{day} às {hour}h</p>
                            <p>Presença: {attendance.toFixed(0)}%</p>
                            <p>{total} sessões</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legenda */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs">
              <span className="text-slate-600">Taxa de presença:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded" />
                <span>90%+</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-400 rounded" />
                <span>75-90%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded" />
                <span>60-75%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-400 rounded" />
                <span>40-60%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-400 rounded" />
                <span>&lt;40%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-100 rounded border border-slate-300" />
                <span>Sem dados</span>
              </div>
            </div>

            {/* Insights */}
            <div className="mt-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
              <p className="font-medium text-slate-900 mb-1">💡 Insights</p>
              <p>Identifique os melhores horários para agendar sessões e evitar períodos com alta taxa de faltas.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
};

