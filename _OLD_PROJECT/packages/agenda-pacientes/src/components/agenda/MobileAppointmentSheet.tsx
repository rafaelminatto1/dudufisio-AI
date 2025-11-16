import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';
import {
  Clock,
  User,
  MapPin,
  FileText,
  Edit,
  Check,
  Trash,
  DollarSign,
  Phone,
  Mail,
  AlertTriangle,
} from 'lucide-react';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import type { EnrichedAppointment } from '../../types';
import { AppointmentStatus } from '../../types';
import { cn } from '../../lib/utils';

interface MobileAppointmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: EnrichedAppointment | null;
  onEdit?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
}

export function MobileAppointmentSheet({
  open,
  onOpenChange,
  appointment,
  onEdit,
  onDelete,
  onComplete,
}: MobileAppointmentSheetProps) {
  if (!appointment) return null;

  const getStatusBadge = () => {
    switch (appointment.status) {
      case AppointmentStatus.Completed:
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Concluído
          </Badge>
        );
      case AppointmentStatus.Canceled:
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            Cancelado
          </Badge>
        );
      case AppointmentStatus.NoShow:
        return (
          <Badge className="bg-orange-100 text-orange-700 border-orange-200">
            Falta
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            Agendado
          </Badge>
        );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] p-0">
        <SheetHeader className="p-4 pb-3 border-b bg-white sticky top-0 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-xl mb-1">
                {appointment.patientName}
              </SheetTitle>
              <SheetDescription className="text-sm">
                {format(appointment.startTime, "EEEE, d 'de' MMMM", {
                  locale: ptBR,
                })}
              </SheetDescription>
            </div>
            {getStatusBadge()}
          </div>
        </SheetHeader>

        <ScrollArea className="h-full pb-24">
          <div className="p-4 space-y-4">
            {/* Horário */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-0.5">Horário</p>
                  <p className="font-semibold text-slate-900">
                    {format(appointment.startTime, 'HH:mm')} -{' '}
                    {format(appointment.endTime, 'HH:mm')}
                  </p>
                  <p className="text-xs text-slate-500">
                    Duração: {Math.round((appointment.endTime.getTime() - appointment.startTime.getTime()) / (60 * 1000))} min
                  </p>
                </div>
              </div>
            </Card>

            {/* Terapeuta */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-0.5">Terapeuta</p>
                  <p className="font-semibold text-slate-900">
                    {appointment.therapistName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Tipo: {appointment.type}
                  </p>
                </div>
              </div>
            </Card>

            {/* Tipo de Atendimento */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-0.5">Tipo de Atendimento</p>
                  <p className="font-semibold text-slate-900">
                    {displayAppointmentType(appointment.type)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Valor e Pagamento */}
            {appointment.value && (
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-0.5">Valor</p>
                      <p className="font-bold text-lg text-emerald-700">
                        {formatCurrencyBR(appointment.value)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      appointment.paymentStatus === 'paid'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    )}
                  >
                    {appointment.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                  </Badge>
                </div>
              </Card>
            )}

            {/* Observações */}
            {appointment.observations && (
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-slate-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Observações</p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {appointment.observations}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Alerta de Conflito */}
            {appointment.hasConflict && (
              <Card className="p-4 bg-red-50 border-red-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-red-900 mb-1">
                      Conflito Detectado
                    </div>
                    <p className="text-sm text-red-700">
                      {appointment.conflictReason}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </ScrollArea>

        {/* Barra de Ações Fixas */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 space-y-2 shadow-lg">
          <div className="grid grid-cols-2 gap-2">
            {onEdit && (
              <Button variant="outline" onClick={onEdit} className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            {onComplete && (
              <Button
                variant="outline"
                onClick={onComplete}
                className="w-full border-green-200 text-green-700 hover:bg-green-50"
              >
                <Check className="h-4 w-4 mr-2" />
                Concluir
              </Button>
            )}
          </div>
          {onDelete && (
            <Button
              variant="destructive"
              onClick={onDelete}
              className="w-full"
            >
              <Trash className="h-4 w-4 mr-2" />
              Cancelar Agendamento
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileAppointmentSheet;

