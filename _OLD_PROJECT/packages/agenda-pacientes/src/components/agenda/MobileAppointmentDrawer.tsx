import React from 'react';
import { Calendar, Clock, User, DollarSign, Edit, Trash2, Phone, CheckCircle } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '../ui/drawer';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { EnrichedAppointment } from '../../types';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';

interface MobileAppointmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: EnrichedAppointment | null;
  onEdit?: () => void;
  onDelete?: () => void;
  onCall?: () => void;
  onMarkComplete?: () => void;
  onMarkPaid?: () => void;
}

const MobileAppointmentDrawer: React.FC<MobileAppointmentDrawerProps> = ({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onDelete,
  onCall,
  onMarkComplete,
  onMarkPaid
}) => {
  if (!appointment) return null;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center justify-between">
            <span>{appointment.patientName}</span>
            {appointment.hasConflict && (
              <Badge variant="destructive" className="text-xs">
                Conflito
              </Badge>
            )}
          </DrawerTitle>
          <DrawerDescription>
            {format(appointment.startTime, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-4 space-y-4">
          {/* Informações Principais */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Clock className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-sm text-slate-600">Horário</p>
                <p className="font-semibold text-slate-900">
                  {format(appointment.startTime, 'HH:mm', { locale: ptBR })} - {format(appointment.endTime, 'HH:mm', { locale: ptBR })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <User className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-sm text-slate-600">Terapeuta</p>
                <p className="font-semibold text-slate-900">{appointment.therapistName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Calendar className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-sm text-slate-600">Tipo</p>
                <p className="font-semibold text-slate-900">{displayAppointmentType(appointment.type)}</p>
              </div>
            </div>

            {appointment.value > 0 && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="text-sm text-slate-600">Valor</p>
                  <p className="font-semibold text-slate-900">
                    {formatCurrencyBR(appointment.value)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex gap-2">
            <Badge variant="outline" className={appointment.status === 'completed' ? 'bg-green-50 text-green-700 border-green-300' : ''}>
              {appointment.status}
            </Badge>
            <Badge variant="outline" className={appointment.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 border-green-300' : 'bg-yellow-50 text-yellow-700 border-yellow-300'}>
              {appointment.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
            </Badge>
          </div>

          {/* Observações */}
          {appointment.observations && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">Observações</p>
              <p className="text-sm text-blue-800">{appointment.observations}</p>
            </div>
          )}

          {/* Conflito */}
          {appointment.hasConflict && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-900 mb-1">⚠️ Conflito Detectado</p>
              <p className="text-sm text-red-800">{appointment.conflictReason}</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <DrawerFooter className="gap-2">
          <div className="grid grid-cols-2 gap-2">
            {appointment.status !== 'completed' && onMarkComplete && (
              <Button
                variant="outline"
                onClick={() => {
                  onMarkComplete();
                  onClose();
                }}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Concluir
              </Button>
            )}
            
            {appointment.paymentStatus === 'pending' && onMarkPaid && (
              <Button
                variant="outline"
                onClick={() => {
                  onMarkPaid();
                  onClose();
                }}
                className="flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Marcar Pago
              </Button>
            )}

            {appointment.patientPhone && onCall && (
              <Button
                variant="outline"
                onClick={() => {
                  onCall();
                  onClose();
                }}
                className="flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Ligar
              </Button>
            )}

            {onEdit && (
              <Button
                variant="outline"
                onClick={() => {
                  onEdit();
                  onClose();
                }}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Button>
            )}
          </div>

          {onDelete && (
            <Button
              variant="destructive"
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Excluir
            </Button>
          )}

          <DrawerClose asChild>
            <Button variant="outline">Fechar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileAppointmentDrawer;


