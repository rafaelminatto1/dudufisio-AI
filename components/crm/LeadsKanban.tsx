/**
 * 📊 Leads Kanban - Drag & Drop Pipeline Board
 * Visual pipeline for managing leads through stages
 */

import React, { useEffect, useState } from 'react';
import { leadService } from '../../services/crm/leadService';
import { Phone, Mail, Clock, AlertCircle, Sparkles, Calendar, MessageSquare, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LeadDetailPanel } from './LeadDetailPanel';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: string;
  lead_score: number;
  engagement_level: 'hot' | 'warm' | 'cold';
  source: string;
  last_contact_at?: string;
  total_interactions: number;
  interested_in?: string;
}

const STAGES = [
  { id: 'new', label: 'Novo', color: 'bg-gray-500' },
  { id: 'contacted', label: 'Contato Inicial', color: 'bg-blue-500' },
  { id: 'qualified', label: 'Qualificado', color: 'bg-purple-500' },
  { id: 'proposal_sent', label: 'Proposta Enviada', color: 'bg-yellow-500' },
  { id: 'negotiation', label: 'Negociação', color: 'bg-orange-500' },
  { id: 'won', label: 'Convertido', color: 'bg-green-500' }
];

export default function LeadsKanban() {
  const [leadsByStage, setLeadsByStage] = useState<Record<string, Lead[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const grouped: Record<string, Lead[]> = {};

      // Load leads for each stage
      for (const stage of STAGES) {
        const leads = await leadService.getLeadsByStage(stage.id);
        grouped[stage.id] = leads;
      }

      setLeadsByStage(grouped);
    } catch (err) {
      console.error('Erro ao carregar leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'hot':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'warm':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'cold':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getEngagementLabel = (level: string) => {
    switch (level) {
      case 'hot':
        return '🔥 Quente';
      case 'warm':
        return '☀️ Morno';
      case 'cold':
        return '❄️ Frio';
      default:
        return level;
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsPanelOpen(true);
  };

  const handleLeadUpdated = () => {
    loadLeads(); // Reload leads after update
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Carregando pipeline...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const leads = leadsByStage[stage.id] || [];
          const totalScore = leads.reduce((sum, lead) => sum + lead.lead_score, 0);
          const avgScore = leads.length > 0 ? Math.round(totalScore / leads.length) : 0;

          return (
            <div key={stage.id} className="flex-shrink-0 w-80">
              <Card className="h-full shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <CardTitle className="text-sm font-semibold">
                        {stage.label}
                      </CardTitle>
                    </div>
                    <Badge variant="outline">{leads.length}</Badge>
                  </div>
                  {leads.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Sparkles className="w-3 h-3" />
                      <span>Score médio: {avgScore}</span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="p-2">
                  <ScrollArea className="h-[calc(100vh-400px)]">
                    <div className="space-y-2 pr-2">
                      {leads.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          Nenhum lead
                        </div>
                      ) : (
                        leads.map((lead) => (
                          <Card
                            key={lead.id}
                            className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                            style={{
                              borderLeftColor: lead.engagement_level === 'hot' ? '#ef4444' :
                                               lead.engagement_level === 'warm' ? '#f59e0b' :
                                               '#3b82f6'
                            }}
                            onClick={() => handleLeadClick(lead)}
                          >
                            <CardContent className="p-3">
                              {/* Lead Header */}
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                                      {getInitials(lead.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h4 className="font-semibold text-sm">{lead.name}</h4>
                                    <p className="text-xs text-gray-500">{lead.source}</p>
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {lead.lead_score}
                                </Badge>
                              </div>

                              {/* Engagement Level */}
                              <Badge
                                variant="outline"
                                className={`text-xs mb-2 ${getEngagementColor(lead.engagement_level)}`}
                              >
                                {getEngagementLabel(lead.engagement_level)}
                              </Badge>

                              {/* Contact Info */}
                              <div className="space-y-1 mb-2">
                                {lead.phone && (
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Phone className="w-3 h-3" />
                                    <span>{lead.phone}</span>
                                  </div>
                                )}
                                {lead.email && (
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Mail className="w-3 h-3" />
                                    <span className="truncate">{lead.email}</span>
                                  </div>
                                )}
                              </div>

                              {/* Interested In */}
                              {lead.interested_in && (
                                <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                                  <strong>Interesse:</strong> {lead.interested_in}
                                </p>
                              )}

                              {/* Stats */}
                              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  <span>{lead.total_interactions} interações</span>
                                </div>
                                {lead.last_contact_at && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                      {formatDistanceToNow(new Date(lead.last_contact_at), {
                                        addSuffix: true,
                                        locale: ptBR
                                      })}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* View Details */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-2 text-xs"
                              >
                                Ver detalhes
                                <ChevronRight className="w-3 h-3 ml-1" />
                              </Button>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Lead Detail Panel */}
      {isPanelOpen && selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => {
            setIsPanelOpen(false);
            setSelectedLead(null);
          }}
          onUpdate={handleLeadUpdated}
        />
      )}
    </div>
  );
}

