import React from 'react';
import { AlertTriangle, User, Clock, Calendar, XCircle, Lightbulb } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Conflict } from '../../services/scheduling/conflictDetectionService';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';

interface ConflictWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  conflicts: Conflict[];
  patientName?: string;
  therapistName?: string;
  alternativeTimes?: Date[];
}

const ConflictWarningDialog: React.FC<ConflictWarningDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  conflicts,
  patientName,
  therapistName,
  alternativeTimes = []
}) => {
  const handleUseAlternativeTime = (time: Date) => {
    // TODO: Implementar lógica para usar o horário alternativo
    console.log('Usar horário alternativo:', time);
    onClose();
  };
  const getConflictIcon = (type: Conflict['type']) => {
    switch (type) {
      case 'same_patient':
        return User;
      case 'same_therapist':
        return Calendar;
      case 'min_interval':
        return Clock;
      case 'workload_exceeded':
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  const getConflictColor = (severity: Conflict['severity']) => {
    return severity === 'error' ? 'destructive' : 'default';
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="w-5 h-5" />
            Conflito Detectado
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {conflicts.length === 1 
              ? 'Foi detectado um conflito com este agendamento:'
              : `Foram detectados ${conflicts.length} conflitos com este agendamento:`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 my-4">
          {conflicts.map((conflict, index) => {
            const Icon = getConflictIcon(conflict.type);
            const color = getConflictColor(conflict.severity);

            return (
              <div
                key={index}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50"
              >
                <div className="flex items-start gap-2">
                  <Icon className="w-4 h-4 mt-0.5 text-slate-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-900">
                        {conflict.message}
                      </span>
                      <Badge variant={color} className="text-xs">
                        {conflict.severity === 'error' ? 'Erro' : 'Aviso'}
                      </Badge>
                    </div>
                    
                    {conflict.conflictingAppointments && conflict.conflictingAppointments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {conflict.conflictingAppointments.slice(0, 2).map((appointment, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-slate-600 bg-white px-2 py-1 rounded border border-slate-200"
                          >
                            <div className="font-medium">
                              {appointment.patientName || 'Paciente desconhecido'}
                            </div>
                            <div className="text-slate-500 mt-0.5">
                              {new Date(appointment.startTime).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })} - {new Date(appointment.endTime).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        ))}
                        {conflict.conflictingAppointments && conflict.conflictingAppointments.length > 2 && (
                          <div className="text-xs text-slate-500 text-center py-1">
                            +{conflict.conflictingAppointments.length - 2} mais
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Alternative Times Suggestions */}
        {alternativeTimes.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Horários Alternativos Disponíveis</p>
                <p className="text-xs text-green-700 mt-1">
                  Sugerimos estes horários próximos sem conflitos:
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {alternativeTimes.slice(0, 3).map((time, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleUseAlternativeTime(time)}
                  className="w-full justify-start bg-white hover:bg-green-50 border-green-300 text-green-700"
                >
                  <Clock className="w-3 h-3 mr-2" />
                  {format(time, "EEEE, dd/MM 'às' HH:mm", { locale: ptBR })}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Deseja continuar mesmo assim?</p>
              <p className="text-xs text-blue-700">
                O agendamento será criado e marcado com aviso de conflito.
                Você poderá resolvê-lo posteriormente.
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="w-full sm:w-auto">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
          >
            Agendar Mesmo Assim
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConflictWarningDialog;

