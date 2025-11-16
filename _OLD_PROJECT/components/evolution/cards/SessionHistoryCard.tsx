import React from 'react';
import { History, Eye, Repeat, Calendar } from 'lucide-react';
import { SoapNote } from '../../../types';
import CollapsibleCard from '../CollapsibleCard';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../contexts/ToastContext';

interface SessionHistoryCardProps {
  sessionHistory: SoapNote[];
  patientId: string;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  onRepeatSession?: (note: SoapNote) => void;
}

/**
 * Card com histórico das últimas sessões do paciente
 */
const SessionHistoryCard: React.FC<SessionHistoryCardProps> = ({
  sessionHistory,
  patientId,
  defaultExpanded = true,
  onToggle,
  onRepeatSession,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleViewDetails = (note: SoapNote) => {
    // Mostra detalhes em alert (pode ser modal no futuro)
    const details = `
SESSÃO: ${note.date}

SUBJETIVO (S):
${note.subjective || 'Não informado'}

OBJETIVO (O):
${note.objective || 'Não informado'}

AVALIAÇÃO (A):
${note.assessment || 'Não informado'}

PLANO (P):
${note.plan || 'Não informado'}

${note.painScale !== undefined ? `Dor: ${note.painScale}/10` : ''}
    `.trim();

    alert(details);
  };

  const handleRepeatSession = (note: SoapNote) => {
    if (onRepeatSession) {
      onRepeatSession(note);
      showToast('Conduta da sessão anterior carregada!', 'success');
    } else {
      showToast('Funcionalidade será implementada', 'info');
    }
  };

  // Mostra apenas as 5 últimas sessões
  const recentSessions = sessionHistory.slice(0, 5);

  return (
    <CollapsibleCard
      id="session-history"
      title={`Histórico de Sessões (${sessionHistory.length})`}
      icon={<History className="w-5 h-5" />}
      defaultExpanded={defaultExpanded}
      onToggle={onToggle}
    >
      {recentSessions.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-sm">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p>Nenhuma sessão registrada ainda</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {recentSessions.map((note, idx) => (
            <div
              key={note.id || idx}
              className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-700">
                      #{sessionHistory.length - idx}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{note.date}</p>
                    {note.therapist && (
                      <p className="text-xs text-slate-500">{note.therapist}</p>
                    )}
                  </div>
                </div>

                {/* Score de Dor */}
                {note.painScale !== undefined && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium whitespace-nowrap">
                    Dor: {note.painScale}/10
                  </span>
                )}
              </div>

              {/* Preview do conteúdo */}
              <div className="text-xs text-slate-600 mb-2 line-clamp-2">
                <strong>S:</strong> {note.subjective?.substring(0, 80)}
                {note.subjective && note.subjective.length > 80 ? '...' : ''}
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetails(note)}
                  className="flex-1 px-2 py-1.5 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md transition-colors flex items-center justify-center gap-1"
                  title="Ver detalhes completos"
                >
                  <Eye className="w-3 h-3" />
                  Ver
                </button>
                <button
                  onClick={() => handleRepeatSession(note)}
                  className="flex-1 px-2 py-1.5 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors flex items-center justify-center gap-1"
                  title="Repetir conteúdo desta sessão"
                >
                  <Repeat className="w-3 h-3" />
                  Repetir
                </button>
              </div>
            </div>
          ))}

          {/* Link para ver todas */}
          {sessionHistory.length > 5 && (
            <button
              onClick={() => navigate(`/patients/${patientId}`)}
              className="w-full mt-2 py-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todas as {sessionHistory.length} sessões →
            </button>
          )}
        </div>
      )}
    </CollapsibleCard>
  );
};

export default SessionHistoryCard;

