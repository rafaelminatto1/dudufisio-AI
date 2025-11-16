import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  MessageSquare,
  Send,
  Inbox,
  Archive,
  Loader2,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Message {
  id: string;
  subject: string;
  message: string;
  message_type: string;
  priority: string;
  status: string;
  sender_name: string;
  recipient_name: string;
  read_at: string | null;
  created_at: string;
}

export default function MessagesPage() {
  const { user } = useSupabaseAuth();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<'inbox' | 'sent' | 'archived'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Nova mensagem
  const [isComposing, setIsComposing] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user, selectedFolder]);

  const fetchMessages = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_messages', {
        p_folder: selectedFolder,
        p_limit: 50,
      });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
      showToast('Erro ao carregar mensagens.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message);

    // Marcar como lida se não lida
    if (message.status === 'unread' && selectedFolder === 'inbox') {
      try {
        await supabase.rpc('mark_message_read', { p_message_id: message.id });

        // Atualizar lista local
        setMessages((prev) =>
          prev.map((m) =>
            m.id === message.id ? { ...m, status: 'read', read_at: new Date().toISOString() } : m
          )
        );
      } catch (err) {
        console.error('Erro ao marcar como lida:', err);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !newMessage.trim()) return;

    setSending(true);
    try {
      // Buscar terapeuta do usuário (assumindo que paciente tem um terapeuta principal)
      const { data: therapistData } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'therapist')
        .limit(1)
        .single();

      if (!therapistData) {
        throw new Error('Terapeuta não encontrado');
      }

      const { data, error } = await supabase.rpc('send_patient_message', {
        p_recipient_id: therapistData.id,
        p_subject: newSubject || 'Sem assunto',
        p_message: newMessage,
        p_message_type: 'general',
        p_priority: 'normal',
      });

      if (error) throw error;

      showToast('Mensagem enviada com sucesso!', 'success');

      // Limpar formulário
      setNewSubject('');
      setNewMessage('');
      setIsComposing(false);

      // Recarregar mensagens
      fetchMessages();
    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err);
      showToast(err.message || 'Erro ao enviar mensagem.', 'error');
    } finally {
      setSending(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      default:
        return 'text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Mensagens</h1>
          <p className="mt-1 text-slate-600">Converse com seu terapeuta</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <button
                onClick={() => setIsComposing(true)}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700"
              >
                <Send className="h-4 w-4" />
                Nova Mensagem
              </button>

              <div className="space-y-2">
                <button
                  onClick={() => setSelectedFolder('inbox')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    selectedFolder === 'inbox'
                      ? 'bg-sky-100 text-sky-900'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Inbox className="h-5 w-5" />
                  Recebidas
                </button>

                <button
                  onClick={() => setSelectedFolder('sent')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    selectedFolder === 'sent'
                      ? 'bg-sky-100 text-sky-900'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Send className="h-5 w-5" />
                  Enviadas
                </button>

                <button
                  onClick={() => setSelectedFolder('archived')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    selectedFolder === 'archived'
                      ? 'bg-sky-100 text-sky-900'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Archive className="h-5 w-5" />
                  Arquivadas
                </button>
              </div>
            </div>
          </div>

          {/* Message List / Compose */}
          <div className="lg:col-span-2">
            {isComposing ? (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-slate-900">Nova Mensagem</h2>

                <form onSubmit={handleSendMessage}>
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Assunto
                    </label>
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="Assunto da mensagem"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Mensagem*
                    </label>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escreva sua mensagem aqui..."
                      required
                      rows={8}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2"
                      maxLength={5000}
                    />
                    <p className="mt-1 text-xs text-slate-500">{newMessage.length}/5000</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 disabled:opacity-50"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Enviar
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsComposing(false)}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            ) : selectedMessage ? (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {selectedMessage.subject || 'Sem assunto'}
                    </h2>
                    <p className="text-sm text-slate-600">
                      De: {selectedFolder === 'sent' ? 'Você' : selectedMessage.sender_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(selectedMessage.created_at), "dd 'de' MMMM 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="whitespace-pre-wrap text-slate-700">{selectedMessage.message}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.length === 0 ? (
                  <div className="rounded-lg bg-white p-12 text-center shadow-sm">
                    <MessageSquare className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                    <h3 className="mb-2 text-lg font-semibold text-slate-900">
                      Nenhuma mensagem
                    </h3>
                    <p className="text-slate-600">Você não tem mensagens nesta pasta.</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => handleSelectMessage(msg)}
                      className={`cursor-pointer rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
                        msg.status === 'unread' ? 'border-l-4 border-sky-600' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${
                              msg.status === 'unread' ? 'text-slate-900' : 'text-slate-700'
                            }`}
                          >
                            {msg.subject || 'Sem assunto'}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {selectedFolder === 'sent' ? `Para: ${msg.recipient_name}` : `De: ${msg.sender_name}`}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                            {msg.message}
                          </p>
                        </div>

                        <div className="ml-4 flex flex-col items-end gap-1">
                          <span className="text-xs text-slate-500">
                            {format(new Date(msg.created_at), 'dd/MM', { locale: ptBR })}
                          </span>

                          {msg.status === 'unread' && (
                            <span className="flex h-2 w-2 rounded-full bg-sky-600" />
                          )}

                          {msg.priority === 'urgent' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
