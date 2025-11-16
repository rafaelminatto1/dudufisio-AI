// components/PatientTooltip.tsx
import React from 'react';
import { Phone, AlertTriangle } from 'lucide-react';

interface PatientTooltipProps {
  appointment: EnrichedAppointment;
  x: number;
  y: number;
}

const PatientTooltip: React.FC<PatientTooltipProps> = ({ appointment, x, y }) => {
  return (
    <div
      style={{ top: y, left: x, transform: 'translate(10px, -100%)' }}
      className="absolute z-20 w-64 p-3 bg-white border border-slate-200 text-slate-900 text-sm rounded-lg shadow-2xl pointer-events-none animate-fade-in-fast"
    >
      <h4 className="font-bold mb-2 text-slate-900">{appointment.patientName}</h4>
      {appointment.sessionNumber && appointment.totalSessions && (
          <p className="text-xs text-slate-600 mb-2">
            Sessão: <strong>{appointment.sessionNumber}</strong> de <strong>{appointment.totalSessions}</strong>
          </p>
      )}
      <div className="flex items-center mb-2">
        <Phone className="w-4 h-4 mr-2 text-slate-500" />
        <span className="text-slate-700">{appointment.patientPhone || 'Não informado'}</span>
      </div>
      {appointment.patientMedicalAlerts && (
        <div className="flex items-start p-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-md">
           <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
           <p className="text-xs">{appointment.patientMedicalAlerts}</p>
        </div>
      )}
       <style>{`
            @keyframes fade-in-fast {
                from { opacity: 0; transform: translate(10px, -95%); }
                to { opacity: 1; transform: translate(10px, -100%); }
            }
            .animate-fade-in-fast { animation: fade-in-fast 0.15s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default PatientTooltip;