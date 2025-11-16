import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { EnrichedAppointment } from '../../types';
import { calendarSyncService, CalendarProvider } from '../../services/calendarSyncService';
import { Calendar, CheckCircle, Copy, Download, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarSyncDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: EnrichedAppointment;
}

const CalendarSyncDialog: React.FC<CalendarSyncDialogProps> = ({
  isOpen,
  onClose,
  appointment
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await calendarSyncService.copyEventToClipboard(appointment);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSync = (provider: CalendarProvider) => {
    calendarSyncService.openCalendarProvider(provider, appointment);
  };

  const calendarOptions = [
    {
      provider: 'google' as CalendarProvider,
      name: 'Google Calendar',
      description: 'Adicionar ao Google Calendar',
      icon: '📅',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      provider: 'outlook' as CalendarProvider,
      name: 'Outlook',
      description: 'Adicionar ao Outlook Calendar',
      icon: '📆',
      color: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100'
    },
    {
      provider: 'apple' as CalendarProvider,
      name: 'Apple Calendar',
      description: 'Download arquivo .ics',
      icon: '🍎',
      color: 'bg-slate-50 border-slate-200 hover:bg-slate-100'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Sincronizar com Calendário
          </DialogTitle>
          <DialogDescription>
            Adicione este agendamento ao seu calendário preferido
          </DialogDescription>
        </DialogHeader>

        {/* Appointment Summary */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">
                {appointment.type} - {appointment.patientName}
              </h3>
              <Badge>{appointment.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-slate-600">Data:</span>
                <p className="font-medium">
                  {format(appointment.startTime, "dd/MM/yyyy (EEEE)", { locale: ptBR })}
                </p>
              </div>
              <div>
                <span className="text-slate-600">Horário:</span>
                <p className="font-medium">
                  {format(appointment.startTime, 'HH:mm')} - {format(appointment.endTime, 'HH:mm')}
                </p>
              </div>
            </div>
            {appointment.therapistName && (
              <div className="text-sm">
                <span className="text-slate-600">Terapeuta:</span>
                <p className="font-medium">{appointment.therapistName}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Calendar Options */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-slate-700">
            Escolha seu calendário:
          </h3>
          
          <div className="space-y-2">
            {calendarOptions.map((option) => (
              <Card
                key={option.provider}
                className={cn(
                  "p-4 cursor-pointer border-2 transition-all hover:scale-[1.02] hover:shadow-md",
                  option.color
                )}
                onClick={() => handleSync(option.provider)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{option.icon}</div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{option.name}</h4>
                      <p className="text-xs text-slate-600">{option.description}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-slate-400" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar Info
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => calendarSyncService.generateICalFile(appointment)}
          >
            <Download className="w-4 h-4" />
            Download .ics
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-slate-500 text-center space-y-1">
          <p>
            💡 O arquivo .ics funciona com a maioria dos aplicativos de calendário
          </p>
          <p>
            ⏰ Um lembrete será configurado 30 minutos antes da consulta
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarSyncDialog;

