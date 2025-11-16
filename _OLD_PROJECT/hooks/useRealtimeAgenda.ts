import { useEffect, useCallback, useRef } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import type { EnrichedAppointment } from '../types';
import { useToast } from '../contexts/ToastContext';

interface UseRealtimeAgendaOptions {
  startDate: Date;
  endDate: Date;
  onAppointmentCreated?: (appointment: any) => void;
  onAppointmentUpdated?: (appointment: any) => void;
  onAppointmentDeleted?: (appointmentId: string) => void;
  onUserEditing?: (userId: string, appointmentId: string) => void;
  enabled?: boolean;
}

interface PresenceState {
  editing_appointment_id?: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
}

/**
 * Hook para sincronização em tempo real da agenda via Supabase Realtime
 * 
 * Funcionalidades:
 * - Detecta criação, atualização e exclusão de agendamentos
 * - Mostra quem está editando cada agendamento (presence)
 * - Notifica usuário de mudanças feitas por outros
 * - Auto-reconecta em caso de perda de conexão
 */
export function useRealtimeAgenda(options: UseRealtimeAgendaOptions) {
  const { user } = useSupabaseAuth();
  const { showToast } = useToast();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const {
    startDate,
    endDate,
    onAppointmentCreated,
    onAppointmentUpdated,
    onAppointmentDeleted,
    onUserEditing,
    enabled = true,
  } = options;

  const trackPresence = useCallback(
    (appointmentId: string | null) => {
      if (!channelRef.current || !user) return;

      const userMetadata = (user as any)?.user_metadata || {};
      channelRef.current.track({
        editing_appointment_id: appointmentId,
        user_id: user.id,
        user_name: userMetadata.name || user.email || 'Usuário',
        user_avatar: userMetadata.avatar_url,
      });
    },
    [user]
  );

  useEffect(() => {
    if (!supabase || !enabled || !user) return;

    console.log('[RealtimeAgenda] Iniciando sincronização...', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    // Criar canal de realtime
    const channel = supabase
      .channel('agenda-updates', {
        config: {
          broadcast: { self: false }, // Não receber próprios eventos
          presence: { key: user.id },
        },
      })
      // Detectar novos agendamentos
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
        },
        (payload) => {
          console.log('[RealtimeAgenda] Novo agendamento criado:', payload.new);
          
          showToast(
            'Um novo agendamento foi criado por outro usuário',
            'info'
          );

          onAppointmentCreated?.(payload.new);
        }
      )
      // Detectar atualizações
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
        },
        (payload) => {
          console.log('[RealtimeAgenda] Agendamento atualizado:', payload.new);
          
          showToast(
            'Um agendamento foi modificado',
            'info'
          );

          onAppointmentUpdated?.(payload.new);
        }
      )
      // Detectar exclusões
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'appointments',
        },
        (payload) => {
          console.log('[RealtimeAgenda] Agendamento deletado:', payload.old);
          
          showToast(
            'Um agendamento foi cancelado',
            'info'
          );

          onAppointmentDeleted?.(payload.old.id);
        }
      )
      // Detectar presença (quem está editando)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceState>();
        console.log('[RealtimeAgenda] Presença atualizada:', state);

        // Notificar quem está editando cada agendamento
        const stateValues = Object.values(state) as PresenceState[][];
        stateValues.forEach((presences) => {
          presences.forEach((presence) => {
            if (presence.editing_appointment_id && presence.user_id !== user?.id) {
              onUserEditing?.(presence.user_id, presence.editing_appointment_id);
            }
          });
        });
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('[RealtimeAgenda] Usuário entrou:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('[RealtimeAgenda] Usuário saiu:', key, leftPresences);
      })
      .subscribe((status) => {
        console.log('[RealtimeAgenda] Status da conexão:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('[RealtimeAgenda] ✅ Conectado ao realtime');
          
          // Rastrear presença inicial (não está editando nada)
          trackPresence(null);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[RealtimeAgenda] ❌ Erro no canal');
          showToast(
            'Não foi possível conectar ao servidor de atualizações em tempo real',
            'error'
          );
        } else if (status === 'TIMED_OUT') {
          console.error('[RealtimeAgenda] ⏱️ Timeout');
          showToast(
            'A sincronização em tempo real está demorando mais que o esperado',
            'info'
          );
        }
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      console.log('[RealtimeAgenda] Desconectando...');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [
    supabase,
    enabled,
    user,
    startDate.toISOString(),
    endDate.toISOString(),
    onAppointmentCreated,
    onAppointmentUpdated,
    onAppointmentDeleted,
    onUserEditing,
    showToast,
    trackPresence,
  ]);

    return {
    trackPresence,
    disconnect: () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    },
  };
}

