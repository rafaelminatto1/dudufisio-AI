/**
 * AppointmentCard Component
 * 
 * Modern appointment card with solid background, shadcn/ui components,
 * and Framer Motion animations. Replaces the old transparent cards.
 */

import React from 'react';
import { motion } from 'framer-motion';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { Clock, User, AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../../lib/utils';
import { appointmentCardVariants } from '../../lib/animations';
import type { EnrichedAppointment } from '../../types';
import { CalendarStatusBadge } from '../calendar/CalendarStatusBadge';

interface AppointmentCardProps {
  appointment: EnrichedAppointment;
  therapistColor: string;
  compact?: boolean;
  draggable?: boolean;
  onClick?: () => void;
  className?: string;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  therapistColor,
  compact = false,
  draggable = true,
  onClick,
  className,
}) => {
  const getInitials = (name: string | undefined) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'no-show':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getPaymentBadge = () => {
    if (appointment.paymentStatus === 'paid') {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Pago
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
        <Circle className="w-3 h-3 mr-1" />
        Pendente
      </Badge>
    );
  };

  return (
    <TooltipProvider>
      <motion.div
        variants={appointmentCardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        className={cn('cursor-pointer', className)}
        onClick={onClick}
        draggable={draggable}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              className={cn(
                'p-3 border-2 transition-all duration-200',
                'bg-white dark:bg-slate-900',
                'hover:shadow-lg hover:scale-[1.02]',
                appointment.hasConflict && 'border-red-500 border-opacity-75 animate-pulse',
                !appointment.hasConflict && 'border-slate-200 dark:border-slate-700'
              )}
              style={{
                borderLeftColor: appointment.hasConflict ? undefined : therapistColor,
                borderLeftWidth: '4px',
              }}
            >
              {/* Header with patient name and status */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Avatar className="w-8 h-8 border-2" style={{ borderColor: therapistColor }}>
                    <AvatarFallback className="text-xs font-semibold" style={{ backgroundColor: `${therapistColor}20`, color: therapistColor }}>
                      {getInitials(appointment.patientName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {appointment.patientName ? (appointment.patientName.split(' ')[0] || appointment.patientName) : 'Sem nome'}
                    </p>
                    {!compact && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {appointment.therapistName || 'Sem terapeuta'}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Status badges */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {appointment.hasConflict && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Conflito
                    </Badge>
                  )}
                  {getPaymentBadge()}
                  <CalendarStatusBadge calendarLink={(appointment as any).calendar_link} />
                </div>
              </div>

              {/* Time and type */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono font-semibold">
                    {format(appointment.startTime, 'HH:mm', { locale: ptBR })}
                  </span>
                  {!compact && (
                    <>
                      <span>•</span>
                      <span>{format(appointment.endTime, 'HH:mm', { locale: ptBR })}</span>
                    </>
                  )}
                </div>
                
                {!compact && (
                  <Badge variant="outline" className={cn('text-xs', getStatusColor(appointment.status))}>
                    {appointment.type}
                  </Badge>
                )}
              </div>

              {/* Price (if not compact) */}
              {!compact && appointment.price !== undefined && appointment.price > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    R$ {appointment.price.toFixed(2)}
                  </p>
                </div>
              )}
            </Card>
          </TooltipTrigger>
          
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-semibold">{appointment.patientName || 'Sem nome'}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {appointment.therapistName || 'Sem terapeuta'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {format(appointment.startTime, 'HH:mm', { locale: ptBR })} - {format(appointment.endTime, 'HH:mm', { locale: ptBR })}
              </p>
              {appointment.observations && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {appointment.observations}
                </p>
              )}
              {appointment.hasConflict && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  ⚠️ {appointment.conflictReason}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </motion.div>
    </TooltipProvider>
  );
};

export default AppointmentCard;
