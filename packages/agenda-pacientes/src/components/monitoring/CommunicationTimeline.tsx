import React, { useState, useMemo } from 'react';
import { Search, MessageCircle, Phone, Mail, FileText, Filter, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Card } from '../ui/card';

export interface CommunicationLog {
  id: string;
  patientId: string;
  type: 'WhatsApp' | 'Ligação' | 'Email' | 'Observação' | 'Nota';
  date: string;
  notes: string;
  actor: string;
  attachments?: { name: string; url: string }[];
}

interface CommunicationTimelineProps {
  communications: CommunicationLog[];
  onAddCommunication?: () => void;
}

export const CommunicationTimeline: React.FC<CommunicationTimelineProps> = ({
  communications,
  onAddCommunication,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredCommunications = useMemo(() => {
    let filtered = [...communications];

    // Filtrar por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        comm =>
          comm.notes.toLowerCase().includes(term) ||
          comm.actor.toLowerCase().includes(term)
      );
    }

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(comm => comm.type === filterType);
    }

    // Ordenar por data (mais recente primeiro)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [communications, searchTerm, filterType]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'WhatsApp':
        return <MessageCircle className="w-5 h-5 text-green-600" />;
      case 'Ligação':
        return <Phone className="w-5 h-5 text-blue-600" />;
      case 'Email':
        return <Mail className="w-5 h-5 text-purple-600" />;
      case 'Observação':
      case 'Nota':
        return <FileText className="w-5 h-5 text-slate-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const configs: Record<string, { bg: string; text: string }> = {
      WhatsApp: { bg: 'bg-green-100', text: 'text-green-800' },
      'Ligação': { bg: 'bg-blue-100', text: 'text-blue-800' },
      Email: { bg: 'bg-purple-100', text: 'text-purple-800' },
      'Observação': { bg: 'bg-slate-100', text: 'text-slate-800' },
      Nota: { bg: 'bg-amber-100', text: 'text-amber-800' },
    };
    const config = configs[type] || { bg: 'bg-slate-100', text: 'text-slate-800' };
    return (
      <Badge variant="outline" className={`${config.bg} ${config.text} border-none text-xs`}>
        {type}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Ontem às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `Há ${diffDays} dias`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header com filtros */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar em comunicações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
            <SelectItem value="Ligação">Ligação</SelectItem>
            <SelectItem value="Email">Email</SelectItem>
            <SelectItem value="Observação">Observação</SelectItem>
            <SelectItem value="Nota">Nota</SelectItem>
          </SelectContent>
        </Select>

        {onAddCommunication && (
          <Button onClick={onAddCommunication} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Nova
          </Button>
        )}
      </div>

      {/* Timeline */}
      <ScrollArea className="h-[600px] pr-4">
        {filteredCommunications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">Nenhuma comunicação encontrada</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchTerm || filterType !== 'all' 
                ? 'Tente ajustar os filtros' 
                : 'Ainda não há histórico de comunicações'}
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Linha vertical da timeline */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

            <div className="space-y-6">
              <AnimatePresence>
                {filteredCommunications.map((comm, index) => (
                  <motion.div
                    key={comm.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative pl-14"
                  >
                    {/* Ícone da timeline */}
                    <div className="absolute left-4 top-1 w-5 h-5 bg-white rounded-full border-2 border-slate-300 flex items-center justify-center z-10">
                      {getIcon(comm.type)}
                    </div>

                    {/* Card de comunicação */}
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeBadge(comm.type)}
                          <span className="text-xs text-slate-500">{formatDate(comm.date)}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{comm.actor}</span>
                      </div>

                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{comm.notes}</p>

                      {comm.attachments && comm.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {comm.attachments.map((attachment, idx) => (
                            <a
                              key={idx}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              {attachment.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Resumo */}
      {filteredCommunications.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t">
          <span>{filteredCommunications.length} comunicaç{filteredCommunications.length > 1 ? 'ões' : 'ão'}</span>
          {(searchTerm || filterType !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              className="h-7 text-xs"
            >
              Limpar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

