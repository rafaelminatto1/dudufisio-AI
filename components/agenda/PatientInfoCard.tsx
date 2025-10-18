import React from 'react';
import { User, Phone, Mail, Calendar, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Patient } from '../../types';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';

interface PatientInfoCardProps {
  patient: Patient;
  showLastSession?: boolean;
  lastSessionDate?: Date;
  className?: string;
  onClick?: () => void;
}

const PatientInfoCard: React.FC<PatientInfoCardProps> = ({
  patient,
  showLastSession = false,
  lastSessionDate,
  className,
  onClick
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Inactive':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Discharged':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 bg-white rounded-lg border border-slate-200 shadow-sm",
        onClick && "cursor-pointer hover:shadow-md hover:border-sky-300 transition-all",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="w-12 h-12 flex-shrink-0">
          <AvatarImage src={patient.avatarUrl} alt={patient.name} />
          <AvatarFallback className="bg-sky-100 text-sky-700 font-semibold">
            {getInitials(patient.name)}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h4 className="font-semibold text-slate-900 truncate">
              {patient.name}
            </h4>
            <Badge 
              variant="secondary" 
              className={cn("text-xs flex-shrink-0", getStatusColor(patient.status))}
            >
              {patient.status}
            </Badge>
          </div>

          {/* Contact Info */}
          <div className="space-y-1.5">
            {patient.phone && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{patient.phone}</span>
              </div>
            )}

            {patient.email && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{patient.email}</span>
              </div>
            )}

            {patient.cpf && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{patient.cpf}</span>
              </div>
            )}

            {showLastSession && lastSessionDate && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Última sessão: {format(lastSessionDate, "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            )}
          </div>

          {/* Medical Alerts */}
          {patient.medicalAlerts && (
            <div className="mt-2 px-2 py-1 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              ⚠️ {patient.medicalAlerts}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientInfoCard;

