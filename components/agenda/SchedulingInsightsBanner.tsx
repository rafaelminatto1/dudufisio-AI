import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Alert, AlertTriangle, Users } from 'lucide-react';

interface SchedulingAlert {
  id: string;
  type: 'warning' | 'info' | 'error';
  message: string;
  timestamp: Date;
}

interface WaitlistEntry {
  id: string;
  patientName: string;
  preferredDate: Date;
  therapistId?: string;
}

interface SchedulingInsightsBannerProps {
  alerts: SchedulingAlert[];
  waitlistEntries: WaitlistEntry[];
}

const SchedulingInsightsBanner: React.FC<SchedulingInsightsBannerProps> = ({
  alerts = [],
  waitlistEntries = []
}) => {
  const hasAlerts = alerts.length > 0;
  const hasWaitlist = waitlistEntries.length > 0;

  if (!hasAlerts && !hasWaitlist) {
    return null;
  }

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {hasAlerts && (
            <div className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {alerts.length} alerta{alerts.length > 1 ? 's' : ''} de agendamento
              </span>
            </div>
          )}

          {hasWaitlist && (
            <div className="flex items-center gap-2 text-blue-600">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">
                {waitlistEntries.length} paciente{waitlistEntries.length > 1 ? 's' : ''} na lista de espera
              </span>
            </div>
          )}
        </div>

        {hasAlerts && alerts.length > 0 && (
          <div className="mt-2 text-xs text-gray-600">
            Último alerta: {alerts[0].message}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SchedulingInsightsBanner;