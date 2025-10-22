import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';

interface CapacityWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  patientName?: string;
  timeSlot: string;
  currentCount: number;
  maxCapacity: number;
  evaluationCount?: number;
  maxEvaluations?: number;
  isEvaluationLimit?: boolean;
}

const CapacityWarningDialog: React.FC<CapacityWarningDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  patientName,
  timeSlot,
  currentCount,
  maxCapacity,
  evaluationCount = 0,
  maxEvaluations = 1,
  isEvaluationLimit = false
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="capacity-warning-title"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 id="capacity-warning-title" className="text-lg font-semibold text-slate-900 mb-2">
                Atenção: Limite de Capacidade
              </h3>
              
              {isEvaluationLimit ? (
                <div className="text-sm text-slate-600 space-y-2">
                  <p>
                    O horário <strong>{timeSlot}</strong> já possui <strong>{evaluationCount}</strong> avaliação(ões) agendada(s).
                  </p>
                  <p>
                    O limite máximo de avaliações por horário é <strong>{maxEvaluations}</strong> devido à limitação de sala.
                  </p>
                  <p className="text-amber-700 font-medium">
                    Agendar esta avaliação causará conflito operacional.
                  </p>
                </div>
              ) : (
                <div className="text-sm text-slate-600 space-y-2">
                  <p>
                    O horário <strong>{timeSlot}</strong> já possui <strong>{currentCount}</strong> paciente(s) agendado(s).
                  </p>
                  <p>
                    A capacidade máxima para este horário é de <strong>{maxCapacity}</strong> profissional(is).
                  </p>
                  <p className="text-amber-700 font-medium">
                    {currentCount >= maxCapacity 
                      ? `Agendar ${patientName ? `${patientName}` : 'este paciente'} causará sobrecarga.`
                      : `Agendar ${patientName ? `${patientName}` : 'este paciente'} atingirá o limite máximo.`
                    }
                  </p>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-slate-50 rounded-md border border-slate-200">
                <p className="text-xs text-slate-600">
                  <strong>Dica:</strong> Considere horários alternativos ou redistribuir os atendimentos para evitar sobrecarga da equipe.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 rounded-b-lg border-t">
          <Button
            onClick={onClose}
            variant="outline"
            className="text-sm"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-amber-600 hover:bg-amber-700 text-white text-sm"
          >
            Agendar Mesmo Assim
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CapacityWarningDialog;

