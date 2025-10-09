/**
 * 📝 Lead Detail Panel - Painel lateral com detalhes completos do lead
 */

import React, { useEffect, useState } from 'react';
import {
  X,
  Phone,
  Mail,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Tag,
  AlertCircle,
  CheckCircle2,
  Send,
  Sparkles
} from 'lucide-react';
import { leadService } from '../../services/crm/leadService';
import { whatsappCrmService } from '../../services/crm/whatsappCrmService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadDetailPanelProps {
  leadId: string;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated: () => void;
}

export const LeadDetailPanel: React.FC<LeadDetailPanelProps> = ({
  leadId,
  isOpen,
  onClose,
  onLeadUpdated,
}) => {
  const [lead, setLead] = useState<any>(null);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    if (isOpen && leadId) {
      loadLead();
      loadInteractions();
    }
  }, [leadId, isOpen]);

  const loadLead = async () => {
    try {
      const data = await leadService.getLeadById(leadId);
      setLead(data);
      setSelectedStatus(data.status);
    } catch (err) {
      console.error('Erro ao carregar lead:', err);
    }
  };

  const loadInteractions = async () => {
    try {
      const data = await leadService.getLeadInteractions(leadId);
      setInteractions(data);
    } catch (err) {
      console.error('Erro ao carregar interações:', err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === lead.status) return;

    try {
      setLoading(true);
      await leadService.updateLead(leadId, { status: newStatus });
      await loadLead();
      onLeadUpdated();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setLoading(true);
      await leadService.addInteraction(leadId, {
        type: 'note',
        direction: 'outbound',
        content: newNote
      });
      setNewNote('');
      await loadInteractions();
    } catch (err) {
      console.error('Erro ao adicionar nota:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!whatsappMessage.trim() || !lead?.phone) return;

    try {
      setLoading(true);
      await whatsappCrmService.sendMessage({
        to: lead.phone,
        message: whatsappMessage,
        lead_id: leadId
      });
      setWhatsappMessage('');
      await loadInteractions();
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!confirm('Deseja converter este lead em paciente?')) return;

    try {
      setLoading(true);
      await leadService.convertToPatient(leadId);
      alert('Lead convertido com sucesso!');
      onLeadUpdated();
      onClose();
    } catch (err) {
      console.error('Erro ao converter lead:', err);
      alert('Erro ao converter lead');
    } finally {
      setLoading(false);
    }
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

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-2xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {lead.name}
            </h2>
            <Badge variant="outline" className={getEngagementColor(lead.engagement_level)}>
              {lead.engagement_level}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Score: {lead.lead_score}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            Lead desde {new Date(lead.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-6 h-6" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-100px)]">
        <div className="p-6 space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{lead.phone}</span>
              </div>
              {lead.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{lead.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Fonte: {lead.source}</span>
              </div>
            </CardContent>
          </Card>

          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status & Engajamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status do Lead
                </label>
                <Select value={selectedStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Novo</SelectItem>
                    <SelectItem value="contacted">Contato Inicial</SelectItem>
                    <SelectItem value="qualified">Qualificado</SelectItem>
                    <SelectItem value="proposal_sent">Proposta Enviada</SelectItem>
                    <SelectItem value="negotiation">Negociação</SelectItem>
                    <SelectItem value="won">Convertido</SelectItem>
                    <SelectItem value="lost">Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-600">Interações</p>
                  <p className="text-2xl font-bold">{lead.total_interactions}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Último contato</p>
                  <p className="text-sm font-semibold">
                    {lead.last_contact_at ? formatDistanceToNow(new Date(lead.last_contact_at), {
                      addSuffix: true,
                      locale: ptBR
                    }) : 'Nunca'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interested In */}
          {lead.interested_in && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interesse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{lead.interested_in}</p>
              </CardContent>
            </Card>
          )}

          {/* WhatsApp Message */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Enviar mensagem via WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Digite sua mensagem..."
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleSendWhatsApp}
                disabled={loading || !whatsappMessage.trim()}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar via WhatsApp
              </Button>
            </CardContent>
          </Card>

          {/* Interactions Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Histórico de Interações</CardTitle>
            </CardHeader>
            <CardContent>
              {interactions.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Nenhuma interação registrada</p>
              ) : (
                <div className="space-y-3">
                  {interactions.map((interaction) => (
                    <div
                      key={interaction.id}
                      className="bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{interaction.type}</Badge>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(interaction.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                      </div>
                      {interaction.content && (
                        <p className="text-sm text-gray-700">{interaction.content}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Note */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Adicionar Nota</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Digite sua nota..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleAddNote}
                disabled={loading || !newNote.trim()}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Adicionar Nota
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleConvert}
                disabled={loading || lead.status === 'won'}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Converter em Paciente
              </Button>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default LeadDetailPanel;

