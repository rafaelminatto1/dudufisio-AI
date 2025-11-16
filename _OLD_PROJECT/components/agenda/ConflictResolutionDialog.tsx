import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import {
  AlertTriangle,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import type { EnrichedAppointment } from '../../types';
import { AppointmentStatus } from '../../types';
import { cn } from '../../lib/utils';

interface ConflictResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflictingAppointments: EnrichedAppointment[];
  newAppointment: Partial<EnrichedAppointment>;
  onResolve: (resolution: 'cancel' | 'reschedule' | 'force') => void;
  suggestedSlots?: Array<{ date: Date; time: string }>;
}

export function ConflictResolutionDialog({
  open,
  onOpenChange,
  conflictingAppointments,
  newAppointment,
  onResolve,
  suggestedSlots = [],
}: ConflictResolutionDialogProps) {
  const [selectedResolution, setSelectedResolution] = useState<
    'cancel' | 'reschedule' | 'force' | null
  >(null);

  const handleResolve = (resolution: 'cancel' | 'reschedule' | 'force') => {
    setSelectedResolution(resolution);
    setTimeout(() => {
      onResolve(resolution);
      setSelectedResolution(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            Conflito de Horário Detectado
          </DialogTitle>
          <DialogDescription className="text-base">
            Já existe(m){' '}
            <strong className="text-orange-600">
              {conflictingAppointments.length} agendamento(s)
            </strong>{' '}
            neste horário. Escolha como deseja prosseguir.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-4 pr-4">
            {/* Novo Agendamento */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-500 rounded-full" />
                Novo Agendamento
              </h3>
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-blue-900">
                        {newAppointment.patientName}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-blue-700">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {newAppointment.startTime &&
                          format(newAppointment.startTime, "d 'de' MMM", {
                            locale: ptBR,
                          })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {newAppointment.startTime &&
                          newAppointment.endTime &&
                          `${format(newAppointment.startTime, 'HH:mm')} - ${format(
                            newAppointment.endTime,
                            'HH:mm'
                          )}`}
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>

            {/* Conflitos Existentes */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <div className="w-1 h-4 bg-red-500 rounded-full" />
                Conflitos Existentes ({conflictingAppointments.length})
              </h3>
              <div className="space-y-2">
                {conflictingAppointments.map((apt, index) => (
                  <Card
                    key={apt.id}
                    className={cn(
                      'p-3 border-l-4 transition-all',
                      index === 0 ? 'border-l-red-500' : 'border-l-orange-400'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-600" />
                          <span className="font-semibold text-slate-900">
                            {apt.patientName}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(apt.startTime, 'HH:mm')} - {format(apt.endTime, 'HH:mm')}
                          </div>
                          <Separator orientation="vertical" className="h-4" />
                          <span>{apt.therapistName}</span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'ml-2',
                          apt.status === AppointmentStatus.Completed
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        )}
                      >
                        {apt.status === AppointmentStatus.Completed ? 'Concluído' : 'Agendado'}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Horários Sugeridos */}
            {suggestedSlots.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <div className="w-1 h-4 bg-green-500 rounded-full" />
                  Horários Disponíveis Sugeridos
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedSlots.map((slot, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="justify-start hover:bg-green-50 hover:border-green-300"
                      onClick={() => handleResolve('reschedule')}
                    >
                      <Clock className="h-3 w-3 mr-2" />
                      {format(slot.date, "d 'de' MMM", { locale: ptBR })} às {slot.time}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator className="my-4" />

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => handleResolve('cancel')}
            disabled={selectedResolution !== null}
            className="w-full sm:w-auto"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancelar
          </Button>

          {suggestedSlots.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => handleResolve('reschedule')}
              disabled={selectedResolution !== null}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reagendar
            </Button>
          )}

          <Button
            variant="default"
            onClick={() => handleResolve('force')}
            disabled={selectedResolution !== null}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Agendar Mesmo Assim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConflictResolutionDialog;

