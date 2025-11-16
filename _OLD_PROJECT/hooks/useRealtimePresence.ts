/**
 * useRealtimePresence Hook
 * Rastreia presença de usuários online
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface UserPresence {
  userId: string;
  userName: string;
  userRole: string;
  page: string;
  joinedAt: string;
}

interface UseRealtimePresenceOptions {
  roomName: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
  enabled?: boolean;
}

export const useRealtimePresence = (options: UseRealtimePresenceOptions) => {
  const { roomName, user, enabled = true } = options;
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !supabase || !user) return;

    const presence = supabase.channel(`presence-${roomName}`, {
      config: {
        presence: {
          key: user.id
        }
      }
    });

    // Track presence
    presence
      .on('presence', { event: 'sync' }, () => {
        const state = presence.presenceState();
        console.log('👥 Presence synced:', state);

        const users: UserPresence[] = [];
        Object.keys(state).forEach((userId) => {
          const presences = state[userId];
          if (presences && presences.length > 0) {
            users.push(presences[0] as UserPresence);
          }
        });

        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('👋 User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('👋 User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        console.log('📡 Presence status:', status);

        if (status === 'SUBSCRIBED') {
          setIsConnected(true);

          // Track own presence
          await presence.track({
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            page: roomName,
            joinedAt: new Date().toISOString()
          });
        }
      });

    setChannel(presence);

    return () => {
      console.log('🔌 Unsubscribing from presence channel');
      presence.unsubscribe();
    };
  }, [enabled, roomName, user]);

  const updatePresence = useCallback(
    async (data: Partial<UserPresence>) => {
      if (!channel) return;

      await channel.track({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        page: roomName,
        joinedAt: new Date().toISOString(),
        ...data
      });
    },
    [channel, user, roomName]
  );

  return {
    onlineUsers,
    isConnected,
    updatePresence,
    channel
  };
};

