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
import { EnrichedAppointment, AppointmentStatus, ColorDisplayMode } from '../../types';
import { Clock, AlertCircle, User, Edit, Check, MoreVertical, Trash, Copy, CheckCircle, XCircle, Ban } from 'lucide-react';
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
  colorMode?: ColorDisplayMode; // Modo de visualização de cores
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

// Cores por status (para modo híbrido e status)
const STATUS_COLORS = {
  [AppointmentStatus.Scheduled]: {
    bg: '#EFF6FF', // blue-50
    text: '#1E40AF', // blue-800
    border: '#3B82F6', // blue-500
    icon: Clock,
    label: 'Agendado'
  },
  [AppointmentStatus.Confirmed]: {
    bg: '#DCFCE7', // green-100
    text: '#166534', // green-800
    border: '#22C55E', // green-500
    icon: CheckCircle,
    label: 'Confirmado'
  },
  [AppointmentStatus.Completed]: {
    bg: '#F3F4F6', // gray-100
    text: '#374151', // gray-700
    border: '#9CA3AF', // gray-400
    icon: CheckCircle,
    label: 'Realizado'
  },
  [AppointmentStatus.Canceled]: {
    bg: '#FEE2E2', // red-100
    text: '#991B1B', // red-800
    border: '#EF4444', // red-500
    icon: XCircle,
    label: 'Cancelado'
  },
  [AppointmentStatus.NoShow]: {
    bg: '#FFF7ED', // orange-50
    text: '#9A3412', // orange-800
    border: '#F97316', // orange-500
    icon: Ban,
    label: 'Faltou'
  },
  [AppointmentStatus.InProgress]: {
    bg: '#FEF3C7', // amber-100
    text: '#92400E', // amber-900
    border: '#F59E0B', // amber-500
    icon: Clock,
    label: 'Em Andamento'
  }
};

// Função para obter cores baseadas no modo de visualização
const getCardColors = (
  status: AppointmentStatus,
  therapistIndex: number,
  mode: ColorDisplayMode = 'hybrid'
) => {
  const therapistColor = THERAPIST_COLORS[`therapist-${(therapistIndex % 3) + 1}` as keyof typeof THERAPIST_COLORS];
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS[AppointmentStatus.Scheduled];
  
  switch (mode) {
    case 'therapist':
      // Apenas cores do terapeuta
      return {
        bg: therapistColor.light,
        border: therapistColor.border,
        text: '#1F2937' // gray-800
      };
    case 'status':
      // Apenas cores do status
      return {
        bg: statusColor.bg,
        border: statusColor.border,
        text: statusColor.text
      };
    case 'hybrid':
    default:
      // Híbrido: borda do terapeuta + fundo do status
      return {
        bg: statusColor.bg,
        border: therapistColor.border,
        text: statusColor.text
      };
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
  colorMode = 'hybrid',
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

  // Obter cores baseadas no modo de visualização
  const cardColors = getCardColors(appointment.status, therapistIndex, colorMode);
  const statusInfo = STATUS_COLORS[appointment.status] || STATUS_COLORS[AppointmentStatus.Scheduled];
  const StatusIcon = statusInfo.icon;
  
  // Verificar se é primeira consulta ou retorno
  const isFirstAppointment = allAppointments.filter(app => 
    app.patientId === appointment.patientId && 
    app.startTime < appointment.startTime
  ).length === 0;

  const isReturn = !isFirstAppointment;

  // Verificar se é urgente (nas próximas 2 horas)
  const isUrgent = () => {
    const now = new Date();
    const diffInHours = (appointment.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffInHours > 0 && diffInHours <= 2 && appointment.status === AppointmentStatus.Scheduled;
  };

  // Estilos aprimorados para status
  const getStatusStyle = (status: AppointmentStatus) => {
    const baseStyle = 'transition-all duration-200';
    
    switch (status) {
      case AppointmentStatus.Scheduled:
        return `${baseStyle} bg-white border-slate-200 hover:border-blue-300`;
      case AppointmentStatus.Completed:
        return `${baseStyle} bg-green-50 border-green-300 hover:border-green-400`;
      case AppointmentStatus.Canceled:
        return `${baseStyle} bg-gray-100 border-gray-400`;
      case AppointmentStatus.NoShow:
        return `${baseStyle} bg-orange-50 border-orange-300 hover:border-orange-400`;
      default:
        return `${baseStyle} bg-white border-slate-200`;
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
          "absolute rounded-lg cursor-pointer transition-all duration-200 overflow-hidden flex flex-col border-2 shadow-md font-semibold",
          getStatusStyle(appointment.status),
          isBeingDragged && 'opacity-50 ring-4 ring-blue-400',
          appointment.hasConflict && 'ring-4 ring-red-500 ring-opacity-75 animate-pulse',
          isUrgent() && 'ring-2 ring-yellow-400 animate-pulse',
          "hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5",
          "active:scale-[0.98]"
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
          borderLeftColor: cardColors.border,
          borderLeftWidth: '4px',
          backgroundColor: cardColors.bg,
          color: cardColors.text,
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
                  {/* Mostrar status de pagamento e recorrência no tooltip */}
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                    {appointment.paymentStatus && (
                      <span className={appointment.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
                        💰 {appointment.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    )}
                    {isReturn && (
                      <span>🔄 Retorno</span>
                    )}
                  </div>
                </div>
              }
              side="top"
              delayDuration={200}
            >
              <div className="flex-1 text-slate-900 min-w-0 overflow-hidden">
                <div className="text-[10px] leading-tight break-words" style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: '1.3',
                  maxHeight: '3.9em', // 3 linhas * 1.3 line-height
                  wordBreak: 'break-word'
                }}>
                  {appointment.patientName}
                </div>
              </div>
            </Tooltip>
            <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
              {/* Badge de Sessões Restantes */}
              {appointment.sessions_remaining !== undefined && appointment.sessions_remaining !== null && (
                <Tooltip content={`${appointment.sessions_remaining} sessão(ões) restante(s) no pacote`}>
                  <Badge 
                    className="bg-white/90 text-slate-700 text-[9px] px-1.5 py-0 h-4 leading-none font-bold border border-slate-300 shadow-sm"
                    style={{ minWidth: '16px' }}
                  >
                    {appointment.sessions_remaining}
                  </Badge>
                </Tooltip>
              )}
              {/* Badge de Novo apenas para primeira consulta */}
              {isFirstAppointment && height > 35 && (
                <Badge className="bg-blue-500 text-white text-[8px] px-1 py-0 h-4 leading-none">
                  🆕 Novo
                </Badge>
              )}
              {/* Badge de Urgente */}
              {isUrgent() && (
                <span className="text-yellow-600 text-sm animate-bounce" title="Consulta em breve!">
                  ⏰
                </span>
              )}
              {appointment.hasConflict && (
                <span className="text-orange-600 text-base" title={appointment.conflictReason}>
                  ⚠️
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between overflow-hidden">
            <div className="text-[10px] leading-tight font-mono text-slate-700 font-bold truncate">
              {format(appointment.startTime, 'HH:mm')}
            </div>
            <div className="text-[9px] font-semibold text-slate-600 uppercase tracking-wide truncate">
              {typeof appointment.type === 'string' && appointment.type
                ? appointment.type.substring(0, 3)
                : ''}
            </div>
          </div>
        </div>
      </div>
  );
};

export default OptimizedAppointmentCard;
