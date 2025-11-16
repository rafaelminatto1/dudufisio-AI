/**
 * 💬 Unified Inbox - Real-time WhatsApp Chat Interface
 * Displays conversations list and message thread with real-time updates
 */

import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import {
  Search,
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Clock,
  AlertCircle
} from 'lucide-react';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { ptBR } from 'date-fns/locale';

export default function UnifiedInbox() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Get all conversations
  const { conversations, loading: conversationsLoading } = useWhatsAppConversations();

  // Get messages for selected conversation
  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const {
    messages,
    loading: messagesLoading,
    isConnected,
    sendMessage,
    unreadCount
  } = useWhatsAppRealtime({
    patient_id: selectedConv?.patient_id,
    lead_id: selectedConv?.lead_id,
    autoMarkAsRead: true
  });

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const success = await sendMessage(messageInput);
    if (success) {
      setMessageInput('');
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

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.phone.includes(searchQuery)
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'pending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-250px)]">
      {/* Conversations List */}
      <Card className="col-span-4 shadow-md">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            {conversationsLoading ? (
              <div className="p-4 text-center text-gray-500">
                Carregando conversas...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Phone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhuma conversa encontrada</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {getInitials(conv.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-sm truncate">{conv.name}</h3>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(conv.last_message_at), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conv.last_message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {conv.phone}
                          </Badge>
                          {conv.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conv.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="col-span-8 shadow-md">
        {selectedConversation ? (
          <CardContent className="p-0 h-full flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    {getInitials(selectedConv?.name || '')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedConv?.name}</h3>
                  <p className="text-sm text-gray-600">{selectedConv?.phone}</p>
                </div>
                {isConnected && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                    Online
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Carregando mensagens...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Nenhuma mensagem ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isOutbound = msg.metadata?.direction === 'outbound';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isOutbound
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                          <div className={`flex items-center gap-1 mt-1 justify-end ${
                            isOutbound ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">
                              {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {isOutbound && getStatusIcon(msg.status)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            <Separator />

            {/* Message Input */}
            <div className="p-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Smile className="w-5 h-5" />
                </Button>
                <Input
                  placeholder="Digite sua mensagem..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Phone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Selecione uma conversa</p>
              <p className="text-sm">Escolha uma conversa da lista para começar</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
