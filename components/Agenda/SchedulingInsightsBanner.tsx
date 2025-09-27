import React from 'react';
import { ClockAlert, CalendarClock, Users } from 'lucide-react';
import { SchedulingAlert, WaitlistEntry } from '../../types';

interface SchedulingInsightsBannerProps {
  alerts: SchedulingAlert[];
  waitlistEntries: WaitlistEntry[];
}

const SchedulingInsightsBanner: React.FC<SchedulingInsightsBannerProps> = ({ alerts, waitlistEntries }) => {
  if (!alerts.length && !waitlistEntries.length) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex flex-wrap gap-3 text-sm text-amber-800">
      {alerts.map(alert => (
        <div key={alert.id} className="flex items-center gap-2">
          <ClockAlert className="w-4 h-4" />
          <span>{alert.alertType === 'patient_no_show_warning' ? 'Paciente com múltiplas faltas' : alert.alertType === 'open_slot' ? 'Horário vago há mais de 24h' : 'Paciente inativo'}</span>
        </div>
      ))}
      {waitlistEntries.length > 0 && (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>{waitlistEntries.length} paciente(s) aguardando encaixe</span>
        </div>
      )}
      <div className="flex items-center gap-2 ml-auto">
        <CalendarClock className="w-4 h-4" />
        <span>Otimize sua agenda usando templates ou fila de espera</span>
      </div>
    </div>
  );
};

export default SchedulingInsightsBanner;

