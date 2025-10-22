import React, { useState, useEffect } from 'react';
import { Clock, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../contexts/ToastContext';
import * as sessionEvolutionService from '../../services/sessionEvolutionService';
import * as soapNoteService from '../../services/soapNoteService';
import { SessionEvolution, SoapNote } from '../../types';

/**
 * Painel de Histórico de Sessões
 * Lista últimas sessões com cards colapsáveis
 * Botão para replicar conduta
 */

interface SessionHistoryPanelProps {
  patientId: string;
  limit?: number;
  onReplicateConduct?: (session: SessionEvolution | SoapNote) => void;
}

export const SessionHistoryPanel: React.FC<SessionHistoryPanelProps> = ({
  patientId,
  limit = 10,
  onReplicateConduct,
}) => {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<SoapNote[]>([]);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, [patientId]);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const notes = await soapNoteService.getNotesByPatientId(patientId);
      const sorted = notes
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
      setSessions(sorted);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      showToast('Erro ao carregar histórico de sessões', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSession = (sessionId: string) => {
    setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId);
  };

  const handleReplicate = (session: SoapNote) => {
    if (onReplicateConduct) {
      onReplicateConduct(session);
      showToast('Conduta replicada com sucesso', 'success');
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-slate-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Nenhuma sessão anterior encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Últimas Sessões</h3>
        <span className="text-sm text-slate-500">{sessions.length} sessões</span>
      </div>

      {sessions.map((session, index) => {
        const isExpanded = expandedSessionId === session.id;
        const sessionDate = new Date(session.date);

        return (
          <div
            key={session.id}
            className="border border-slate-200 rounded-lg bg-white hover:shadow-md transition-shadow"
          >
            {/* Header - Sempre visível */}
            <button
              onClick={() => toggleSession(session.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 rounded-t-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                  {index + 1}
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-900">
                    Sessão #{session.sessionNumber || index + 1}
                  </p>
                  <p className="text-xs text-slate-500">
                    {sessionDate.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {session.painScale !== undefined && (
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                    Dor: {session.painScale}/10
                  </span>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {/* Conteúdo Expandido */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3">
                {/* SOAP Content */}
                {session.subjective && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">Subjetivo</p>
                    <p className="text-sm text-slate-600">{session.subjective}</p>
                  </div>
                )}

                {session.objective && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">Objetivo</p>
                    <p className="text-sm text-slate-600">{session.objective}</p>
                  </div>
                )}

                {session.assessment && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">Avaliação</p>
                    <p className="text-sm text-slate-600">{session.assessment}</p>
                  </div>
                )}

                {session.plan && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">Plano/Conduta</p>
                    <p className="text-sm text-slate-600">{session.plan}</p>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReplicate(session)}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Replicar Esta Conduta</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SessionHistoryPanel;

