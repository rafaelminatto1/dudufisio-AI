import React, { useState, useMemo } from 'react';
import format from 'date-fns/format';
import addDays from 'date-fns/addDays';
import startOfWeek from 'date-fns/startOfWeek';
import isSameDay from 'date-fns/isSameDay';
import isToday from 'date-fns/isToday';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { EnrichedAppointment, Therapist, AppointmentStatus, ScheduleBlock } from '../../types';
import { cn } from '../../lib/utils';
import AppointmentContextMenu from './AppointmentContextMenu';
import HolidayIndicator from './HolidayIndicator';
import Tooltip from '../ui/tooltip';
import ScheduleBlockBar from './ScheduleBlockBar';
import OptimizedAppointmentCard from './OptimizedAppointmentCard';

interface NewWeeklyViewProps {
  currentDate: Date;
  appointments: EnrichedAppointment[];
  therapists: Therapist[];
  scheduleBlocks?: ScheduleBlock[];
  onSlotClick: (day: Date, time: string, therapistId: string) => void;
  onAppointmentClick: (appointment: EnrichedAppointment) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, appointment: EnrichedAppointment) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, day: Date, therapistId: string) => void;
  draggedAppointmentId: string | null;
  onEdit?: (appointment: EnrichedAppointment) => void;
  onDelete?: (appointmentId: string) => void;
  onStatusChange?: (appointment: EnrichedAppointment, status: AppointmentStatus) => void;
  onPaymentStatusChange?: (appointment: EnrichedAppointment, status: 'paid' | 'pending') => void;
}

const START_HOUR = 7;
const END_HOUR = 21; // Horário estendido até 21h
const SLOT_DURATION = 30;
const PIXELS_PER_MINUTE = 2.5; // Aumentado para melhor visualização


const timeSlots = Array.from({ length: (END_HOUR - START_HOUR) * (60 / SLOT_DURATION) }, (_, i) => {
  const totalMinutes = START_HOUR * 60 + i * SLOT_DURATION;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

// Indicador de tempo atual
const CurrentTimeIndicator: React.FC = () => {
  const [top, setTop] = React.useState(0);

  React.useEffect(() => {
    const updatePosition = () => {
      const now = new Date();
      const minutesFromStart = (now.getHours() - START_HOUR) * 60 + now.getMinutes();
      setTop(minutesFromStart * PIXELS_PER_MINUTE);
    };

    updatePosition();
    const interval = setInterval(updatePosition, 60000);
    return () => clearInterval(interval);
  }, []);

  if (top < 0 || top > (END_HOUR - START_HOUR) * 60 * PIXELS_PER_MINUTE) {
    return null;
  }

  return (
    <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: `${top}px` }}>
      <div className="relative h-0.5 bg-red-500 shadow-sm">
        <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full shadow-sm"></div>
      </div>
    </div>
  );
};

// Indicador de drop para drag-and-drop
const DropIndicator: React.FC<{ top: number; show: boolean }> = ({ top, show }) => {
  if (!show) return null;
  
  return (
    <div 
      className="absolute left-0 right-0 z-30 pointer-events-none transition-all duration-150"
      style={{ top: `${top}px` }}
    >
      <div className="h-1 bg-blue-500 shadow-lg opacity-80 rounded-full" />
    </div>
  );
};


const NewWeeklyView: React.FC<NewWeeklyViewProps> = ({
  currentDate,
  appointments,
  therapists,
  scheduleBlocks = [],
  onSlotClick,
  onAppointmentClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  draggedAppointmentId,
  onEdit,
  onDelete,
  onStatusChange,
  onPaymentStatusChange
}) => {
  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekDays = useMemo(() => Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const [contextMenu, setContextMenu] = useState<{
    appointment: EnrichedAppointment;
    position: { x: number; y: number };
  } | null>(null);

  // Estados para feedback visual do drag-and-drop
  const [dropIndicatorPosition, setDropIndicatorPosition] = useState<number | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  const handleRightClick = (appointment: EnrichedAppointment, e: React.MouseEvent) => {
    setContextMenu({
      appointment,
      position: { x: e.clientX, y: e.clientY }
    });
  };

  const handleDuplicate = (appointment: EnrichedAppointment) => {
    const newStartTime = new Date(appointment.startTime);
    newStartTime.setDate(newStartTime.getDate() + 7);

    onSlotClick(newStartTime, format(newStartTime, 'HH:mm'), appointment.therapistId);
  };

  // Handler melhorado para drag over com feedback visual
  const handleDragOverEnhanced = (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const dropY = e.clientY - rect.top;
    
    // Calcular posição com snap
    const minutesFromTop = dropY / PIXELS_PER_MINUTE;
    const snappedMinutes = Math.round(minutesFromTop / 30) * 30;
    const snappedY = snappedMinutes * PIXELS_PER_MINUTE;
    
    setDropIndicatorPosition(snappedY);
    setHoveredColumn(day.toISOString());
  };

  const handleDragLeave = () => {
    setDropIndicatorPosition(null);
    setHoveredColumn(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header com informações dos dias */}
      <div className="mb-4">
        <div className="grid grid-cols-6 gap-0.5 sm:gap-1 md:gap-2 lg:gap-3">
          {weekDays.map(day => {
            const dayAppointments = appointments.filter(app => isSameDay(app.startTime, day));
            return (
              <Card key={day.toISOString()} className={cn(
                "p-2 sm:p-3 transition-all duration-200 hover:shadow-md",
                isToday(day)
                  ? "border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md"
                  : "border border-slate-200 bg-white hover:border-slate-300"
              )}>
                <div className="text-center">
                  <div className={cn(
                    "text-sm sm:text-lg font-bold mb-1",
                    isToday(day) ? "text-blue-700" : "text-slate-800"
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className={cn(
                    "text-xs font-semibold uppercase tracking-wide mb-2",
                    isToday(day) ? "text-blue-600" : "text-slate-600"
                  )}>
                    {format(day, 'EEE', { locale: ptBR })}
                  </div>
                  {dayAppointments.length > 0 && (
                    <Badge
                      variant={isToday(day) ? "default" : "secondary"}
                      className={cn(
                        "text-xs h-5 px-2 font-semibold shadow-sm",
                        isToday(day) && "bg-blue-600 hover:bg-blue-700"
                      )}
                    >
                      {dayAppointments.length} {dayAppointments.length === 1 ? 'consulta' : 'consultas'}
                    </Badge>
                  )}
                  <HolidayIndicator date={day} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Grid principal do calendário */}
      <div className="flex-1 flex overflow-hidden rounded-lg shadow-lg border border-slate-200 relative">
        {/* Coluna de horários */}
        <div className="w-16 sm:w-20 flex-shrink-0 border-r-2 border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100">
          {timeSlots.map(time => (
            <div 
              key={time} 
              className={cn(
                "text-right pr-3 text-xs font-semibold flex items-center justify-end border-b transition-colors",
                time.endsWith('00') ? "border-slate-300 text-slate-700 bg-slate-100/50" : "border-slate-200 text-slate-500"
              )}
              style={{ height: `${SLOT_DURATION * PIXELS_PER_MINUTE}px` }}
            >
              {time.endsWith('00') ? time : ''}
            </div>
          ))}
        </div>

        {/* Linhas horizontais - horas cheias E meias horas */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {timeSlots.map(time => {
            const isFullHour = time.endsWith('00');
            const [hour, minute] = time.split(':').map(Number);
            const totalMinutes = (hour - START_HOUR) * 60 + minute;
            const topPosition = totalMinutes * PIXELS_PER_MINUTE;
            
            return (
              <div
                key={time}
                className={cn(
                  "absolute border-b",
                  isFullHour 
                    ? "border-slate-400" // Hora cheia: linha mais grossa
                    : "border-slate-200" // Meia hora: linha mais sutil
                )}
                style={{ 
                  top: `${topPosition}px`,
                  height: '1px',
                  left: 0,
                  right: 0
                }}
              />
            );
          })}
        </div>

        {/* Grid dos dias - Design sólido sem transparência */}
        <div className="flex-1 grid grid-cols-6 bg-slate-100 overflow-auto lg:gap-1 xl:gap-2 relative z-10">
          {weekDays.map((day) => {
            const dayAppointments = appointments.filter(app => isSameDay(app.startTime, day));

            return (
              <div key={day.toISOString()} className={cn(
                "relative border-r border-slate-200 last:border-r-0",
                isToday(day) ? "bg-blue-50/30" : "bg-white"
              )}>

                {/* Área de slots para cada terapeuta */}
                <div className="relative" style={{ height: `${(END_HOUR - START_HOUR) * 60 * PIXELS_PER_MINUTE}px` }}>
                  {/* Grid de terapeutas */}
                  <div className="absolute inset-0 grid grid-cols-3 gap-0.5 lg:gap-1">
                    {therapists.slice(0, 3).map((therapist, therapistIndex) => (
                      <div
                        key={therapist.id}
                        className={cn(
                          "border-r border-slate-200 last:border-r-0 hover:bg-blue-50/20 transition-all duration-150",
                          therapistIndex === 0 && "hover:bg-purple-50/20",
                          therapistIndex === 1 && "hover:bg-emerald-50/20",
                          therapistIndex === 2 && "hover:bg-blue-50/20"
                        )}
                        onDragOver={(e) => handleDragOverEnhanced(e, day)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => onDrop(e, day, therapist.id)}
                      >
                        {timeSlots.map((time) => (
                          <div
                            key={time}
                            className={cn(
                              "border-b hover:bg-gradient-to-r transition-all duration-150 cursor-pointer group relative",
                              time.endsWith('00') ? "border-slate-300" : "border-slate-200",
                              "hover:shadow-sm hover:scale-[1.005]",
                              therapistIndex === 0 && "hover:from-purple-50 hover:to-purple-100/30",
                              therapistIndex === 1 && "hover:from-emerald-50 hover:to-emerald-100/30",
                              therapistIndex === 2 && "hover:from-blue-50 hover:to-blue-100/30"
                            )}
                            style={{
                              height: `${SLOT_DURATION * PIXELS_PER_MINUTE}px`,
                              minHeight: '48px'
                            }}
                            onClick={() => {
                              onSlotClick(day, time, therapist.id);
                            }}
                          >
                            {/* Indicador de hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-xs font-bold text-slate-400 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                                +
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Schedule Blocks */}
                  {scheduleBlocks
                    .filter(block => isSameDay(block.startTime, day))
                    .map((block) => {
                      const therapistIndex = therapists.findIndex(t => t.id === block.therapistId);
                      return (
                        <ScheduleBlockBar
                          key={block.id}
                          block={block}
                          startHour={START_HOUR}
                          pixelsPerMinute={PIXELS_PER_MINUTE}
                          therapistIndex={therapistIndex >= 0 ? therapistIndex : 0}
                          totalTherapists={therapists.length}
                        />
                      );
                    })}

                  {/* Agendamentos */}
                  {dayAppointments.map((appointment) => {
                    const therapistIndex = therapists.findIndex(t => t.id === appointment.therapistId);
                    return (
                      <OptimizedAppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        startHour={START_HOUR}
                        pixelsPerMinute={PIXELS_PER_MINUTE}
                        isBeingDragged={draggedAppointmentId === appointment.id}
                        onClick={onAppointmentClick}
                        onRightClick={handleRightClick}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        therapistIndex={therapistIndex >= 0 ? therapistIndex : 0}
                        totalTherapists={therapists.length}
                        allAppointments={dayAppointments}
                      />
                    );
                  })}

                  {/* Indicador de tempo atual */}
                  {isToday(day) && <CurrentTimeIndicator />}
                  
                  {/* Indicador de drop para drag-and-drop */}
                  {hoveredColumn === day.toISOString() && dropIndicatorPosition !== null && (
                    <DropIndicator top={dropIndicatorPosition} show={true} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <AppointmentContextMenu
          appointment={contextMenu.appointment}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onEdit={() => {
            if (onEdit) onEdit(contextMenu.appointment);
          }}
          onDelete={() => {
            if (onDelete) onDelete(contextMenu.appointment.id);
          }}
          onDuplicate={() => handleDuplicate(contextMenu.appointment)}
          onStatusChange={(status) => {
            if (onStatusChange) onStatusChange(contextMenu.appointment, status);
          }}
          onPaymentToggle={() => {
            if (onPaymentStatusChange) {
              const newStatus = contextMenu.appointment.paymentStatus === 'paid' ? 'pending' : 'paid';
              onPaymentStatusChange(contextMenu.appointment, newStatus);
            }
          }}
          onCall={() => {
            if (contextMenu.appointment.patientPhone) {
              window.open(`tel:${contextMenu.appointment.patientPhone}`);
            }
          }}
        />
      )}
    </div>
  );
};

export default NewWeeklyView;
