// components/atendimento/tabs/MetricsTab.tsx
import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Activity, TrendingUp } from 'lucide-react';

import PainScale from '../../PainScale';
import { BodyMapInteractive } from '../metrics/BodyMapInteractive';
import { MetricsTable } from '../metrics/MetricsTable';
import type { AttendanceFormData } from '../../../schemas/attendanceFormValidation';

interface MetricsTabProps {
  sessions?: any[]; // Sessões anteriores para comparação
}

export const MetricsTab: React.FC<MetricsTabProps> = ({ sessions = [] }) => {
  const { watch, setValue } = useFormContext<AttendanceFormData>();
  const formData = watch();

  // Preparar dados de sessões para a MetricsTable
  const sessionMetrics = useMemo(() => {
    return sessions
      .filter((s) => s.painScale !== undefined)
      .map((session) => ({
        sessionDate: session.date || session.createdAt,
        painScale: session.painScale || 0,
        rom: session.rom,
        strength: session.strength,
        functional: session.functional,
        notes: session.notes,
      }));
  }, [sessions]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          Avaliações e Métricas
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Escala de dor, mapa corporal e métricas de acompanhamento
        </p>
      </div>

      {/* Escala de Dor */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-slate-900">😣 Escala de Dor (EVA)</h3>
          {formData.painScale !== undefined && (
            <span className="text-sm text-slate-500">
              - Atual: <strong>{formData.painScale}/10</strong>
            </span>
          )}
        </div>
        <PainScale
          selectedScore={formData.painScale}
          onSelectScore={(score) => setValue('painScale', score, { shouldDirty: true })}
        />
      </div>

      {/* Mapa Corporal Interativo */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <BodyMapInteractive />
      </div>

      {/* Tabela de Métricas Comparativas */}
      {sessionMetrics.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Histórico e Evolução</h3>
          </div>
          <MetricsTable sessions={sessionMetrics} maxSessions={5} />
        </div>
      )}

      {/* Dica de preenchimento */}
      {sessionMetrics.length === 0 && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Dica:</strong> Complete esta sessão para começar o acompanhamento de métricas
            ao longo do tratamento. A cada nova sessão, você poderá visualizar a evolução do
            paciente.
          </p>
        </div>
      )}
    </div>
  );
};
