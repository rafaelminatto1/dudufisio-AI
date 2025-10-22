import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { MandatoryTestAlert as MandatoryTestAlertType } from '../../types';

/**
 * Banner de alerta para testes obrigatórios
 * 3 níveis de severidade:
 * - Crítico: Banner vermelho + bloqueia salvamento
 * - Importante: Banner laranja + permite salvar com aviso
 * - Leve: Banner azul + apenas notificação
 */

interface MandatoryTestAlertProps {
  alerts: MandatoryTestAlertType[];
  onRegisterException?: (alert: MandatoryTestAlertType) => void;
}

export const MandatoryTestAlert: React.FC<MandatoryTestAlertProps> = ({
  alerts,
  onRegisterException,
}) => {
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.isCompleted);
  const importantAlerts = alerts.filter(a => a.severity === 'important' && !a.isCompleted);
  const lowAlerts = alerts.filter(a => a.severity === 'low' && !a.isCompleted);
  const completedAlerts = alerts.filter(a => a.isCompleted);

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Alertas Críticos */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-900 mb-2 flex items-center space-x-2">
                <span>🚨 TESTES OBRIGATÓRIOS</span>
                <span className="px-2 py-0.5 bg-red-200 text-red-900 text-xs rounded-full">
                  {criticalAlerts.length}
                </span>
              </h4>
              
              <ul className="space-y-2 mb-3">
                {criticalAlerts.map(alert => (
                  <li key={alert.id} className="flex items-start space-x-2">
                    <span className="text-red-600 mt-1">•</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-900">
                        {alert.testName}
                      </p>
                      <p className="text-xs text-red-700 mt-0.5">
                        {alert.reason}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="bg-red-100 border border-red-300 rounded-md p-3">
                <p className="text-xs font-semibold text-red-900 mb-1">
                  ⚠️ ATENÇÃO
                </p>
                <p className="text-xs text-red-800">
                  A sessão não poderá ser salva sem realizar estes testes obrigatórios.
                  São testes críticos para a segurança e acompanhamento adequado do paciente.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alertas Importantes */}
      {importantAlerts.length > 0 && (
        <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 mb-2 flex items-center space-x-2">
                <span>⚠️ Testes Recomendados</span>
                <span className="px-2 py-0.5 bg-orange-200 text-orange-900 text-xs rounded-full">
                  {importantAlerts.length}
                </span>
              </h4>
              
              <ul className="space-y-1.5">
                {importantAlerts.map(alert => (
                  <li key={alert.id} className="flex items-start space-x-2 text-sm">
                    <span className="text-orange-600 mt-0.5">•</span>
                    <div>
                      <span className="font-medium text-orange-900">
                        {alert.testName}
                      </span>
                      {alert.reason && (
                        <p className="text-xs text-orange-700 mt-0.5">
                          {alert.reason}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <p className="text-xs text-orange-700 mt-3">
                Estes testes são fortemente recomendados para este caso clínico.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alertas Leves (Sugestões) */}
      {lowAlerts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 text-sm mb-1">
                ℹ️ Sugestões de Testes
              </h4>
              <div className="flex flex-wrap gap-2">
                {lowAlerts.map(alert => (
                  <span
                    key={alert.id}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full"
                  >
                    {alert.testName}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Testes Completados */}
      {completedAlerts.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-green-900 text-sm mb-1">
                ✓ Testes Realizados
              </h4>
              <div className="flex flex-wrap gap-2">
                {completedAlerts.map(alert => (
                  <span
                    key={alert.id}
                    className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full"
                  >
                    {alert.testName}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MandatoryTestAlert;

