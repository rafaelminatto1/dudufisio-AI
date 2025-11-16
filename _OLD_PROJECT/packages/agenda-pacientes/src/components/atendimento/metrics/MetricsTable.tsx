// components/atendimento/metrics/MetricsTable.tsx
import React, { useMemo } from 'react';
import { TrendingDown, TrendingUp, Minus, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SessionMetric {
  sessionDate: string;
  painScale: number;
  rom?: number; // Range of Motion (amplitude de movimento)
  strength?: number; // Força muscular (0-5)
  functional?: number; // Capacidade funcional (0-10)
  notes?: string;
}

interface MetricsTableProps {
  sessions: SessionMetric[];
  maxSessions?: number;
}

export const MetricsTable: React.FC<MetricsTableProps> = ({ sessions, maxSessions = 5 }) => {
  // Ordenar por data (mais recente primeiro) e limitar
  const sortedSessions = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
      .slice(0, maxSessions);
  }, [sessions, maxSessions]);

  // Calcular tendências (comparar com sessão anterior)
  const getTrend = (current: number, previous: number | undefined, inverse = false) => {
    if (previous === undefined) return 'neutral';

    const diff = current - previous;
    if (Math.abs(diff) < 0.5) return 'neutral';

    // Para dor, menor é melhor (inverse = true)
    // Para ROM/força/funcional, maior é melhor (inverse = false)
    if (inverse) {
      return diff < 0 ? 'positive' : 'negative';
    } else {
      return diff > 0 ? 'positive' : 'negative';
    }
  };

  // Renderizar ícone de tendência
  const renderTrendIcon = (trend: string) => {
    if (trend === 'positive') {
      return <TrendingDown className="w-4 h-4 text-green-600" />;
    } else if (trend === 'negative') {
      return <TrendingUp className="w-4 h-4 text-red-600" />;
    } else {
      return <Minus className="w-4 h-4 text-yellow-600" />;
    }
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // Calcular média de cada métrica
  const averages = useMemo(() => {
    if (sortedSessions.length === 0) return null;

    const sum = sortedSessions.reduce(
      (acc, session) => ({
        pain: acc.pain + session.painScale,
        rom: acc.rom + (session.rom || 0),
        strength: acc.strength + (session.strength || 0),
        functional: acc.functional + (session.functional || 0),
      }),
      { pain: 0, rom: 0, strength: 0, functional: 0 }
    );

    return {
      pain: (sum.pain / sortedSessions.length).toFixed(1),
      rom: (sum.rom / sortedSessions.length).toFixed(0),
      strength: (sum.strength / sortedSessions.length).toFixed(1),
      functional: (sum.functional / sortedSessions.length).toFixed(1),
    };
  }, [sortedSessions]);

  if (sortedSessions.length === 0) {
    return (
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">Nenhuma sessão anterior encontrada</p>
        <p className="text-sm text-slate-500 mt-1">
          Complete esta sessão para começar o acompanhamento de métricas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Evolução de Métricas</h3>
        <div className="text-sm text-slate-500">
          Últimas {sortedSessions.length} sessões
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Data</th>
              <th className="text-center py-3 px-4 font-semibold text-slate-700">
                Dor (EVA)
              </th>
              <th className="text-center py-3 px-4 font-semibold text-slate-700">
                ADM (%)
              </th>
              <th className="text-center py-3 px-4 font-semibold text-slate-700">
                Força
              </th>
              <th className="text-center py-3 px-4 font-semibold text-slate-700">
                Funcional
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedSessions.map((session, index) => {
              const previousSession = sortedSessions[index + 1];

              const painTrend = getTrend(session.painScale, previousSession?.painScale, true);
              const romTrend = getTrend(session.rom || 0, previousSession?.rom);
              const strengthTrend = getTrend(session.strength || 0, previousSession?.strength);
              const functionalTrend = getTrend(session.functional || 0, previousSession?.functional);

              return (
                <motion.tr
                  key={session.sessionDate}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  {/* Data */}
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {formatDate(session.sessionDate)}
                    {index === 0 && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Mais recente
                      </span>
                    )}
                  </td>

                  {/* Dor */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={`font-semibold ${
                          session.painScale <= 3
                            ? 'text-green-600'
                            : session.painScale <= 6
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {session.painScale}/10
                      </span>
                      {index > 0 && renderTrendIcon(painTrend)}
                    </div>
                  </td>

                  {/* ADM (Amplitude de Movimento) */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      {session.rom !== undefined ? (
                        <>
                          <span className="font-semibold text-slate-700">{session.rom}%</span>
                          {index > 0 && renderTrendIcon(romTrend)}
                        </>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </div>
                  </td>

                  {/* Força */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      {session.strength !== undefined ? (
                        <>
                          <span className="font-semibold text-slate-700">{session.strength}/5</span>
                          {index > 0 && renderTrendIcon(strengthTrend)}
                        </>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </div>
                  </td>

                  {/* Funcional */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      {session.functional !== undefined ? (
                        <>
                          <span className="font-semibold text-slate-700">
                            {session.functional}/10
                          </span>
                          {index > 0 && renderTrendIcon(functionalTrend)}
                        </>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>

          {/* Footer com médias */}
          {averages && (
            <tfoot className="bg-blue-50 border-t-2 border-blue-200">
              <tr>
                <td className="py-3 px-4 font-bold text-blue-900">Média</td>
                <td className="py-3 px-4 text-center font-bold text-blue-900">
                  {averages.pain}/10
                </td>
                <td className="py-3 px-4 text-center font-bold text-blue-900">
                  {averages.rom}%
                </td>
                <td className="py-3 px-4 text-center font-bold text-blue-900">
                  {averages.strength}/5
                </td>
                <td className="py-3 px-4 text-center font-bold text-blue-900">
                  {averages.functional}/10
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Legenda */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Legenda</h4>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-medium text-slate-700 mb-1">Tendências:</p>
            <ul className="space-y-1 text-slate-600">
              <li className="flex items-center gap-2">
                <TrendingDown className="w-3 h-3 text-green-600" />
                <span>Melhora (↓ dor ou ↑ capacidade)</span>
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-red-600" />
                <span>Piora (↑ dor ou ↓ capacidade)</span>
              </li>
              <li className="flex items-center gap-2">
                <Minus className="w-3 h-3 text-yellow-600" />
                <span>Estável (sem mudança significativa)</span>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-slate-700 mb-1">Métricas:</p>
            <ul className="space-y-1 text-slate-600">
              <li><strong>EVA:</strong> Escala Visual Analógica de dor (0-10)</li>
              <li><strong>ADM:</strong> Amplitude de Movimento (%)</li>
              <li><strong>Força:</strong> Força muscular (0-5, escala MRC)</li>
              <li><strong>Funcional:</strong> Capacidade funcional (0-10)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
