/**
 * Hook para mensagens WhatsApp em tempo real via Supabase Realtime
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface WhatsAppMessage {
  id: string;
  patient_id?: string;
  recipient_id?: string;
  body: string;
  status: string;
  created_at: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  metadata?: {
    direction?: 'inbound' | 'outbound';
    from?: string;
    to?: string;
    lead_id?: string;
  };
}

export interface UseWhatsAppRealtimeOptions {
  patient_id?: string;
  lead_id?: string;
  phone?: string;
  autoMarkAsRead?: boolean;
}

export function useWhatsAppRealtime(options: UseWhatsAppRealtimeOptions = {}) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Buscar histórico inicial
  const fetchInitialMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('messages')
        .select('*')
        .eq('channel', 'whatsapp')
        .order('created_at', { ascending: true });

      if (options.patient_id) {
        query = query.eq('patient_id', options.patient_id);
      } else if (options.lead_id) {
        query = query.eq('metadata->lead_id', options.lead_id);
      } else if (options.phone) {
        // Buscar por recipient
        const { data: recipient } = await supabase
          .from('communication_recipients')
          .select('id')
          .eq('phone', options.phone)
          .maybeSingle();

        if (recipient) {
          query = query.eq('recipient_id', recipient.id);
        }
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setMessages((data as WhatsAppMessage[]) || []);
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [options.patient_id, options.lead_id, options.phone]);

  // Configurar realtime subscription
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtime = async () => {
      // Buscar mensagens iniciais
      await fetchInitialMessages();

      // Criar canal de realtime
      const channelName = options.patient_id
        ? `whatsapp:patient:${options.patient_id}`
        : options.lead_id
        ? `whatsapp:lead:${options.lead_id}`
        : options.phone
        ? `whatsapp:phone:${options.phone}`
        : 'whatsapp:all';

      channel = supabase.channel(channelName);

      // Subscribe para INSERT (novas mensagens)
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: options.patient_id
            ? `patient_id=eq.${options.patient_id}`
            : options.lead_id
            ? `metadata->lead_id=eq.${options.lead_id}`
            : undefined
        },
        (payload) => {
          const newMessage = payload.new as WhatsAppMessage;

          // Adicionar apenas se for mensagem WhatsApp
          if (newMessage.metadata?.direction) {
            setMessages((prev) => {
              // Evitar duplicatas
              if (prev.some(m => m.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });

            // Marcar como lida automaticamente se for mensagem recebida
            if (
              options.autoMarkAsRead &&
              newMessage.metadata?.direction === 'inbound'
            ) {
              supabase
                .from('messages')
                .update({
                  status: 'read',
                  read_at: new Date().toISOString()
                })
                .eq('id', newMessage.id)
                .then(() => {
                  console.log('✅ Mensagem marcada como lida');
                });
            }
          }
        }
      );

      // Subscribe para UPDATE (status changes)
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: options.patient_id
            ? `patient_id=eq.${options.patient_id}`
            : undefined
        },
        (payload) => {
          const updatedMessage = payload.new as WhatsAppMessage;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      );

      // Subscribe ao canal
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conectado ao realtime WhatsApp');
          setIsConnected(true);
        } else if (status === 'CLOSED') {
          console.log('❌ Desconectado do realtime WhatsApp');
          setIsConnected(false);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erro no canal realtime');
          setError(new Error('Erro ao conectar ao realtime'));
          setIsConnected(false);
        }
      });
    };

    setupRealtime();

    // Cleanup
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        setIsConnected(false);
      }
    };
  }, [options.patient_id, options.lead_id, options.phone, options.autoMarkAsRead, fetchInitialMessages]);

  // Enviar mensagem
  const sendMessage = useCallback(async (text: string): Promise<boolean> => {
    try {
      if (!options.patient_id && !options.lead_id && !options.phone) {
        throw new Error('Nenhum identificador fornecido para enviar mensagem');
      }

      // Buscar telefone do destinatário
      let phone: string | null = options.phone || null;

      if (!phone) {
        if (options.patient_id) {
          const { data: patient } = await supabase
            .from('patients')
            .select('phone')
            .eq('id', options.patient_id)
            .single();
          phone = patient?.phone;
        } else if (options.lead_id) {
          const { data: lead } = await supabase
            .from('leads')
            .select('phone')
            .eq('id', options.lead_id)
            .single();
          phone = lead?.phone;
        }
      }

      if (!phone) {
        throw new Error('Telefone não encontrado');
      }

      // Enviar via WhatsApp Business API
      const accessToken = import.meta.env.VITE_WHATSAPP_BUSINESS_API_TOKEN;
      const phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: phone.replace(/\D/g, ''),
            type: 'text',
            text: { body: text }
          })
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem via WhatsApp API');
      }

      const data = await response.json();
      const whatsappMessageId = data.messages?.[0]?.id;

      // Salvar mensagem no banco (o realtime vai pegar automaticamente)
      await supabase.from('messages').insert({
        patient_id: options.patient_id,
        channel: 'whatsapp',
        type: 'generic',
        status: 'sent',
        body: text,
        external_message_id: whatsappMessageId,
        sent_at: new Date().toISOString(),
        metadata: {
          direction: 'outbound',
          to: phone,
          lead_id: options.lead_id
        }
      });

      return true;
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError(err as Error);
      return false;
    }
  }, [options.patient_id, options.lead_id, options.phone]);

  // Marcar mensagem como lida
  const markAsRead = useCallback(async (message_id: string): Promise<void> => {
    try {
      await supabase
        .from('messages')
        .update({
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', message_id);
    } catch (err) {
      console.error('Erro ao marcar como lida:', err);
    }
  }, []);

  // Recarregar mensagens
  const refresh = useCallback(() => {
    fetchInitialMessages();
  }, [fetchInitialMessages]);

  return {
    messages,
    loading,
    error,
    isConnected,
    sendMessage,
    markAsRead,
    refresh,
    hasMessages: messages.length > 0,
    lastMessage: messages[messages.length - 1] || null,
    unreadCount: messages.filter(
      m => m.metadata?.direction === 'inbound' && m.status !== 'read'
    ).length
  };
}

/**
 * Hook para buscar conversas ativas (lista de contatos)
 */
export function useWhatsAppConversations() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);

      // Buscar últimas mensagens de cada contato
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 7); // Últimos 7 dias

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select(`
          *,
          patient:patients(id, name, phone),
          recipient:communication_recipients(id, name, phone)
        `)
        .eq('channel', 'whatsapp')
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Agrupar por contato (última mensagem de cada)
      const grouped = new Map();
      (data || []).forEach((msg: any) => {
        const key = msg.patient?.id || msg.recipient?.id || msg.metadata?.from;
        const existingConv = grouped.get(key);

        if (!existingConv || new Date(msg.created_at) > new Date(existingConv.last_message_at)) {
          grouped.set(key, {
            id: key,
            patient_id: msg.patient?.id,
            recipient_id: msg.recipient?.id,
            name: msg.patient?.name || msg.recipient?.name || 'Desconhecido',
            phone: msg.patient?.phone || msg.recipient?.phone || msg.metadata?.from,
            last_message: msg.body,
            last_message_at: msg.created_at,
            unread_count: 0, // TODO: calcular
            avatar: null
          });
        }
      });

      setConversations(Array.from(grouped.values()));
    } catch (err) {
      console.error('Erro ao buscar conversas:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchConversations, 30000);

    return () => clearInterval(interval);
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    refresh: fetchConversations
  };
}
