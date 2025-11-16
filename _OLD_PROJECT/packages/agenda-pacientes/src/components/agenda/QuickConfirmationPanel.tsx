import React, { useState, useMemo } from 'react';
import { CheckCircle, Clock, User, Phone } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { EnrichedAppointment } from '../../types';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';

interface QuickConfirmationPanelProps {
  appointments: EnrichedAppointment[];
  onConfirmPresence: (appointmentId: string) => void;
  onCall: (appointmentId: string, phone: string) => void;
  className?: string;
}

const QuickConfirmationPanel: React.FC<QuickConfirmationPanelProps> = ({
  appointments,
  onConfirmPresence,
  onCall,
  className
}) => {
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());

  // Filtrar agendamentos de hoje
  const todayAppointments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return appointments
      .filter(app => {
        const appDate = new Date(app.startTime);
        return appDate >= today && appDate < tomorrow && app.status === 'scheduled';
      })
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 10); // Máximo 10 agendamentos
  }, [appointments]);

  const handleConfirm = (appointmentId: string) => {
    setConfirmedIds(prev => new Set([...prev, appointmentId]));
    onConfirmPresence(appointmentId);
  };

  const handleCall = (appointmentId: string, phone: string) => {
    onCall(appointmentId, phone);
  };

  if (todayAppointments.length === 0) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="text-center py-8 text-slate-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm">Nenhum agendamento hoje</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Check-in Rápido</h3>
        <Badge variant="secondary">{todayAppointments.length} hoje</Badge>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {todayAppointments.map(appointment => {
          const isConfirmed = confirmedIds.has(appointment.id);
          const isUpcoming = new Date(appointment.startTime) > new Date();
          const isNow = new Date(appointment.startTime) <= new Date() && new Date(appointment.endTime) >= new Date();

          return (
            <div
              key={appointment.id}
              className={cn(
                "p-3 rounded-lg border transition",
                isConfirmed
                  ? "bg-green-50 border-green-200"
                  : isNow
                  ? "bg-blue-50 border-blue-200"
                  : "bg-white border-slate-200"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-slate-400" />
                    <p className="font-medium text-sm text-slate-900 truncate">
                      {appointment.patientName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Clock className="w-3 h-3" />
                    <span>{format(appointment.startTime, 'HH:mm', { locale: ptBR })}</span>
                    <span>•</span>
                    <span>{appointment.type || 'Não definido'}</span>
                  </div>
                  {appointment.patientPhone && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                      <Phone className="w-3 h-3" />
                      <span>{appointment.patientPhone}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  {!isConfirmed && (
                    <Button
                      size="sm"
                      onClick={() => handleConfirm(appointment.id)}
                      className="text-xs"
                      variant={isNow ? "default" : "outline"}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Confirmar
                    </Button>
                  )}
                  {isConfirmed && (
                    <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                      Confirmado
                    </Badge>
                  )}
                  {appointment.patientPhone && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCall(appointment.id, appointment.patientPhone)}
                      className="text-xs"
                    >
                      <Phone className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Confirmados hoje:</span>
          <span className="font-semibold text-green-600">
            {confirmedIds.size} / {todayAppointments.length}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default QuickConfirmationPanel;

