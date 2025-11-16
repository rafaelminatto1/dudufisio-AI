/**
 * WhatsApp Messages Panel
 * Painel de gerenciamento de mensagens WhatsApp
 * DuduFisio-AI
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  Send,
  CheckCheck,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getMetaWhatsAppService } from '@/services/whatsapp/MetaWhatsAppService';

interface WhatsAppMessage {
  id: string;
  phone: string;
  direction: 'inbound' | 'outbound';
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  lead?: {
    name: string;
  };
  patient?: {
    name: string;
  };
}

interface WhatsAppMessagesPanelProps {
  clinicId: string;
}

export const WhatsAppMessagesPanel: React.FC<WhatsAppMessagesPanelProps> = ({ clinicId }) => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDirection, setSelectedDirection] = useState<'all' | 'inbound' | 'outbound'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Envio de mensagem
  const [selectedPhone, setSelectedPhone] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMessages();
    
    // Configurar atualização automática a cada 30 segundos
    const interval = setInterval(loadMessages, 30000);
    return () => clearInterval(interval);
  }, [clinicId]);

  useEffect(() => {
    filterMessages();
  }, [messages, searchTerm, selectedDirection, selectedStatus]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select(`
          *,
          lead:leads(name),
          patient:patients(name)
        `)
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = [...messages];

    // Filtrar por direção
    if (selectedDirection !== 'all') {
      filtered = filtered.filter(m => m.direction === selectedDirection);
    }

    // Filtrar por status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(m => m.status === selectedStatus);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.phone.includes(searchTerm) ||
        m.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.lead?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMessages(filtered);
  };

  const sendMessage = async () => {
    if (!selectedPhone || !messageContent) return;

    setSending(true);
    try {
      const whatsapp = getMetaWhatsAppService();
      await whatsapp.sendTextMessage(selectedPhone, messageContent, clinicId);

      setMessageContent('');
      setSelectedPhone('');
      
      // Recarregar mensagens
      await loadMessages();

      alert('Mensagem enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Verifique os logs.');
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCheck className="h-4 w-4 text-gray-500" />;
      case 'delivered':
        return <CheckCheck className="h-4 w-4 text-blue-500" />;
      case 'read':
        return <CheckCheck className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      read: 'bg-purple-100 text-purple-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || colors.pending}>
        {status}
      </Badge>
    );
  };

  const exportMessages = () => {
    const csv = [
      ['Data', 'Telefone', 'Direção', 'Conteúdo', 'Status'],
      ...filteredMessages.map(m => [
        new Date(m.created_at).toLocaleString(),
        m.phone,
        m.direction === 'inbound' ? 'Recebida' : 'Enviada',
        m.content || '',
        m.status,
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-messages-${new Date().toISOString()}.csv`;
    a.click();
  };

  const stats = {
    total: messages.length,
    sent: messages.filter(m => m.direction === 'outbound').length,
    received: messages.filter(m => m.direction === 'inbound').length,
    delivered: messages.filter(m => m.status === 'delivered' || m.status === 'read').length,
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">mensagens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviadas</CardTitle>
            <Send className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent}</div>
            <p className="text-xs text-muted-foreground">mensagens enviadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recebidas</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.received}</div>
            <p className="text-xs text-muted-foreground">mensagens recebidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregues</CardTitle>
            <CheckCheck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">taxa de entrega</p>
          </CardContent>
        </Card>
      </div>

      {/* Painel Principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mensagens WhatsApp</CardTitle>
              <CardDescription>
                Gerencie as mensagens enviadas e recebidas via WhatsApp
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMessages}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportMessages}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="messages" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="messages">Mensagens</TabsTrigger>
              <TabsTrigger value="send">Enviar Mensagem</TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="space-y-4">
              {/* Filtros */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por telefone, nome ou conteúdo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <select
                  value={selectedDirection}
                  onChange={(e) => setSelectedDirection(e.target.value as any)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Todas</option>
                  <option value="inbound">Recebidas</option>
                  <option value="outbound">Enviadas</option>
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Todos os status</option>
                  <option value="sent">Enviada</option>
                  <option value="delivered">Entregue</option>
                  <option value="read">Lida</option>
                  <option value="failed">Falhou</option>
                </select>
              </div>

              {/* Lista de Mensagens */}
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Carregando mensagens...
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma mensagem encontrada
                    </div>
                  ) : (
                    filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 border rounded-lg ${
                          message.direction === 'inbound'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={message.direction === 'inbound' ? 'default' : 'secondary'}>
                              {message.direction === 'inbound' ? '📥 Recebida' : '📤 Enviada'}
                            </Badge>
                            {getStatusBadge(message.status)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {getStatusIcon(message.status)}
                            {new Date(message.created_at).toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold">
                              {message.lead?.name || message.patient?.name || message.phone}
                            </span>
                            <span className="text-muted-foreground">({message.phone})</span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="send" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Telefone (com código do país)</label>
                  <Input
                    placeholder="5511999999999"
                    value={selectedPhone}
                    onChange={(e) => setSelectedPhone(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Formato: 55 + DDD + Número (apenas números)
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Mensagem</label>
                  <textarea
                    className="w-full min-h-[200px] p-3 border rounded-md"
                    placeholder="Digite sua mensagem..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {messageContent.length} caracteres
                  </p>
                </div>

                <Button
                  onClick={sendMessage}
                  disabled={sending || !selectedPhone || !messageContent}
                  className="w-full"
                >
                  {sending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

