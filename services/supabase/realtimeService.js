import { supabase } from '../../lib/supabaseClient';
class RealtimeService {
    constructor() {
        this.channels = new Map();
    }
    // Subscribe to all changes in a table
    subscribeToTable(table, callback, events = ['INSERT', 'UPDATE', 'DELETE']) {
        const channelName = `${table}_all_changes`;
        // Check if channel already exists
        if (this.channels.has(channelName)) {
            const existingChannel = this.channels.get(channelName);
            existingChannel.unsubscribe();
            this.channels.delete(channelName);
        }
        const channel = supabase
            .channel(channelName)
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table,
        }, (payload) => {
            if (events.includes(payload.eventType)) {
                callback(payload);
            }
        })
            .subscribe();
        this.channels.set(channelName, channel);
        return {
            channel,
            unsubscribe: () => this.unsubscribeChannel(channelName),
        };
    }
    // Subscribe to specific record changes
    subscribeToRecord(table, recordId, callback, events = ['UPDATE', 'DELETE']) {
        const channelName = `${table}_${recordId}_changes`;
        // Check if channel already exists
        if (this.channels.has(channelName)) {
            const existingChannel = this.channels.get(channelName);
            existingChannel.unsubscribe();
            this.channels.delete(channelName);
        }
        const channel = supabase
            .channel(channelName)
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table,
            filter: `id=eq.${recordId}`,
        }, (payload) => {
            if (events.includes(payload.eventType)) {
                callback(payload);
            }
        })
            .subscribe();
        this.channels.set(channelName, channel);
        return {
            channel,
            unsubscribe: () => this.unsubscribeChannel(channelName),
        };
    }
    // Subscribe to filtered changes
    subscribeToFiltered(table, filter, callback, events = ['INSERT', 'UPDATE', 'DELETE']) {
        const channelName = `${table}_${filter.column}_${filter.value}_changes`;
        // Check if channel already exists
        if (this.channels.has(channelName)) {
            const existingChannel = this.channels.get(channelName);
            existingChannel.unsubscribe();
            this.channels.delete(channelName);
        }
        const channel = supabase
            .channel(channelName)
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table,
            filter: `${filter.column}=${filter.operator}.${filter.value}`,
        }, (payload) => {
            if (events.includes(payload.eventType)) {
                callback(payload);
            }
        })
            .subscribe();
        this.channels.set(channelName, channel);
        return {
            channel,
            unsubscribe: () => this.unsubscribeChannel(channelName),
        };
    }
    // Subscribe to multiple tables
    subscribeToMultipleTables(tables, callback, events = ['INSERT', 'UPDATE', 'DELETE']) {
        const channelName = `multi_${tables.join('_')}_changes`;
        // Check if channel already exists
        if (this.channels.has(channelName)) {
            const existingChannel = this.channels.get(channelName);
            existingChannel.unsubscribe();
            this.channels.delete(channelName);
        }
        let channel = supabase.channel(channelName);
        tables.forEach(table => {
            channel = channel.on('postgres_changes', {
                event: '*',
                schema: 'public',
                table,
            }, (payload) => {
                if (events.includes(payload.eventType)) {
                    callback(table, payload);
                }
            });
        });
        channel.subscribe();
        this.channels.set(channelName, channel);
        return {
            channel,
            unsubscribe: () => this.unsubscribeChannel(channelName),
        };
    }
    // Subscribe to presence (online users)
    subscribeToPresence(channelName, userId, userInfo, callbacks) {
        const presenceChannelName = `presence_${channelName}`;
        // Check if channel already exists
        if (this.channels.has(presenceChannelName)) {
            const existingChannel = this.channels.get(presenceChannelName);
            existingChannel.unsubscribe();
            this.channels.delete(presenceChannelName);
        }
        const channel = supabase.channel(presenceChannelName);
        // Track user presence
        channel.on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            callbacks.onSync?.(state);
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
    subscribeToBroadcast(channelName, event, callback) {
        const broadcastChannelName = `broadcast_${channelName}`;
        // Check if channel already exists
        if (this.channels.has(broadcastChannelName)) {
            const existingChannel = this.channels.get(broadcastChannelName);
            existingChannel.unsubscribe();
            this.channels.delete(broadcastChannelName);
        }
        const channel = supabase
            .channel(broadcastChannelName)
            .on('broadcast', { event }, ({ payload }) => {
            callback(payload);
        })
            .subscribe();
        this.channels.set(broadcastChannelName, channel);
        return {
            channel,
            unsubscribe: () => this.unsubscribeChannel(broadcastChannelName),
        };
    }
    // Send broadcast message
    async sendBroadcast(channelName, event, payload) {
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
    getPresenceState(channelName) {
        const presenceChannelName = `presence_${channelName}`;
        const channel = this.channels.get(presenceChannelName);
        if (channel) {
            return channel.presenceState();
        }
        return {};
    }
    // Unsubscribe from a channel
    unsubscribeChannel(channelName) {
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
    getActiveChannels() {
        return Array.from(this.channels.keys());
    }
    // Check if subscribed to a channel
    isSubscribed(channelName) {
        return this.channels.has(channelName);
    }
}
// Export singleton instance
export const realtimeService = new RealtimeService();
export default realtimeService;
// Specific subscription helpers
export const subscriptions = {
    // Subscribe to appointment changes for a therapist
    therapistAppointments: (therapistId, callback) => {
        return realtimeService.subscribeToFiltered('appointments', { column: 'therapist_id', operator: 'eq', value: therapistId }, callback);
    },
    // Subscribe to patient updates
    patientUpdates: (patientId, callback) => {
        return realtimeService.subscribeToRecord('patients', patientId, callback);
    },
    // Subscribe to new notifications for a user
    userNotifications: (userId, callback) => {
        return realtimeService.subscribeToFiltered('notifications', { column: 'user_id', operator: 'eq', value: userId }, callback, ['INSERT']);
    },
    // Subscribe to new messages for a user
    userMessages: (userId, callback) => {
        return realtimeService.subscribeToFiltered('messages', { column: 'to_id', operator: 'eq', value: userId }, callback, ['INSERT']);
    },
    // Subscribe to session updates for a patient
    patientSessions: (patientId, callback) => {
        return realtimeService.subscribeToMultipleTables(['appointments'], (table, payload) => {
            // Filter for patient's data
            if (table === 'appointments' && payload.new?.patient_id === patientId) {
                callback(payload);
            }
        });
    },
    // Subscribe to financial updates for a patient
    patientFinancials: (patientId, callback) => {
        // Financial transactions table not available in current schema
        console.warn('Financial transactions table not available in current schema');
        return { channel: null, unsubscribe: () => { } };
    },
    // Subscribe to exercise prescription updates
    patientExercises: (patientId, callback) => {
        // Exercise prescriptions table not available in current schema
        console.warn('Exercise prescriptions table not available in current schema');
        return { channel: null, unsubscribe: () => { } };
    },
    // Subscribe to clinic-wide updates (admin only)
    clinicDashboard: (callback) => {
        return realtimeService.subscribeToMultipleTables(['appointments', 'patients'], callback);
    },
    // Subscribe to therapist presence
    therapistPresence: (userId, userInfo, callbacks) => {
        return realtimeService.subscribeToPresence('therapists_online', userId, userInfo, callbacks);
    },
    // Subscribe to chat room
    chatRoom: (roomId, callback) => {
        return realtimeService.subscribeToBroadcast(`chat_${roomId}`, 'message', callback);
    },
};
