import React from 'react';
import { X, Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '../ui/button';
import { EnrichedAppointment } from '../../types';

interface RescheduleConfirmModalProps {
  isOpen: boolean;
  appointment: EnrichedAppointment;
  newStartTime: Date;
  newEndTime: Date;
  newTherapistId: string;
  newTherapistName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const RescheduleConfirmModal: React.FC<RescheduleConfirmModalProps> = ({
  isOpen,
  appointment,
  newStartTime,
  newEndTime,
  newTherapistId,
  newTherapistName,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  // Garantir que as datas sejam objetos Date
  const oldStartTime = new Date(appointment.startTime);
  const oldEndTime = new Date(appointment.endTime);
  const newStart = new Date(newStartTime);
  const newEnd = new Date(newEndTime);

  // O fisioterapeuta nunca muda mais (mantemos o original)
  const isTherapistChanged = false;
  const isDayChanged = format(oldStartTime, 'yyyy-MM-dd') !== format(newStart, 'yyyy-MM-dd');
  
  // Nome do fisioterapeuta com fallback para "Fisioterapeuta"
  const therapistDisplayName = appointment.therapistName || newTherapistName || 'Fisioterapeuta';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-slate-900 text-lg">Confirmar Alteração de Horário</h2>
          </div>
          <button onClick={onCancel} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </header>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Patient Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-xs text-blue-600">Paciente</div>
                <div className="font-semibold text-blue-900">{appointment.patientName}</div>
              </div>
            </div>
          </div>

          {/* Date/Time Changes */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-slate-700">Mudanças propostas:</div>
            
            {/* Current Date/Time */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="flex-1">
                <div className="text-xs text-slate-600 mb-1">Horário Atual</div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-900">
                    {format(oldStartTime, "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-900">
                    {format(oldStartTime, "HH:mm", { locale: ptBR })} - {format(oldEndTime, "HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-900">{therapistDisplayName}</span>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-blue-600" />
            </div>

            {/* New Date/Time */}
            <div className="flex items-center gap-3 p-3 bg-green-50 border-2 border-green-300 rounded-lg">
              <div className="flex-1">
                <div className="text-xs text-green-700 mb-1 font-semibold">Novo Horário</div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className={`font-semibold ${isDayChanged ? 'text-green-700' : 'text-slate-900'}`}>
                    {format(newStart, "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                  {isDayChanged && (
                    <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">Alterado</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-700">
                    {format(newStart, "HH:mm", { locale: ptBR })} - {format(newEnd, "HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <User className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-slate-900">
                    {therapistDisplayName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning if needed */}
          {isDayChanged && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ A data do agendamento será alterada.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <footer className="p-4 border-t bg-slate-50 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-4"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700 text-white px-6"
          >
            Confirmar Mudança
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default RescheduleConfirmModal;

