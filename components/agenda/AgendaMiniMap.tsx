import React, { useRef, useEffect, useState } from 'react';
import { EnrichedAppointment } from '../../types';
import isSameDay from 'date-fns/isSameDay';
import addDays from 'date-fns/addDays';
import startOfWeek from 'date-fns/startOfWeek';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';

interface AgendaMiniMapProps {
  currentDate: Date;
  appointments: EnrichedAppointment[];
  onTimeClick: (hour: number) => void;
  currentScrollPosition: number; // 0-1, percentage of scroll
  className?: string;
}

const START_HOUR = 7;
const END_HOUR = 21;

const AgendaMiniMap: React.FC<AgendaMiniMapProps> = ({
  currentDate,
  appointments,
  onTimeClick,
  currentScrollPosition,
  className
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));
  
  // Calcular densidade por hora
  const getHourDensity = (day: Date, hour: number) => {
    const dayApps = appointments.filter(app => isSameDay(app.startTime, day));
    const hourApps = dayApps.filter(app => {
      const appHour = app.startTime.getHours();
      return appHour === hour || (appHour < hour && app.endTime.getHours() > hour);
    });
    return hourApps.length;
  };

  // Gerar heat map
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  const getDensityColor = (density: number) => {
    if (density === 0) return 'bg-slate-100';
    if (density === 1) return 'bg-blue-200';
    if (density === 2) return 'bg-blue-400';
    return 'bg-blue-600';
  };

  if (isCollapsed) {
    return (
      <div className={cn("bg-white border border-slate-200 rounded-lg p-2 shadow-sm", className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="w-full h-8 p-0"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("bg-white border border-slate-200 rounded-lg p-3 shadow-md", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-700">Mini-Mapa</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(true)}
          className="h-6 w-6 p-0"
        >
          <EyeOff className="w-3 h-3" />
        </Button>
      </div>

      {/* Heat Map Grid */}
      <div className="space-y-1.5">
        {hours.map(hour => (
          <div key={hour} className="flex items-center gap-1">
            {/* Hour label */}
            <div className="text-[9px] font-mono text-slate-500 w-7 text-right">
              {String(hour).padStart(2, '0')}:00
            </div>
            
            {/* Days heat map */}
            <div className="flex-1 flex gap-0.5">
              {weekDays.map(day => {
                const density = getHourDensity(day, hour);
                return (
                  <button
                    key={`${day.toISOString()}-${hour}`}
                    className={cn(
                      "flex-1 h-3 rounded-sm transition-all duration-200 hover:ring-1 hover:ring-blue-400",
                      getDensityColor(density)
                    )}
                    onClick={() => onTimeClick(hour)}
                    title={`${format(day, 'EEE', { locale: ptBR })} ${hour}:00 - ${density} agendamento${density !== 1 ? 's' : ''}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Viewport Indicator */}
      <div 
        className="absolute right-1 w-1 bg-red-500 rounded-full transition-all duration-200 pointer-events-none"
        style={{
          top: `${40 + (currentScrollPosition * (hours.length * 18))}px`,
          height: '20px'
        }}
      />

      {/* Legend */}
      <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-slate-100 rounded-sm" />
          <span>Vazio</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-200 rounded-sm" />
          <span>1</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-400 rounded-sm" />
          <span>2</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-600 rounded-sm" />
          <span>3+</span>
        </div>
      </div>
    </div>
  );
};

export default AgendaMiniMap;


