/**
 * useRealtimeAppointments Hook
 * Subscrição em tempo real a mudanças em agendamentos via Supabase
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Appointment } from '../types';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseRealtimeAppointmentsOptions {
  onInsert?: (appointment: Appointment) => void;
  onUpdate?: (appointment: Appointment) => void;
  onDelete?: (appointmentId: string) => void;
  enabled?: boolean;
  filter?: {
    therapistId?: string;
    startDate?: Date;
    endDate?: Date;
  };
}

export const useRealtimeAppointments = (options: UseRealtimeAppointmentsOptions = {}) => {
  const { onInsert, onUpdate, onDelete, enabled = true, filter } = options;
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !supabase) return;

    const channelName = `appointments${filter?.therapistId ? `-${filter.therapistId}` : ''}`;
    
    const realtimeChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: filter?.therapistId ? `therapist_id=eq.${filter.therapistId}` : undefined
        },
        (payload: RealtimePostgresChangesPayload<Appointment>) => {
          console.log('🆕 Realtime: New appointment', payload.new);
          if (onInsert && payload.new) {
            onInsert(payload.new as Appointment);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: filter?.therapistId ? `therapist_id=eq.${filter.therapistId}` : undefined
        },
        (payload: RealtimePostgresChangesPayload<Appointment>) => {
          console.log('✏️ Realtime: Updated appointment', payload.new);
          if (onUpdate && payload.new) {
            onUpdate(payload.new as Appointment);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'appointments',
          filter: filter?.therapistId ? `therapist_id=eq.${filter.therapistId}` : undefined
        },
        (payload: RealtimePostgresChangesPayload<Appointment>) => {
          console.log('🗑️ Realtime: Deleted appointment', payload.old);
          if (onDelete && payload.old) {
            onDelete((payload.old as Appointment).id);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime status:', status);
        
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setError(new Error('Failed to subscribe to channel'));
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false);
          setError(new Error('Subscription timed out'));
        }
      });

    setChannel(realtimeChannel);

    return () => {
      console.log('🔌 Unsubscribing from realtime channel');
      realtimeChannel.unsubscribe();
    };
  }, [enabled, filter?.therapistId, onInsert, onUpdate, onDelete]);

  return {
    isConnected,
    error,
    channel
  };
};

