import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  Tag, 
  AlertCircle,
  FileText,
  TrendingUp,
  Activity,
  MessageCircle,
  Pin,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { SessionObservation, ObservationFilters } from '../../types';
import { getPatientObservations } from '../../services/patientTrackingService';
import { format, parseISO, isToday, isYesterday, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ObservationFeedProps {
  patientId: string;
  onAddObservation?: () => void;
}

const observationTypeConfig = {
  general: {
    label: 'Geral',
    icon: MessageCircle,
    color: 'bg-slate-100 text-slate-700',
    borderColor: 'border-slate-300'
  },
  clinical: {
    label: 'Clínico',
    icon: Activity,
    color: 'bg-blue-100 text-blue-700',
    borderColor: 'border-blue-300'
  },
  evolution: {
    label: 'Evolução',
    icon: TrendingUp,
    color: 'bg-green-100 text-green-700',
    borderColor: 'border-green-300'
  },
  assessment: {
    label: 'Avaliação',
    icon: FileText,
    color: 'bg-purple-100 text-purple-700',
    borderColor: 'border-purple-300'
  },
  alert: {
    label: 'Alerta',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-700',
    borderColor: 'border-red-300'
  },
  recommendation: {
    label: 'Recomendação',
    icon: FileText,
    color: 'bg-amber-100 text-amber-700',
    borderColor: 'border-amber-300'
  }
};

export const ObservationFeed: React.FC<ObservationFeedProps> = ({
  patientId,
  onAddObservation
}) => {
  const [observations, setObservations] = useState<SessionObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ObservationFilters>({});

  useEffect(() => {
    loadObservations();
  }, [patientId, filters]);

  const loadObservations = async () => {
    try {
      setLoading(true);
      const data = await getPatientObservations(patientId, filters);
      setObservations(data);
    } catch (error) {
      console.error('Erro ao carregar observações:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return 'Hoje';
    } else if (isYesterday(date)) {
      return 'Ontem';
    } else if (differenceInDays(new Date(), date) < 7) {
      return format(date, 'EEEE', { locale: ptBR });
    } else {
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    }
  };

  const formatTime = (dateString: string) => {
    return format(parseISO(dateString), 'HH:mm', { locale: ptBR });
  };

  // Agrupar observações por data
  const groupedObservations = observations.reduce((groups, obs) => {
    const date = formatDate(obs.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(obs);
    return groups;
  }, {} as Record<string, SessionObservation[]>);

  const shouldTruncate = (content: string) => content.length > 200;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-slate-600">Carregando observações...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Observações de Acompanhamento
              <Badge variant="secondary">{observations.length}</Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              {onAddObservation && (
                <Button size="sm" onClick={onAddObservation}>
                  Nova Observação
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="filter-type" className="text-sm font-medium mb-2 block">Tipo</label>
                <select
                  id="filter-type"
                  className="w-full border rounded-md px-3 py-2"
                  value={filters.type || ''}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value as any || undefined })}
                >
                  <option value="">Todos os tipos</option>
                  {Object.entries(observationTypeConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-date-from" className="text-sm font-medium mb-2 block">Data inicial</label>
                <input
                  id="filter-date-from"
                  type="date"
                  className="w-full border rounded-md px-3 py-2"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
                />
              </div>

              <div>
                <label htmlFor="filter-date-to" className="text-sm font-medium mb-2 block">Data final</label>
                <input
                  id="filter-date-to"
                  type="date"
                  className="w-full border rounded-md px-3 py-2"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({})}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Feed de Observações */}
      {Object.keys(groupedObservations).length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">Nenhuma observação encontrada</p>
              <p className="text-sm text-slate-500 mb-4">
                Comece adicionando observações de acompanhamento do paciente
              </p>
              {onAddObservation && (
                <Button onClick={onAddObservation}>
                  Adicionar Primeira Observação
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedObservations).map(([date, obsArray]) => (
            <div key={date}>
              {/* Data Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-sm font-medium text-slate-600 px-3">
                  {date}
                </span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              {/* Observações do Dia */}
              <div className="space-y-3">
                {obsArray.map((obs) => {
                  const config = observationTypeConfig[obs.observationType];
                  const Icon = config.icon;
                  const isExpanded = expandedIds.has(obs.id);
                  const needsTruncation = shouldTruncate(obs.content);
                  const displayContent = !isExpanded && needsTruncation
                    ? obs.content.substring(0, 200) + '...'
                    : obs.content;

                  return (
                    <Card
                      key={obs.id}
                      className={`${config.borderColor} border-l-4 ${
                        obs.isImportant ? 'bg-yellow-50' : ''
                      } ${obs.isPinned ? 'shadow-md' : ''}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className={`${config.color} rounded-full p-2 h-fit`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className={config.color}>
                                  {config.label}
                                </Badge>
                                {obs.isImportant && (
                                  <Badge variant="destructive">Importante</Badge>
                                )}
                                {obs.isPinned && (
                                  <Badge variant="outline" className="gap-1">
                                    <Pin className="w-3 h-3" />
                                    Fixado
                                  </Badge>
                                )}
                                {obs.timing && (
                                  <Badge variant="outline">
                                    {obs.timing === 'before' && 'Antes'}
                                    {obs.timing === 'during' && 'Durante'}
                                    {obs.timing === 'after' && 'Após'}
                                    {obs.timing === 'independent' && 'Independente'}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-slate-500 whitespace-nowrap">
                                {formatTime(obs.createdAt)}
                              </span>
                            </div>

                            {/* Conteúdo */}
                            <p className="text-slate-700 mb-3 whitespace-pre-wrap">
                              {displayContent}
                            </p>

                            {/* Botão Expandir */}
                            {needsTruncation && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpanded(obs.id)}
                                className="mb-2"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="w-4 h-4 mr-1" />
                                    Ver menos
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-4 h-4 mr-1" />
                                    Ver mais
                                  </>
                                )}
                              </Button>
                            )}

                            {/* Footer */}
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {obs.authorName}
                              </div>
                              {obs.sessionId && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Sessão
                                </div>
                              )}
                            </div>

                            {/* Tags */}
                            {obs.tags && obs.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {obs.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded"
                                  >
                                    <Tag className="w-3 h-3" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ObservationFeed;

