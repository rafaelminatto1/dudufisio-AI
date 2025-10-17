/**
 * Hook para Realtime updates de calendar_links
 * Escuta mudanças via Supabase WebSockets
 */

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';

export function useCalendarLinkRealtime(appointmentId: string) {
  const [linkAccessed, setLinkAccessed] = useState(false);
  const [accessCount, setAccessCount] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    if (!appointmentId) return;

    // Subscribe to calendar_links changes
    const subscription = supabase
      .channel(`calendar-link-updates-${appointmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'calendar_links',
          filter: `appointment_id=eq.${appointmentId}`
        },
        (payload) => {
          console.log('📅 Calendar link updated:', payload);
          
          if (payload.new.link_accessed) {
            setLinkAccessed(true);
            setAccessCount(payload.new.access_count || 0);
            
            // Show toast notification
            showToast('✅ Paciente acessou o link de calendário!', 'success');
          }
        }
      )
      .subscribe();

    // Fetch initial state
    const fetchInitialState = async () => {
      const { data } = await supabase
        .from('calendar_links')
        .select('link_accessed, access_count')
        .eq('appointment_id', appointmentId)
        .single();

      if (data) {
        setLinkAccessed(data.link_accessed);
        setAccessCount(data.access_count || 0);
      }
    };

    fetchInitialState();

    return () => {
      subscription.unsubscribe();
    };
  }, [appointmentId, showToast]);

  return { linkAccessed, accessCount };
}

/**
 * Hook para escutar mudanças em múltiplos appointments
 */
export function useCalendarLinksRealtime(appointmentIds: string[]) {
  const [accessedLinks, setAccessedLinks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (appointmentIds.length === 0) return;

    // Subscribe to all appointments
    const subscription = supabase
      .channel('calendar-links-updates-bulk')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'calendar_links',
          filter: `appointment_id=in.(${appointmentIds.join(',')})`
        },
        (payload) => {
          if (payload.new.link_accessed) {
            setAccessedLinks(prev => new Set(prev).add(payload.new.appointment_id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [appointmentIds]);

  return { accessedLinks };
}

