import React, { useEffect, useRef } from 'react';
import format from 'date-fns/format';
import isSameDay from 'date-fns/isSameDay';
import isToday from 'date-fns/isToday';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { EnrichedAppointment, Therapist, ScheduleBlock } from '../../types';
import OptimizedAppointmentCard from './OptimizedAppointmentCard';
import { cn } from '../../lib/utils';
import Tooltip from '../ui/tooltip';
import ScheduleBlockBar from './ScheduleBlockBar';
import ZoomControls from './ZoomControls';
import { useAgendaZoom } from '../../hooks/useAgendaZoom';
import TimelineIndicators from './TimelineIndicators';

interface DailyViewProps {
  selectedDate: Date;
  appointments: EnrichedAppointment[];
  therapists: Therapist[];
  scheduleBlocks?: ScheduleBlock[];
  onSlotClick: (date: Date, time: string, therapistId: string) => void;
  onAppointmentClick: (appointment: EnrichedAppointment) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, appointment: EnrichedAppointment) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, date: Date, therapistId: string) => void;
  draggedAppointmentId: string | null;
  onRightClick?: (appointment: EnrichedAppointment, e: React.MouseEvent) => void;
}

const START_HOUR = 7;
const END_HOUR = 21;
const SLOT_DURATION = 30;
const BASE_PIXELS_PER_MINUTE = 2;

const timeSlots = Array.from({ length: (END_HOUR - START_HOUR) * (60 / SLOT_DURATION) }, (_, i) => {
  const totalMinutes = START_HOUR * 60 + i * SLOT_DURATION;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

const CurrentTimeIndicator: React.FC<{ pixelsPerMinute: number }> = ({ pixelsPerMinute }) => {
  const [top, setTop] = React.useState(0);

  React.useEffect(() => {
    const updatePosition = () => {
      const now = new Date();
      const minutesFromStart = (now.getHours() - START_HOUR) * 60 + now.getMinutes();
      setTop(minutesFromStart * pixelsPerMinute);
    };

    updatePosition();
    const interval = setInterval(updatePosition, 60000);
    return () => clearInterval(interval);
  }, [pixelsPerMinute]);

  if (top < 0 || top > (END_HOUR - START_HOUR) * 60 * pixelsPerMinute) {
    return null;
  }

  return (
    <div className="absolute left-0 right-0 z-10 pointer-events-none" style={{ top: `${top}px` }}>
      <div className="relative h-px bg-red-500">
        <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
        <div className="absolute left-2 -top-2 text-xs font-bold text-red-600 bg-white px-1 rounded">
          Agora
        </div>
      </div>
    </div>
  );
};

const DailyView: React.FC<DailyViewProps> = ({
  selectedDate,
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
  onRightClick
}) => {
  const dayAppointments = appointments.filter(app => isSameDay(app.startTime, selectedDate));
  
  // Hook de zoom
  const { zoomLevel, zoomFactor, setZoom } = useAgendaZoom();
  const PIXELS_PER_MINUTE = BASE_PIXELS_PER_MINUTE * zoomFactor;
  
  // Ref para scroll automático
  const containerRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  // Auto-scroll para horário atual ao montar
  useEffect(() => {
    if (!hasScrolledRef.current && containerRef.current && isToday(selectedDate)) {
      const now = new Date();
      const currentHour = now.getHours();
      
      if (currentHour >= START_HOUR && currentHour < END_HOUR) {
        const minutesFromStart = (currentHour - START_HOUR) * 60 + now.getMinutes();
        const scrollPosition = minutesFromStart * PIXELS_PER_MINUTE;
        
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTo({
              top: Math.max(0, scrollPosition - 200),
              behavior: 'smooth'
            });
            hasScrolledRef.current = true;
          }
        }, 100);
      }
    }
  }, [selectedDate, PIXELS_PER_MINUTE]);

  return (
    <div className="flex-1 overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className={cn(
            "text-lg font-semibold",
            isToday(selectedDate) ? "text-sky-600" : "text-slate-900"
          )}>
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h2>
          <p className="text-sm text-slate-500">
            {dayAppointments.length} agendamento{dayAppointments.length !== 1 ? 's' : ''}
          </p>
        </div>
        <ZoomControls currentZoom={zoomLevel} onZoomChange={setZoom} />
      </div>

      <div ref={containerRef} className="flex gap-2 sm:gap-4 h-full overflow-auto">
        {therapists.map((therapist) => {
          const therapistAppointments = dayAppointments.filter(app => app.therapistId === therapist.id);

          return (
            <Card key={therapist.id} className="flex-1 min-w-[240px] sm:min-w-[280px] lg:min-w-[320px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <div
                    className={cn("w-3 h-3 rounded-full", `bg-${therapist.color}-500`)}
                  />
                  <Tooltip content={therapist.name} side="top">
                    <span className="truncate">{therapist.name}</span>
                  </Tooltip>
                  <span className="text-xs sm:text-sm font-normal text-slate-500 flex-shrink-0">
                    ({therapistAppointments.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="relative">
                  <div
                    className="relative"
                    style={{ height: `${(END_HOUR - START_HOUR) * 60 * PIXELS_PER_MINUTE}px` }}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, selectedDate, therapist.id)}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickY = e.clientY - rect.top;
                      const minutesFromTop = clickY / PIXELS_PER_MINUTE;
                      const snappedMinutes = Math.floor(minutesFromTop / SLOT_DURATION) * SLOT_DURATION;
                      const hour = Math.floor(snappedMinutes / 60);
                      const minute = snappedMinutes % 60;
                      onSlotClick(selectedDate, `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`, therapist.id);
                    }}
                  >
                    {timeSlots.map((time, index) => (
                      <div
                        key={time}
                        className="absolute left-0 right-0 border-t border-slate-100 cursor-pointer hover:bg-blue-50/50 transition-colors group hover:shadow-sm"
                        style={{
                          top: `${index * SLOT_DURATION * PIXELS_PER_MINUTE}px`,
                          height: `${SLOT_DURATION * PIXELS_PER_MINUTE}px`
                        }}
                      >
                        {time.endsWith('00') && (
                          <span className="absolute -left-12 -top-2 text-xs text-slate-400 font-medium">
                            {time}
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Schedule Blocks */}
                    {/* Timeline Indicators */}
                    <TimelineIndicators 
                      startHour={START_HOUR}
                      pixelsPerMinute={PIXELS_PER_MINUTE}
                    />

                    {scheduleBlocks
                      .filter(block => 
                        isSameDay(block.startTime, selectedDate) && 
                        block.therapistId === therapist.id
                      )
                      .map((block) => (
                        <ScheduleBlockBar
                          key={block.id}
                          block={block}
                          startHour={START_HOUR}
                          pixelsPerMinute={PIXELS_PER_MINUTE}
                          therapistIndex={0}
                          totalTherapists={1}
                        />
                      ))}

                    {therapistAppointments.map(app => (
                      <OptimizedAppointmentCard
                        key={app.id}
                        appointment={app}
                        startHour={START_HOUR}
                        pixelsPerMinute={PIXELS_PER_MINUTE}
                        isBeingDragged={draggedAppointmentId === app.id}
                        onClick={onAppointmentClick}
                        onRightClick={onRightClick || (() => {})}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        therapistIndex={0}
                        totalTherapists={1}
                        allAppointments={therapistAppointments}
                      />
                    ))}

                    {isToday(selectedDate) && <CurrentTimeIndicator pixelsPerMinute={PIXELS_PER_MINUTE} />}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DailyView;