import React from 'react';
import { EnrichedAppointment } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { 
  User, 
  Clock, 
  Calendar, 
  Plus,
  Circle,
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { getTherapistColor } from '../../design-system/tokens';
import { cn } from '../../lib/utils';

interface Therapist {
  id: string;
  name: string;
  color: string;
  isOnline?: boolean;
  specialization?: string;
}

interface EnhancedTherapistColumnProps {
  therapist: Therapist;
  appointments: EnrichedAppointment[];
  onSlotClick: (date: Date, time: string, therapistId: string) => void;
  onAddAppointment: (therapistId: string) => void;
  selectedDate: Date;
  startHour?: number;
  endHour?: number;
  slotDuration?: number;
  pixelsPerMinute?: number;
  className?: string;
}

const EnhancedTherapistColumn: React.FC<EnhancedTherapistColumnProps> = ({
  therapist,
  appointments,
  onSlotClick,
  onAddAppointment,
  selectedDate,
  startHour = 7,
  endHour = 21,
  slotDuration = 30,
  pixelsPerMinute = 2,
  className
}) => {
  const therapistColor = getTherapistColor(parseInt(therapist.id) || 1);
  
  // Calculate stats for this therapist
  const todayAppointments = appointments.filter(app => 
    app.therapistId === therapist.id &&
    app.startTime.toDateString() === selectedDate.toDateString()
  );

  const completedAppointments = todayAppointments.filter(app => 
    app.status === 'completed'
  ).length;

  const pendingAppointments = todayAppointments.filter(app => 
    app.status === 'scheduled' || app.status === 'confirmed'
  ).length;

  const totalValue = todayAppointments.reduce((sum, app) => 
    sum + (app.value || 0), 0
  );

  // Generate time slots
  const timeSlots = Array.from(
    { length: (endHour - startHour) * (60 / slotDuration) }, 
    (_, i) => {
      const totalMinutes = startHour * 60 + i * slotDuration;
      const hour = Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      {/* Therapist Header */}
      <div 
        className="p-4 border-b"
        style={{ 
          backgroundColor: therapistColor[50],
          borderBottomColor: therapistColor[200]
        }}
      >
        <div className="flex items-center space-x-3 mb-3">
          <div className="relative">
            <Avatar className="w-12 h-12 ring-2 ring-white shadow-sm">
              <AvatarImage src={`/avatars/therapist-${therapist.id}.jpg`} />
              <AvatarFallback 
                className="text-sm font-medium"
                style={{ 
                  backgroundColor: therapistColor[500], 
                  color: 'white' 
                }}
              >
                {getInitials(therapist.name)}
              </AvatarFallback>
            </Avatar>
            
            {/* Online Status */}
            <div 
              className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                therapist.isOnline ? "bg-green-500" : "bg-gray-400"
              )}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {therapist.name}
            </h3>
            {therapist.specialization && (
              <p className="text-xs text-muted-foreground truncate">
                {therapist.specialization}
              </p>
            )}
            <div className="flex items-center space-x-1 mt-1">
              <Circle 
                className={cn(
                  "w-2 h-2",
                  therapist.isOnline ? "text-green-500" : "text-gray-400"
                )} 
              />
              <span className="text-xs text-muted-foreground">
                {therapist.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="font-medium">{todayAppointments.length}</span>
            <span className="text-muted-foreground">consultas</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span className="font-medium text-green-600">{completedAppointments}</span>
            <span className="text-muted-foreground">concluídas</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-blue-600" />
            <span className="font-medium text-blue-600">{pendingAppointments}</span>
            <span className="text-muted-foreground">pendentes</span>
          </div>
          
          {totalValue > 0 && (
            <div className="flex items-center space-x-1">
              <DollarSign className="w-3 h-3 text-green-600" />
              <span className="font-medium text-green-600">
                R$ {totalValue.toFixed(0)}
              </span>
            </div>
          )}
        </div>

        {/* Quick Add Button */}
        <Button
          size="sm"
          className="w-full mt-3"
          style={{
            backgroundColor: therapistColor[500],
            color: 'white'
          }}
          onClick={() => onAddAppointment(therapist.id)}
        >
          <Plus className="w-3 h-3 mr-1" />
          Agendar
        </Button>
      </div>

      {/* Time Slots */}
      <div className="flex-1 overflow-hidden">
        <div 
          className="relative"
          style={{ height: `${(endHour - startHour) * 60 * pixelsPerMinute}px` }}
        >
          {timeSlots.map((time, index) => {
            const slotAppointment = todayAppointments.find(app => 
              formatTime(app.startTime) === time
            );

            return (
              <div
                key={time}
                className={cn(
                  "absolute w-full border-b border-gray-100 cursor-pointer transition-colors",
                  "hover:bg-blue-50 hover:border-blue-200",
                  slotAppointment && "bg-gray-50"
                )}
                style={{
                  top: `${index * slotDuration * pixelsPerMinute}px`,
                  height: `${slotDuration * pixelsPerMinute}px`
                }}
                onClick={() => onSlotClick(selectedDate, time, therapist.id)}
              >
                <div className="h-full flex items-center justify-between px-2">
                  <span className="text-xs text-muted-foreground">
                    {time}
                  </span>
                  
                  {slotAppointment && (
                    <div className="flex items-center space-x-1">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: therapistColor[500] }}
                      />
                      <span className="text-xs font-medium truncate max-w-20">
                        {slotAppointment.patientName.split(' ')[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default EnhancedTherapistColumn;
