import { toast } from 'react-toastify'
import { useQueryClient } from '@tanstack/react-query'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { useRealtimeSubscription } from './useRealtimeSubscription'
import type { Database } from '../types/database'

type NotificationRow = Database['public']['Tables']['notifications']['Row']
type NotificationPayload = RealtimePostgresChangesPayload<NotificationRow>

interface FamilyNotificationRow {
  id: string
  family_member_id?: string | null
  title?: string | null
  message?: string | null
}

type FamilyNotificationPayload = RealtimePostgresChangesPayload<FamilyNotificationRow>

interface RiskAlertRow {
  id: string
  patient_id?: string | null
  patient_name?: string | null
  risk_level?: string | null
  score?: number | null
}

type RiskAlertPayload = RealtimePostgresChangesPayload<RiskAlertRow>

interface FamilyMessageRow {
  id: string
  patient_id?: string | null
  sender_type?: string | null
  sender_name?: string | null
}

type FamilyMessagePayload = RealtimePostgresChangesPayload<FamilyMessageRow>

interface SafetyEventRow {
  id: string
  severity?: string | null
  description?: string | null
}

type SafetyEventPayload = RealtimePostgresChangesPayload<SafetyEventRow>

export function useRealtimeNotifications(userId?: string) {
  const queryClient = useQueryClient()

  useRealtimeSubscription<NotificationPayload>({
    table: 'notifications',
    filter: userId ? `user_id=eq.${userId}` : undefined,
    queryKey: ['notifications', userId],
    onInsert: payload => {
      const notification = payload.new
      if (!notification) return

      toast.info(notification.title, {
        description: notification.message,
        action: notification.action_url
          ? {
              label: notification.action_label ?? 'Ver',
              onClick: () => {
                if (notification.action_url) {
                  window.location.href = notification.action_url
                }
              },
            }
          : undefined,
        duration: 5000,
      } as any)

      queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
    },
  })
}

export function useFamilyRealtimeNotifications(memberId?: string) {
  const queryClient = useQueryClient()

  useRealtimeSubscription<FamilyNotificationPayload>({
    table: 'family_notifications',
    filter: memberId ? `family_member_id=eq.${memberId}` : undefined,
    queryKey: ['family-notifications', memberId],
    onInsert: payload => {
      const notification = payload.new
      if (!notification) return
      toast.info(notification.title ?? 'Notificação', {
        description: notification.message ?? '',
        duration: 5000,
      } as any)
      queryClient.invalidateQueries({ queryKey: ['family-portal', 'notifications', memberId] })
    },
  })
}

export function useRealtimeRiskAlerts(patientId?: string) {
  const queryClient = useQueryClient()

  useRealtimeSubscription<RiskAlertPayload>({
    table: 'risk_alerts',
    filter: patientId ? `patient_id=eq.${patientId}` : undefined,
    queryKey: ['risk-alerts', patientId],
    onInsert: payload => {
      const alert = payload.new
      if (!alert) return
      const level = alert.risk_level?.toLowerCase()
      if (level === 'high' || level === 'critical') {
        toast.error(`⚠️ Alerta de Risco ${(alert.risk_level ?? '').toUpperCase()}`, {
          description: `Paciente: ${alert.patient_name ?? 'Desconhecido'} - Score: ${alert.score ?? '-'}`,
          duration: 10000,
        } as any)
      }
      queryClient.invalidateQueries({ queryKey: ['risk-alerts', patientId] })
      queryClient.invalidateQueries({ queryKey: ['risk-profile', patientId] })
    },
  })
}

export function useRealtimeFamilyMessages(patientId?: string) {
  const queryClient = useQueryClient()

  useRealtimeSubscription<FamilyMessagePayload>({
    table: 'family_messages',
    filter: patientId ? `patient_id=eq.${patientId}` : undefined,
    queryKey: ['family-portal', 'messages', patientId],
    onInsert: payload => {
      const message = payload.new
      if (!message) return
      if (message.sender_type === 'family') {
        toast.info('💬 Nova mensagem da família', {
          description: message.sender_name ? `De: ${message.sender_name}` : undefined,
          action: {
            label: 'Ver',
            onClick: () => {
              window.location.href = `/family-portal/${patientId}#messages`
            },
          },
        } as any)
      }
      queryClient.invalidateQueries({ queryKey: ['family-portal', 'messages', patientId] })
    },
  })
}

export function useRealtimeSafetyEvents() {
  const queryClient = useQueryClient()

  useRealtimeSubscription<SafetyEventPayload>({
    table: 'patient_safety_events',
    event: 'INSERT',
    queryKey: ['quality-assurance', 'safety-events'],
    onInsert: payload => {
      const event = payload.new
      if (!event) return
      const severity = event.severity?.toLowerCase()
      if (severity === 'critical' || severity === 'high') {
        toast.error('🚨 Evento de Segurança Crítico', {
          description: event.description ?? '',
          duration: 15000,
        } as any)
      }
      queryClient.invalidateQueries({ queryKey: ['quality-assurance', 'safety-events'] })
    },
  })
}
