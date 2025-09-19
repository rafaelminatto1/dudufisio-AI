import { supabase } from '../../lib/supabase';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();

  // Subscribe to all changes in a table
  subscribeToTable(
    table: string,
    callback: (payload: RealtimePostgresChangesPayload<any>) => void,
    events: RealtimeEvent[] = ['INSERT', 'UPDATE', 'DELETE']
  ): RealtimeSubscription {
    const channelName = `${table}_all_changes`;
    
    // Check if channel already exists
    if (this.channels.has(channelName)) {
      const existingChannel = this.channels.get(channelName)!;
      existingChannel.unsubscribe();
      this.channels.delete(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (events.includes(payload.eventType as RealtimeEvent)) {
            callback(payload);
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return {
      channel,
      unsubscribe: () => this.unsubscribeChannel(channelName),
    };
  }

  // Subscribe to specific record changes
  subscribeToRecord(
    table: string,
    recordId: string,
    callback: (payload: RealtimePostgresChangesPayload<any>) => void,
    events: RealtimeEvent[] = ['UPDATE', 'DELETE']
  ): RealtimeSubscription {
    const channelName = `${table}_${recordId}_changes`;
    
    // Check if channel already exists
    if (this.channels.has(channelName)) {
      const existingChannel = this.channels.get(channelName)!;
      existingChannel.unsubscribe();
      this.channels.delete(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table,
          filter: `id=eq.${recordId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (events.includes(payload.eventType as RealtimeEvent)) {
            callback(payload);
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return {
      channel,
      unsubscribe: () => this.unsubscribeChannel(channelName),
    };
  }

  // Subscribe to filtered changes
  subscribeToFiltered(
    table: string,
    filter: { column: string; operator: string; value: string },
    callback: (payload: RealtimePostgresChangesPayload<any>) => void,
    events: RealtimeEvent[] = ['INSERT', 'UPDATE', 'DELETE']
  ): RealtimeSubscription {
    const channelName = `${table}_${filter.column}_${filter.value}_changes`;
    
    // Check if channel already exists
    if (this.channels.has(channelName)) {
      const existingChannel = this.channels.get(channelName)!;
      existingChannel.unsubscribe();
      this.channels.delete(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table,
          filter: `${filter.column}=${filter.operator}.${filter.value}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (events.includes(payload.eventType as RealtimeEvent)) {
            callback(payload);
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return {
      channel,
      unsubscribe: () => this.unsubscribeChannel(channelName),
    };
  }

  // Subscribe to multiple tables
  subscribeToMultipleTables(
    tables: string[],
    callback: (table: string, payload: RealtimePostgresChangesPayload<any>) => void,
    events: RealtimeEvent[] = ['INSERT', 'UPDATE', 'DELETE']
  ): RealtimeSubscription {
    const channelName = `multi_${tables.join('_')}_changes`;
    
    // Check if channel already exists
    if (this.channels.has(channelName)) {
      const existingChannel = this.channels.get(channelName)!;
      existingChannel.unsubscribe();
      this.channels.delete(channelName);
    }

    let channel = supabase.channel(channelName);

    tables.forEach(table => {
      channel = channel.on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (events.includes(payload.eventType as RealtimeEvent)) {
            callback(table, payload);
          }
        }
      );
    });

    channel.subscribe();
    this.channels.set(channelName, channel);

    return {
      channel,
      unsubscribe: () => this.unsubscribeChannel(channelName),
    };
  }

  // Subscribe to presence (online users)
  subscribeToPresence(
    channelName: string,
    userId: string,
    userInfo: any,
    callbacks: {
      onSync?: () => void;
      onJoin?: (event: any) => void;
      onLeave?: (event: any) => void;
    }
  ): RealtimeSubscription {
    const presenceChannelName = `presence_${channelName}`;
    
    // Check if channel already exists
    if (this.channels.has(presenceChannelName)) {
      const existingChannel = this.channels.get(presenceChannelName)!;
      existingChannel.unsubscribe();
      this.channels.delete(presenceChannelName);
    }

    const channel = supabase.channel(presenceChannelName);

    // Track user presence
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      console.log('Presence state:', state);
      callbacks.onSync?.();
    });

    if (callbacks.onJoin) {
      channel.on('presence', { event: 'join' }, callbacks.onJoin);
    }

    if (callbacks.onLeave) {
      channel.on('presence', { event: 'leave' }, callbacks.onLeave);
    }

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
          ...userInfo,
        });
      }
    });

    this.channels.set(presenceChannelName, channel);

    return {
      channel,
      unsubscribe: () => this.unsubscribeChannel(presenceChannelName),
    };
  }

  // Subscribe to broadcast messages
  subscribeToBroadcast(
    channelName: string,
    event: string,
    callback: (payload: any) => void
  ): RealtimeSubscription {
    const broadcastChannelName = `broadcast_${channelName}`;
    
    // Check if channel already exists
    if (this.channels.has(broadcastChannelName)) {
      const existingChannel = this.channels.get(broadcastChannelName)!;
      existingChannel.unsubscribe();
      this.channels.delete(broadcastChannelName);
    }

    const channel = supabase
      .channel(broadcastChannelName)
      .on('broadcast', { event }, callback)
      .subscribe();

    this.channels.set(broadcastChannelName, channel);

    return {
      channel,
      unsubscribe: () => this.unsubscribeChannel(broadcastChannelName),
    };
  }

  // Send broadcast message
  async sendBroadcast(channelName: string, event: string, payload: any) {
    const broadcastChannelName = `broadcast_${channelName}`;
    let channel = this.channels.get(broadcastChannelName);

    if (!channel) {
      channel = supabase.channel(broadcastChannelName);
      await channel.subscribe();
      this.channels.set(broadcastChannelName, channel);
    }

    return channel.send({
      type: 'broadcast',
      event,
      payload,
    });
  }

  // Get presence state
  getPresenceState(channelName: string) {
    const presenceChannelName = `presence_${channelName}`;
    const channel = this.channels.get(presenceChannelName);
    
    if (channel) {
      return channel.presenceState();
    }
    
    return {};
  }

  // Unsubscribe from a channel
  private unsubscribeChannel(channelName: string) {
    const channel = this.channels.get(channelName);
    
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelName);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.channels.forEach(channel => {
      channel.unsubscribe();
    });
    this.channels.clear();
  }

  // Get all active channels
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  // Check if subscribed to a channel
  isSubscribed(channelName: string): boolean {
    return this.channels.has(channelName);
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();
export default realtimeService;

// Specific subscription helpers
export const subscriptions = {
  // Subscribe to appointment changes for a therapist
  therapistAppointments: (therapistId: string, callback: (payload: any) => void) => {
    return realtimeService.subscribeToFiltered(
      'appointments',
      { column: 'therapist_id', operator: 'eq', value: therapistId },
      callback
    );
  },

  // Subscribe to patient updates
  patientUpdates: (patientId: string, callback: (payload: any) => void) => {
    return realtimeService.subscribeToRecord('patients', patientId, callback);
  },

  // Subscribe to new notifications for a user
  userNotifications: (userId: string, callback: (payload: any) => void) => {
    return realtimeService.subscribeToFiltered(
      'notifications',
      { column: 'user_id', operator: 'eq', value: userId },
      callback,
      ['INSERT']
    );
  },

  // Subscribe to new messages for a user
  userMessages: (userId: string, callback: (payload: any) => void) => {
    return realtimeService.subscribeToFiltered(
      'messages',
      { column: 'to_id', operator: 'eq', value: userId },
      callback,
      ['INSERT']
    );
  },

  // Subscribe to session updates for a patient
  patientSessions: (patientId: string, callback: (payload: any) => void) => {
    return realtimeService.subscribeToMultipleTables(
      ['sessions', 'appointments'],
      (table, payload) => {
        // Filter for patient's data
        if (table === 'appointments' && payload.new?.patient_id === patientId) {
          callback(payload);
        } else if (table === 'sessions') {
          // Need to check if session belongs to patient
          callback(payload);
        }
      }
    );
  },

  // Subscribe to financial updates for a patient
  patientFinancials: (patientId: string, callback: (payload: any) => void) => {
    return realtimeService.subscribeToFiltered(
      'financial_transactions',
      { column: 'patient_id', operator: 'eq', value: patientId },
      callback
    );
  },

  // Subscribe to exercise prescription updates
  patientExercises: (patientId: string, callback: (payload: any) => void) => {
    return realtimeService.subscribeToFiltered(
      'exercise_prescriptions',
      { column: 'patient_id', operator: 'eq', value: patientId },
      callback
    );
  },

  // Subscribe to clinic-wide updates (admin only)
  clinicDashboard: (callback: (table: string, payload: any) => void) => {
    return realtimeService.subscribeToMultipleTables(
      ['appointments', 'patients', 'sessions', 'financial_transactions'],
      callback
    );
  },

  // Subscribe to therapist presence
  therapistPresence: (userId: string, userInfo: any, callbacks: any) => {
    return realtimeService.subscribeToPresence('therapists_online', userId, userInfo, callbacks);
  },

  // Subscribe to chat room
  chatRoom: (roomId: string, callback: (payload: any) => void) => {
    return realtimeService.subscribeToBroadcast(`chat_${roomId}`, 'message', callback);
  },
};