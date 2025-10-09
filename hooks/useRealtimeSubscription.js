/**
 * React Query + Supabase Realtime Integration
 * Hook genérico para subscriptions real-time com invalidação automática de cache
 *
 * Baseado nas melhores práticas do Supabase Context7
 */
import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
/**
 * Hook para subscription real-time do Supabase
 * Integrado com React Query para invalidação automática de cache
 *
 * @example
 * ```tsx
 * // Uso básico com invalidação automática
 * useRealtimeSubscription({
 *   table: 'risk_assessments',
 *   filter: `patient_id=eq.${patientId}`,
 *   queryKey: riskKeys.list(patientId)
 * });
 *
 * // Com callbacks customizados
 * useRealtimeSubscription({
 *   table: 'family_messages',
 *   queryKey: familyKeys.messages(patientId),
 *   onInsert: (payload) => {
 *     toast.info('Nova mensagem recebida!');
 *   }
 * });
 * ```
 */
export function useRealtimeSubscription(options) {
    const { table, filter, event = '*', schema = 'public', queryKey, onInsert, onUpdate, onDelete, } = options;
    const queryClient = useQueryClient();
    const channelRef = useRef(null);
    useEffect(() => {
        // Criar nome único para o channel
        const channelName = `${table}-changes${filter ? '-' + filter : ''}-${Date.now()}`;
        // Configurar subscription
        const channel = supabase
            .channel(channelName)
            .on('postgres_changes', {
            event,
            schema,
            table,
            filter,
        }, (payload) => {
            console.log(`[Realtime] ${table} - ${payload.eventType}:`, payload);
            // Invalidar cache do React Query
            if (queryKey) {
                queryClient.invalidateQueries({ queryKey });
            }
            // Callbacks específicos por evento
            switch (payload.eventType) {
                case 'INSERT':
                    onInsert?.(payload);
                    break;
                case 'UPDATE':
                    onUpdate?.(payload);
                    break;
                case 'DELETE':
                    onDelete?.(payload);
                    break;
            }
        })
            .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log(`[Realtime] Subscribed to ${table}${filter ? ` (${filter})` : ''}`);
            }
            else if (status === 'CHANNEL_ERROR') {
                console.error(`[Realtime] Error subscribing to ${table}`);
            }
        });
        channelRef.current = channel;
        // Cleanup ao desmontar
        return () => {
            console.log(`[Realtime] Unsubscribing from ${table}`);
            channel.unsubscribe();
        };
    }, [table, filter, event, schema, JSON.stringify(queryKey)]);
    return {
        channel: channelRef.current,
    };
}
/**
 * Hook para Presence (status online/offline de usuários)
 *
 * @example
 * ```tsx
 * const { onlineUsers } = usePresence('chat-room-1', userId);
 *
 * return (
 *   <div>
 *     {onlineUsers.length} usuários online
 *   </div>
 * );
 * ```
 */
export function usePresence(roomName, userId, userMetadata) {
    const channelRef = useRef(null);
    useEffect(() => {
        const presenceChannel = supabase.channel(roomName, {
            config: {
                presence: {
                    key: userId,
                },
            },
        });
        presenceChannel
            .on('presence', { event: 'sync' }, () => {
            const state = presenceChannel.presenceState();
            console.log('[Presence] Sync:', state);
        })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            console.log('[Presence] User joined:', key, newPresences);
        })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            console.log('[Presence] User left:', key, leftPresences);
        })
            .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await presenceChannel.track({
                    user_id: userId,
                    online_at: new Date().toISOString(),
                    ...userMetadata,
                });
            }
        });
        channelRef.current = presenceChannel;
        return () => {
            presenceChannel.unsubscribe();
        };
    }, [roomName, userId, JSON.stringify(userMetadata)]);
    const getOnlineUsers = () => {
        if (!channelRef.current)
            return [];
        const state = channelRef.current.presenceState();
        return Object.values(state).flat();
    };
    return {
        channel: channelRef.current,
        getOnlineUsers,
    };
}
/**
 * Hook para Broadcast (mensagens em tempo real)
 *
 * @example
 * ```tsx
 * const { sendMessage, messages } = useBroadcast('notifications', (payload) => {
 *   toast.info(payload.message);
 * });
 *
 * <button onClick={() => sendMessage({ type: 'alert', message: 'Hello!' })}>
 *   Enviar
 * </button>
 * ```
 */
export function useBroadcast(channelName, onMessage) {
    const channelRef = useRef(null);
    useEffect(() => {
        const channel = supabase
            .channel(channelName, {
            config: { broadcast: { self: true } },
        })
            .on('broadcast', { event: 'message' }, ({ payload }) => {
            console.log('[Broadcast] Message received:', payload);
            onMessage?.(payload);
        })
            .subscribe();
        channelRef.current = channel;
        return () => {
            channel.unsubscribe();
        };
    }, [channelName]);
    const sendMessage = async (payload) => {
        if (!channelRef.current) {
            console.error('[Broadcast] Channel not initialized');
            return;
        }
        await channelRef.current.send({
            type: 'broadcast',
            event: 'message',
            payload,
        });
    };
    return {
        channel: channelRef.current,
        sendMessage,
    };
}
