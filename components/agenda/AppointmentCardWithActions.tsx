/**
 * AppointmentCardWithActions Component
 * 
 * Enhanced appointment card with quick actions on hover
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { Clock, User, AlertCircle, CheckCircle2, Circle, Edit, Trash2, Phone, DollarSign, CheckCircle, Star, Heart, AlertTriangle, Package, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../../lib/utils';
import { appointmentCardVariants } from '../../lib/animations';
import type { EnrichedAppointment, AppointmentStatus } from '../../types';
import { CalendarStatusBadge } from '../calendar/CalendarStatusBadge';

interface AppointmentCardWithActionsProps {
  appointment: EnrichedAppointment;
  therapistColor: string;
  compact?: boolean;
  draggable?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: AppointmentStatus) => void;
  onPaymentChange?: (status: 'paid' | 'pending') => void;
  onCall?: () => void;
  className?: string;
}

export const AppointmentCardWithActions: React.FC<AppointmentCardWithActionsProps> = ({
  appointment,
  therapistColor,
  compact = false,
  draggable = true,
  onClick,
  onEdit,
  onDelete,
  onStatusChange,
  onPaymentChange,
  onCall,
  className,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isFirstVisit] = useState(false);
  const [hasMedicalAlerts] = useState(false);
  const [isRecurring] = useState(false);

  const getInitials = (name: string) => {
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

  const handleQuickAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleMarkAsPaid = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPaymentChange?.('paid');
  };

  const handleMarkAsCompleted = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStatusChange?.('completed' as AppointmentStatus);
  };

  return (
    <TooltipProvider>
      <motion.div
        variants={appointmentCardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        className={cn('cursor-pointer relative group', className)}
        onClick={onClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
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
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {appointment.patientName.split(' ')[0] || appointment.patientName}
                      </p>
                      {isFirstVisit && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          </TooltipTrigger>
                          <TooltipContent>Primeira consulta</TooltipContent>
                        </Tooltip>
                      )}
                      {hasMedicalAlerts && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                          </TooltipTrigger>
                          <TooltipContent>Restrições médicas</TooltipContent>
                        </Tooltip>
                      )}
                      {isRecurring && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CalendarIcon className="w-3 h-3 text-blue-500" />
                          </TooltipTrigger>
                          <TooltipContent>Sessão recorrente</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    {!compact && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {appointment.therapistName}
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
                  {appointment.paymentStatus === 'pending' && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
                      <Circle className="w-3 h-3 mr-1" />
                      Pendente
                    </Badge>
                  )}
                  {appointment.status === 'completed' && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Concluído
                    </Badge>
                  )}
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
              {!compact && appointment.value > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    R$ {appointment.value.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Quick Actions - Show on hover */}
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-2 right-2 flex gap-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-1 border border-slate-200 dark:border-slate-700 z-10"
                >
                  {/* Mark as Completed */}
                  {appointment.status !== 'completed' && onStatusChange && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => handleMarkAsCompleted(e)}
                          className="p-1.5 rounded hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400 transition"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Marcar como concluído</TooltipContent>
                    </Tooltip>
                  )}

                  {/* Mark as Paid */}
                  {appointment.paymentStatus === 'pending' && onPaymentChange && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => handleMarkAsPaid(e)}
                          className="p-1.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-400 transition"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Marcar como pago</TooltipContent>
                    </Tooltip>
                  )}

                  {/* Call */}
                  {onCall && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => handleQuickAction(e, onCall)}
                          className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 transition"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Ligar para paciente</TooltipContent>
                    </Tooltip>
                  )}

                  {/* Edit */}
                  {onEdit && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => handleQuickAction(e, onEdit)}
                          className="p-1.5 rounded hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-600 dark:text-sky-400 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Editar agendamento</TooltipContent>
                    </Tooltip>
                  )}

                  {/* Delete */}
                  {onDelete && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => handleQuickAction(e, onDelete)}
                          className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Excluir agendamento</TooltipContent>
                    </Tooltip>
                  )}
                </motion.div>
              )}
            </Card>
          </TooltipTrigger>
          
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-semibold">{appointment.patientName}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {appointment.therapistName}
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

export default AppointmentCardWithActions;

