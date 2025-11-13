import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useQueryClient, QueryKey } from '@tanstack/react-query'

type PostgresEvent = '*' | 'INSERT' | 'UPDATE' | 'DELETE'

interface RealtimeOptions<T = any> {
  table: string
  filter?: string
  event?: PostgresEvent
  schema?: string
  queryKey?: QueryKey
  onInsert?: (payload: T) => void
  onUpdate?: (payload: T) => void
  onDelete?: (payload: T) => void
}

export function useRealtimeSubscription<T = any>(options: RealtimeOptions<T>) {
  const { table, filter, event = '*', schema = 'public', queryKey, onInsert, onUpdate, onDelete } = options
  const queryClient = useQueryClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    const channelName = `${table}-changes${filter ? '-' + filter : ''}-${Date.now()}`

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event, schema, table, filter }, (payload: any) => {
        if (queryKey) {
          queryClient.invalidateQueries({ queryKey })
        }
        switch (payload.eventType) {
          case 'INSERT':
            onInsert?.(payload)
            break
          case 'UPDATE':
            onUpdate?.(payload)
            break
          case 'DELETE':
            onDelete?.(payload)
            break
        }
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [table, filter, event, schema, JSON.stringify(queryKey)])

  return { channel: channelRef.current }
}

export function usePresence(roomName: string, userId: string, userMetadata?: Record<string, any>) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    const presenceChannel = supabase.channel(roomName, { config: { presence: { key: userId } } })

    presenceChannel
      .on('presence', { event: 'sync' }, () => {})
      .on('presence', { event: 'join' }, () => {})
      .on('presence', { event: 'leave' }, () => {})
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ user_id: userId, online_at: new Date().toISOString(), ...userMetadata })
        }
      })

    channelRef.current = presenceChannel

    return () => {
      presenceChannel.unsubscribe()
    }
  }, [roomName, userId, JSON.stringify(userMetadata)])

  const getOnlineUsers = (): any[] => {
    if (!channelRef.current) return []
    const state = channelRef.current.presenceState()
    return Object.values(state).flat() as any[]
  }

  return { channel: channelRef.current, getOnlineUsers }
}

export function useBroadcast(channelName: string, onMessage?: (payload: any) => void) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    const channel = supabase
      .channel(channelName, { config: { broadcast: { self: true } } })
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        onMessage?.(payload)
      })
      .subscribe()

    channelRef.current = channel
    return () => channel.unsubscribe()
  }, [channelName])

  const sendMessage = async (payload: any) => {
    if (!channelRef.current) return
    await channelRef.current.send({ type: 'broadcast', event: 'message', payload })
  }

  return { channel: channelRef.current, sendMessage }
}

