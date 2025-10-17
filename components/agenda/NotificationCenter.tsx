import React, { useState, useMemo } from 'react';
import { Bell, AlertTriangle, Users, Clock, CheckCircle, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { EnrichedAppointment, WaitlistEntry } from '../../types';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'conflict' | 'waitlist' | 'overdue' | 'upcoming';
  title: string;
  message: string;
  timestamp: Date;
  action?: () => void;
  appointment?: EnrichedAppointment;
  waitlistEntry?: WaitlistEntry;
}

interface NotificationCenterProps {
  appointments: EnrichedAppointment[];
  waitlistEntries: WaitlistEntry[];
  onViewConflict?: (appointment: EnrichedAppointment) => void;
  onViewWaitlist?: () => void;
  onViewAppointment?: (appointment: EnrichedAppointment) => void;
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  appointments,
  waitlistEntries,
  onViewConflict,
  onViewWaitlist,
  onViewAppointment,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const notifications = useMemo(() => {
    const notifs: Notification[] = [];

    // Conflitos não resolvidos
    const conflicts = appointments.filter(a => a.hasConflict);
    conflicts.forEach(appointment => {
      notifs.push({
        id: `conflict-${appointment.id}`,
        type: 'conflict',
        title: 'Conflito Detectado',
        message: `Agendamento de ${appointment.patientName} tem conflito`,
        timestamp: appointment.startTime,
        appointment,
        action: () => {
          onViewConflict?.(appointment);
          setIsOpen(false);
        }
      });
    });

    // Lista de espera longa
    if (waitlistEntries.length > 5) {
      notifs.push({
        id: 'waitlist-long',
        type: 'waitlist',
        title: 'Lista de Espera',
        message: `${waitlistEntries.length} pacientes aguardando`,
        timestamp: new Date(),
        action: () => {
          onViewWaitlist?.();
          setIsOpen(false);
        }
      });
    }

    // Pacientes atrasados (agendamentos passados não concluídos)
    const now = new Date();
    const overdue = appointments.filter(a => 
      a.startTime < now && 
      a.status === 'scheduled'
    );
    overdue.forEach(appointment => {
      notifs.push({
        id: `overdue-${appointment.id}`,
        type: 'overdue',
        title: 'Paciente Atrasado',
        message: `${appointment.patientName} não compareceu`,
        timestamp: appointment.startTime,
        appointment,
        action: () => {
          onViewAppointment?.(appointment);
          setIsOpen(false);
        }
      });
    });

    // Próximos agendamentos (em 30 minutos)
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);
    const upcoming = appointments.filter(a =>
      a.startTime > now &&
      a.startTime <= thirtyMinutesFromNow &&
      a.status === 'scheduled'
    );
    upcoming.forEach(appointment => {
      notifs.push({
        id: `upcoming-${appointment.id}`,
        type: 'upcoming',
        title: 'Próximo Agendamento',
        message: `${appointment.patientName} em breve`,
        timestamp: appointment.startTime,
        appointment,
        action: () => {
          onViewAppointment?.(appointment);
          setIsOpen(false);
        }
      });
    });

    // Ordenar por timestamp (mais recentes primeiro)
    return notifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [appointments, waitlistEntries, onViewConflict, onViewWaitlist, onViewAppointment]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'conflict':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'waitlist':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'overdue':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'upcoming':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'conflict':
        return 'border-red-200 bg-red-50';
      case 'waitlist':
        return 'border-blue-200 bg-blue-50';
      case 'overdue':
        return 'border-orange-200 bg-orange-50';
      case 'upcoming':
        return 'border-green-200 bg-green-50';
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {notifications.length > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {notifications.length}
          </Badge>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-slate-200 z-50 max-h-[500px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Notificações</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {notifications.map(notification => (
                  <button
                    key={notification.id}
                    onClick={notification.action}
                    className={cn(
                      "w-full p-4 text-left hover:bg-slate-50 transition-colors",
                      getNotificationColor(notification.type)
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-slate-900 mb-1">
                          {notification.title}
                        </div>
                        <div className="text-xs text-slate-600 mb-2">
                          {notification.message}
                        </div>
                        <div className="text-xs text-slate-500">
                          {format(notification.timestamp, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-200 bg-slate-50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setIsOpen(false)}
              >
                Fechar
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

