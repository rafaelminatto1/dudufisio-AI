/**
 * MandatoryMeasurementAlert - Alerta visual vermelho para medições obrigatórias
 * Nível A: Alerta visual que não bloqueia a ação
 */

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { AlertTriangle, ClipboardCheck, XCircle } from 'lucide-react';
import { Badge } from '../ui/badge';

interface MandatoryTest {
  id: string;
  testName: string;
  testType: string;
  frequencyType: string;
  lastPerformedDate?: string;
  nextDueDate?: string;
  notes?: string;
}

interface MandatoryMeasurementAlertProps {
  tests: MandatoryTest[];
  onRegisterMeasurement: (testId: string) => void;
  onDismiss?: (testId: string) => void;
  severity?: 'warning' | 'error' | 'info';
}

export const MandatoryMeasurementAlert: React.FC<MandatoryMeasurementAlertProps> = ({
  tests,
  onRegisterMeasurement,
  onDismiss,
  severity = 'error'
}) => {
  if (tests.length === 0) return null;

  const getSeverityStyles = () => {
    switch (severity) {
      case 'error':
        return {
          container: 'border-red-500 bg-red-50',
          icon: 'text-red-600',
          title: 'text-red-900',
          description: 'text-red-800',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          container: 'border-yellow-500 bg-yellow-50',
          icon: 'text-yellow-600',
          title: 'text-yellow-900',
          description: 'text-yellow-800',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
      default:
        return {
          container: 'border-blue-500 bg-blue-50',
          icon: 'text-blue-600',
          title: 'text-blue-900',
          description: 'text-blue-800',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <Alert className={`${styles.container} animate-pulse`}>
      <AlertTriangle className={`h-5 w-5 ${styles.icon}`} />
      <AlertTitle className={`text-sm font-semibold ${styles.title}`}>
        ⚠️ Medição Obrigatória Pendente
      </AlertTitle>
      <AlertDescription className={`mt-2 ${styles.description}`}>
        <div className="space-y-3">
          {/* Lista de testes obrigatórios */}
          <ul className="space-y-2">
            {tests.map((test) => (
              <li 
                key={test.id}
                className="flex items-start justify-between gap-3 p-3 bg-white/70 rounded-lg border border-red-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{test.testName}</span>
                    {test.frequencyType === 'every_session' && (
                      <Badge variant="destructive" className="text-xs">
                        Obrigatória
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-600">
                    Tipo: {test.testType}
                    {test.lastPerformedDate && (
                      <span className="ml-2">
                        Última medição: {new Date(test.lastPerformedDate).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  {test.notes && (
                    <p className="text-xs text-slate-500 mt-1">{test.notes}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className={`${styles.button} text-white`}
                    onClick={() => onRegisterMeasurement(test.id)}
                  >
                    <ClipboardCheck className="w-3 h-3 mr-1" />
                    Registrar
                  </Button>
                  {onDismiss && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDismiss(test.id)}
                      className="text-red-700 hover:text-red-900 hover:bg-red-100"
                    >
                      <XCircle className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Informação adicional */}
          <div className="text-xs text-slate-600 bg-white/50 p-2 rounded border border-red-200">
            <strong>Importante:</strong> Estas medições são obrigatórias para o protocolo de tratamento.
            Registre-as antes de finalizar a sessão.
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default MandatoryMeasurementAlert;

