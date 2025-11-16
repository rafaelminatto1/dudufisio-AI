import React, { useState } from 'react';
import format from 'date-fns/format';
import isSameDay from 'date-fns/isSameDay';
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import isToday from 'date-fns/isToday';
import startOfWeek from 'date-fns/startOfWeek';
import endOfWeek from 'date-fns/endOfWeek';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { EnrichedAppointment, Therapist, AppointmentStatus } from '../../types';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import Tooltip from '../ui/tooltip';

interface MonthlyViewProps {
  currentDate: Date;
  appointments: EnrichedAppointment[];
  therapists: Therapist[];
  onDateClick: (date: Date) => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onAppointmentClick?: (appointment: EnrichedAppointment) => void;
  colorMode?: import('../../types').ColorDisplayMode;
}

const MonthlyView: React.FC<MonthlyViewProps> = ({
  currentDate,
  appointments,
  therapists: _therapists,
  onDateClick,
  onPrevMonth,
  onNextMonth,
  onAppointmentClick
}) => {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(app => isSameDay(app.startTime, date));
  };

  const getDayStats = (date: Date) => {
    const dayApps = getAppointmentsForDay(date);
    const hasConflicts = dayApps.some(app => app.hasConflict);
    const completed = dayApps.filter(app => app.status === AppointmentStatus.Completed).length;
    const total = dayApps.length;
    const paid = dayApps.filter(app => app.paymentStatus === 'paid').length;
    
    // Densidade baseada em quantidade de agendamentos
    let density: 'low' | 'medium' | 'high' = 'low';
    if (total >= 8) density = 'high';
    else if (total >= 4) density = 'medium';

    return { total, hasConflicts, completed, paid, density };
  };

  // Função para obter cor do heat map baseada na densidade
  const getHeatMapColor = (density: 'low' | 'medium' | 'high', isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return 'bg-slate-50';
    
    switch (density) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-green-50 border-green-200';
      default: return 'bg-white';
    }
  };

  const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
        </h2>
        <div className="flex items-center gap-2">
          {onPrevMonth && (
            <button
              onClick={onPrevMonth}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <button
            onClick={() => onDateClick(new Date())}
            className="px-4 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Hoje
          </button>
          {onNextMonth && (
            <button
              onClick={onNextMonth}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>

      <Card className="flex-1">
        <CardContent className="p-0">
          <div className="grid grid-cols-7">
            {weekdays.map(day => (
              <div key={day} className="p-4 text-center font-semibold text-slate-600 border-b">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5 sm:gap-1" style={{ minHeight: '600px' }}>
            {calendarDays.map((date) => {
              const dayAppointments = getAppointmentsForDay(date);
              const isCurrentMonth = date >= monthStart && date <= monthEnd;
              const isCurrentDay = isToday(date);
              const stats = getDayStats(date);
              const isHovered = hoveredDate && isSameDay(hoveredDate, date);

              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    "p-1 sm:p-2 border cursor-pointer transition-all duration-200 min-h-[80px] sm:min-h-[120px] hover:shadow-lg",
                    !isCurrentMonth && "text-slate-400 bg-slate-50/50",
                    isCurrentDay && "ring-2 ring-blue-500 bg-blue-50 border-blue-300",
                    isHovered && "scale-[1.02] z-10",
                    stats.hasConflicts && "ring-2 ring-red-400",
                    // Heat map baseado na densidade
                    isCurrentMonth && !isCurrentDay && getHeatMapColor(stats.density, isCurrentMonth)
                  )}
                  onClick={() => onDateClick(date)}
                  onMouseEnter={() => setHoveredDate(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold",
                      isCurrentDay && "bg-sky-500 text-white",
                      !isCurrentDay && isCurrentMonth && "text-slate-900",
                      !isCurrentMonth && "text-slate-400"
                    )}>
                      {format(date, 'd')}
                    </div>
                    
                    {/* Badge de contagem */}
                    {stats.total > 0 && (
                      <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs h-5 px-1.5",
                        stats.hasConflicts && "bg-red-100 text-red-700 border-red-200"
                      )}
                    >
                        {stats.total}
                      </Badge>
                    )}
                  </div>

                  {/* Indicadores */}
                  {stats.hasConflicts && (
                    <div className="flex items-center gap-1 mb-1">
                      <AlertCircle className="w-3 h-3 text-red-600" />
                      <span className="text-xs text-red-600 font-medium">Conflito</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map((appointment) => (
                      <Tooltip
                        key={appointment.id}
                        content={`${appointment.patientName} - ${format(appointment.startTime, 'HH:mm')}${appointment.therapistName ? ` (${appointment.therapistName})` : ''}`}
                        side="top"
                        delayDuration={200}
                      >
                        <div
                          className={cn(
                            "text-xs p-1.5 rounded-md text-white cursor-pointer hover:opacity-80 transition-all duration-200 min-w-0 border border-white/20 shadow-sm",
                            `bg-${appointment.therapistColor}-500 hover:bg-${appointment.therapistColor}-600`
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick?.(appointment);
                          }}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <div className="truncate font-medium">
                              {format(appointment.startTime, 'HH:mm')} {appointment.patientName.split(' ').slice(0, 2).join(' ')}
                            </div>
                            {appointment.paymentStatus === 'paid' && (
                              <CheckCircle className="w-3 h-3 text-green-200 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      </Tooltip>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-slate-500 font-medium bg-slate-100 rounded-md px-2 py-1 text-center">
                        +{dayAppointments.length - 3} mais
                      </div>
                    )}
                  </div>

                  {/* Tooltip ao hover */}
                  {isHovered && stats.total > 0 && (
                    <div className="absolute z-10 mt-2 p-3 bg-white border border-slate-200 rounded-lg shadow-lg min-w-[200px]">
                      <div className="text-sm font-semibold text-slate-900 mb-2">
                        {format(date, "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      <div className="space-y-1 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                          <span>Total de agendamentos:</span>
                          <span className="font-semibold">{stats.total}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Densidade:</span>
                          <Badge className={cn(
                            "text-[10px] h-4 px-1",
                            stats.density === 'high' && "bg-red-100 text-red-700",
                            stats.density === 'medium' && "bg-yellow-100 text-yellow-700",
                            stats.density === 'low' && "bg-green-100 text-green-700"
                          )}>
                            {stats.density === 'high' ? '🔴 Alta' : stats.density === 'medium' ? '🟡 Média' : '🟢 Baixa'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Concluídos:</span>
                          <span className="font-semibold text-green-600">{stats.completed}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Pagos:</span>
                          <span className="font-semibold text-emerald-600">{stats.paid}</span>
                        </div>
                        {stats.hasConflicts && (
                          <div className="flex items-center gap-1 text-red-600 mt-2">
                            <AlertCircle className="w-3 h-3" />
                            <span>Conflitos detectados</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyView;