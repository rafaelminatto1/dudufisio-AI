// components/atendimento/context/SessionHistoryCard.tsx
import React from 'react';
import { Eye, Repeat, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { SoapNote } from '../../../types';

interface SessionHistoryCardProps {
  sessions: SoapNote[];
  onViewSession?: (session: SoapNote) => void;
  onRepeatSession?: (session: SoapNote) => void;
}

export const SessionHistoryCard: React.FC<SessionHistoryCardProps> = ({
  sessions,
  onViewSession,
  onRepeatSession,
}) => {
  const recentSessions = sessions.slice(0, 3); // Últimas 3 sessões

  const getPainTrend = (currentPain?: number, previousPain?: number) => {
    if (currentPain === undefined || previousPain === undefined) return null;
    if (currentPain < previousPain) return 'down';
    if (currentPain > previousPain) return 'up';
    return 'same';
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Histórico (últimas 3)
      </h4>

      {recentSessions.length === 0 ? (
        <div className="text-center py-6 text-sm text-slate-500">
          Nenhuma sessão anterior
        </div>
      ) : (
        <div className="space-y-2">
          {recentSessions.map((session, index) => {
            const previousSession = recentSessions[index + 1];
            const trend = getPainTrend(session.painScale, previousSession?.painScale);

            return (
              <div
                key={session.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-medium text-slate-900">
                      {new Date(session.date).toLocaleDateString('pt-BR')}
                    </p>
                    {session.painScale !== undefined && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-slate-600">Dor: {session.painScale}/10</span>
                        {trend === 'down' && <TrendingDown className="w-3 h-3 text-green-500" />}
                        {trend === 'up' && <TrendingUp className="w-3 h-3 text-red-500" />}
                        {trend === 'same' && <Minus className="w-3 h-3 text-slate-400" />}
                      </div>
                    )}
                  </div>
                </div>

                {session.plan && (
                  <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                    {session.plan.substring(0, 80)}...
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewSession?.(session)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    Ver
                  </button>
                  <button
                    onClick={() => onRepeatSession?.(session)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors"
                  >
                    <Repeat className="w-3 h-3" />
                    Repetir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
