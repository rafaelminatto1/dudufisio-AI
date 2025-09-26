import React, { useState } from 'react';
import { History, Calendar, User, Eye, Copy, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { SoapNote } from '../../types';
import MarkdownRenderer from '../ui/MarkdownRenderer';

interface SessionHistoryProps {
  patientNotes: SoapNote[];
  onRepeatConduct?: (note: SoapNote) => void;
  className?: string;
}

interface ExpandedNote {
  [key: string]: boolean;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({
  patientNotes,
  onRepeatConduct,
  className = ''
}) => {
  const [expandedNotes, setExpandedNotes] = useState<ExpandedNote>({});

  const toggleExpanded = (noteId: string) => {
    setExpandedNotes(prev => ({
      ...prev,
      [noteId]: !prev[noteId]
    }));
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getSessionStatusColor = (sessionNumber: number, totalSessions?: number): string => {
    if (!totalSessions) return 'bg-slate-100 text-slate-700';
    
    const progress = (sessionNumber / totalSessions) * 100;
    if (progress < 33) return 'bg-red-100 text-red-700';
    if (progress < 66) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const SessionCard: React.FC<{ note: SoapNote; index: number }> = ({ note, index }) => {
    const isExpanded = expandedNotes[note.id];
    const isLatest = index === 0;

    return (
      <div className={`bg-white border rounded-lg overflow-hidden transition-all duration-200 ${
        isLatest ? 'border-blue-200 shadow-md' : 'border-slate-200 hover:shadow-sm'
      }`}>
        {/* Header */}
        <div className={`p-4 ${isLatest ? 'bg-blue-50' : 'bg-slate-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                isLatest ? 'bg-blue-500 text-white' : 'bg-slate-500 text-white'
              }`}>
                {note.sessionNumber || index + 1}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">
                  Sessão #{note.sessionNumber || index + 1}
                  {isLatest && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Última</span>}
                </h4>
                <p className="text-sm text-slate-600">
                  {formatDate(note.date)} - {note.therapist}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onRepeatConduct && (
                <button
                  onClick={() => onRepeatConduct(note)}
                  className="flex items-center px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Repetir
                </button>
              )}
              <button
                onClick={() => toggleExpanded(note.id)}
                className="flex items-center px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <Eye className="w-3 h-3 mr-1" />
                {isExpanded ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-4 border-t">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subjetivo */}
              <div className="space-y-2">
                <h5 className="font-medium text-slate-900 flex items-center">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                    S
                  </span>
                  Subjetivo
                </h5>
                <div className="bg-slate-50 rounded-lg p-3 text-sm">
                  <MarkdownRenderer content={note.subjective} />
                </div>
              </div>

              {/* Objetivo */}
              <div className="space-y-2">
                <h5 className="font-medium text-slate-900 flex items-center">
                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                    O
                  </span>
                  Objetivo
                </h5>
                <div className="bg-slate-50 rounded-lg p-3 text-sm">
                  <MarkdownRenderer content={note.objective} />
                </div>
              </div>

              {/* Avaliação */}
              <div className="space-y-2">
                <h5 className="font-medium text-slate-900 flex items-center">
                  <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                    A
                  </span>
                  Avaliação
                </h5>
                <div className="bg-slate-50 rounded-lg p-3 text-sm">
                  <MarkdownRenderer content={note.assessment} />
                </div>
              </div>

              {/* Plano */}
              <div className="space-y-2">
                <h5 className="font-medium text-slate-900 flex items-center">
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                    P
                  </span>
                  Plano
                </h5>
                <div className="bg-slate-50 rounded-lg p-3 text-sm">
                  <MarkdownRenderer content={note.plan} />
                </div>
              </div>
            </div>

            {/* Métricas Adicionais */}
            {note.painScale !== undefined && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-red-800">Escala de Dor:</span>
                  <span className="text-lg font-bold text-red-600">{note.painScale}/10</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const SummaryCard: React.FC = () => {
    const totalSessions = patientNotes.length;
    const latestSession = patientNotes[0];
    const firstSession = patientNotes[patientNotes.length - 1];
    
    const treatmentDuration = firstSession && latestSession 
      ? Math.floor((new Date(latestSession.date).getTime() - new Date(firstSession.date).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
          <History className="w-5 h-5 mr-2" />
          Resumo do Tratamento
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{totalSessions}</p>
            <p className="text-xs text-slate-600">Sessões Realizadas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{treatmentDuration}</p>
            <p className="text-xs text-slate-600">Dias de Tratamento</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {latestSession ? formatDate(latestSession.date) : 'N/A'}
            </p>
            <p className="text-xs text-slate-600">Última Sessão</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {firstSession ? formatDate(firstSession.date) : 'N/A'}
            </p>
            <p className="text-xs text-slate-600">Primeira Sessão</p>
          </div>
        </div>
      </div>
    );
  };

  if (patientNotes.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p className="text-slate-500">Nenhuma sessão registrada ainda</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Resumo */}
      <SummaryCard />

      {/* Lista de Sessões */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Histórico de Sessões ({patientNotes.length})
        </h3>
        {patientNotes.map((note, index) => (
          <SessionCard key={note.id} note={note} index={index} />
        ))}
      </div>
    </div>
  );
};

export default SessionHistory;
