import React, { useState } from 'react';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import Tooltip from '../ui/tooltip';
import { cn } from '../../lib/utils';
import { EnrichedAppointment, AppointmentStatus } from '../../types';
import { Clock, AlertCircle, CheckCircle2, Circle, User, Edit, Check, MoreVertical, Trash, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EditingIndicator from './EditingIndicator';

interface OptimizedAppointmentCardProps {
  appointment: EnrichedAppointment;
  startHour: number;
  pixelsPerMinute: number;
  isBeingDragged: boolean;
  onClick: (appointment: EnrichedAppointment) => void;
  onRightClick: (appointment: EnrichedAppointment, e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, appointment: EnrichedAppointment) => void;
  onDragEnd: () => void;
  therapistIndex: number;
  totalTherapists: number;
  onEdit?: (appointment: EnrichedAppointment) => void;
  onDelete?: (appointmentId: string) => void;
  onComplete?: (appointment: EnrichedAppointment) => void;
  onDuplicate?: (appointment: EnrichedAppointment) => void;
  editingUser?: { id: string; name: string; avatar?: string };
  allAppointments?: EnrichedAppointment[]; // Para calcular espaço disponível
}

// Cores sólidas e opacas para os terapeutas
const THERAPIST_COLORS = {
  'therapist-1': {
    primary: '#8B5CF6', // Purple
    light: '#F3F4F6',
    border: '#8B5CF6'
  },
  'therapist-2': {
    primary: '#10B981', // Emerald
    light: '#F0FDF4',
    border: '#10B981'
  },
  'therapist-3': {
    primary: '#3B82F6', // Blue
    light: '#EFF6FF',
    border: '#3B82F6'
  }
};

export const OptimizedAppointmentCard: React.FC<OptimizedAppointmentCardProps> = ({
  appointment,
  startHour,
  pixelsPerMinute,
  isBeingDragged,
  onClick,
  onRightClick,
  onDragStart,
  onDragEnd,
  therapistIndex,
  totalTherapists,
  onEdit,
  onDelete,
  onComplete,
  onDuplicate,
  editingUser,
  allAppointments = [],
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const top = ((appointment.startTime.getHours() - startHour) * 60 + appointment.startTime.getMinutes()) * pixelsPerMinute;
  const durationInMinutes = (appointment.endTime.getTime() - appointment.startTime.getTime()) / (60 * 1000);
  
  // Encontrar o próximo agendamento do mesmo terapeuta para limitar altura
  const nextAppointment = allAppointments
    .filter(app => 
      app.id !== appointment.id && 
      app.therapistId === appointment.therapistId &&
      app.startTime > appointment.startTime
    )
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())[0];
  
  // Calcular altura disponível até o próximo agendamento
  const nextAppointmentTop = nextAppointment 
    ? ((nextAppointment.startTime.getHours() - startHour) * 60 + nextAppointment.startTime.getMinutes()) * pixelsPerMinute
    : null;
  
  // Altura ideal do card (75% para melhor visualização mantendo compacto)
  const heightReductionFactor = 0.75;
  const idealHeight = durationInMinutes * pixelsPerMinute * heightReductionFactor;
  
  // Altura máxima: espaço até o próximo agendamento (com margem de 6px para respiração)
  const maxHeight = nextAppointmentTop !== null 
    ? Math.max(nextAppointmentTop - top - 6, 24) 
    : idealHeight;
  
  // Usar o menor valor entre altura ideal e altura máxima (mínimo 24px)
  const height = Math.max(Math.min(idealHeight, maxHeight), 24);

  // Cores sólidas baseadas no terapeuta
  const therapistColor = THERAPIST_COLORS[`therapist-${(therapistIndex % 3) + 1}` as keyof typeof THERAPIST_COLORS];
  
  // Estilos sólidos para status
  const getStatusStyle = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Scheduled:
        return 'bg-white border-slate-200';
      case AppointmentStatus.Completed:
        return 'bg-green-50 border-green-200';
      case AppointmentStatus.Canceled:
        return 'bg-gray-100 border-gray-300';
      case AppointmentStatus.NoShow:
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-white border-slate-200';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPaymentBadge = () => {
    if (appointment.paymentStatus === 'paid') {
      return (
        <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0 shadow-sm" title="Pago">
          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
        </div>
      );
    }
    return (
      <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full flex-shrink-0 shadow-sm" title="Pendente">
        <Circle className="w-2.5 h-2.5 text-white" />
      </div>
    );
  };

  // Cálculo de posicionamento corrigido para evitar sobreposição
  const columnWidth = 100 / totalTherapists;
  const leftPosition = therapistIndex * columnWidth;
  const cardWidth = columnWidth;

  return (
    <div
        onClick={(e) => { e.stopPropagation(); onClick(appointment); }}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onRightClick(appointment, e); }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable="true"
        onDragStart={(e) => onDragStart(e, appointment)}
        onDragEnd={onDragEnd}
        className={cn(
          "absolute rounded-lg cursor-pointer transition-all duration-200 overflow-hidden flex flex-col border-2 shadow-md hover:shadow-lg font-semibold",
          getStatusStyle(appointment.status),
          isBeingDragged && 'opacity-50 ring-4 ring-blue-400',
          appointment.hasConflict && 'ring-4 ring-red-500 ring-opacity-75 animate-pulse',
          "hover:border-opacity-60"
        )}
        data-testid="appointment-block"
        style={{
          top: `${top}px`,
          height: `${height}px`,
          left: `${leftPosition}%`,
          width: `calc(${cardWidth}% - 2px)`, // Margem mínima entre cards
          maxWidth: `calc(${cardWidth}% - 2px)`,
          zIndex: isHovered ? 20 : 10,
          minWidth: '90px',
          maxHeight: `${height}px`,
          borderLeftColor: therapistColor.border,
          borderLeftWidth: '4px',
          backgroundColor: appointment.status === AppointmentStatus.Completed ? '#F0FDF4' : 
                          appointment.status === AppointmentStatus.Canceled ? '#F9FAFB' :
                          appointment.status === AppointmentStatus.NoShow ? '#FFF7ED' : '#FFFFFF',
          opacity: isBeingDragged ? 0.5 : 1,
          padding: '2px 4px', // Mais padding horizontal
          boxSizing: 'border-box'
        }}
      >
        {/* Indicador de Edição */}
        {editingUser && <EditingIndicator userName={editingUser.name} userAvatar={editingUser.avatar} />}

        {/* Quick Actions ao Hover */}
        <AnimatePresence>
          {isHovered && height > 40 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute top-1 right-1 flex gap-1 z-30"
            >
              {onEdit && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-5 w-5 shadow-md hover:shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(appointment);
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              {onComplete && appointment.status === AppointmentStatus.Scheduled && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-5 w-5 shadow-md hover:shadow-lg bg-green-50 hover:bg-green-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete(appointment);
                  }}
                >
                  <Check className="h-3 w-3 text-green-600" />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-5 w-5 shadow-md hover:shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {onDuplicate && (
                    <>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(appointment);
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(appointment.id);
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex-grow min-h-0 flex flex-col justify-between p-1.5 overflow-hidden">
          <div className="flex items-start justify-between gap-1 mb-0.5 overflow-hidden">
            <Tooltip 
              content={
                <div className="space-y-1">
                  <p className="font-semibold">{appointment.patientName}</p>
                  {appointment.therapistName && (
                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {appointment.therapistName}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(appointment.startTime, 'HH:mm', { locale: ptBR })} - {format(appointment.endTime, 'HH:mm', { locale: ptBR })}
                  </p>
                  {appointment.observations && (
                    <p className="text-xs text-slate-600 mt-1">
                      {appointment.observations}
                    </p>
                  )}
                  {appointment.hasConflict && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {appointment.conflictReason}
                    </p>
                  )}
                </div>
              }
              side="top"
              delayDuration={200}
            >
              <div className="font-bold text-xs leading-tight flex-1 text-slate-900 min-w-0 overflow-hidden">
                <div className="font-semibold break-words" style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: '1.2',
                  maxHeight: '2.4em', // 2 linhas * 1.2 line-height
                  wordBreak: 'break-word'
                }}>
                  {appointment.patientName}
                </div>
              </div>
            </Tooltip>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {appointment.hasConflict && (
                <span className="text-orange-600 text-base" title={appointment.conflictReason}>
                  ⚠️
                </span>
              )}
              {getPaymentBadge()}
            </div>
          </div>
          <div className="flex items-center justify-between overflow-hidden">
            <div className="text-[10px] leading-tight font-mono text-slate-700 font-bold truncate">
              {format(appointment.startTime, 'HH:mm')}
            </div>
            <div className="text-[9px] font-semibold text-slate-600 uppercase tracking-wide truncate">
              {appointment.type.substring(0, 3)}
            </div>
          </div>
        </div>
      </div>
  );
};

export default OptimizedAppointmentCard;
