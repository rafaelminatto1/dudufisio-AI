/**
 * Real-time Notifications Hook
 * Sistema de notificações em tempo real integrado com React Query
 */
import { toast } from 'react-toastify';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import { useQueryClient } from '@tanstack/react-query';
/**
 * Hook para notificações real-time do usuário
 *
 * @example
 * ```tsx
 * function App() {
 *   const userId = useCurrentUser()?.id;
 *   useRealtimeNotifications(userId);
 *
 *   return <YourApp />;
 * }
 * ```
 */
export function useRealtimeNotifications(userId) {
    const queryClient = useQueryClient();
    useRealtimeSubscription({
        table: 'notifications',
        filter: userId ? `user_id=eq.${userId}` : undefined,
        queryKey: ['notifications', userId],
        onInsert: (payload) => {
            const notification = payload.new;
            // Mostrar toast com a notificação
            toast.info(notification.title, {
                description: notification.message,
                action: notification.action_url ? {
                    label: 'Ver',
                    onClick: () => {
                        if (notification.action_url) {
                            window.location.href = notification.action_url;
                        }
                    },
                } : undefined,
                duration: 5000,
            });
            // Invalidar queries de notificações
            queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
        },
    });
}
/**
 * Hook para notificações da família em tempo real
 */
export function useFamilyRealtimeNotifications(memberId) {
    const queryClient = useQueryClient();
    useRealtimeSubscription({
        table: 'family_notifications',
        filter: memberId ? `family_member_id=eq.${memberId}` : undefined,
        queryKey: ['family-notifications', memberId],
        onInsert: (payload) => {
            const notification = payload.new;
            toast.info(notification.title, {
                description: notification.message,
                duration: 5000,
            });
            queryClient.invalidateQueries({
                queryKey: ['family-portal', 'notifications', memberId]
            });
        },
    });
}
/**
 * Hook para alertas de risco em tempo real
 */
export function useRealtimeRiskAlerts(patientId) {
    const queryClient = useQueryClient();
    useRealtimeSubscription({
        table: 'risk_alerts',
        filter: patientId ? `patient_id=eq.${patientId}` : undefined,
        queryKey: ['risk-alerts', patientId],
        onInsert: (payload) => {
            const alert = payload.new;
            // Alerta de alto risco em vermelho
            if (alert.risk_level === 'high' || alert.risk_level === 'critical') {
                toast.error(`⚠️ Alerta de Risco ${alert.risk_level.toUpperCase()}`, {
                    description: `Paciente: ${alert.patient_name} - Score: ${alert.score}`,
                    duration: 10000, // 10 segundos para alertas críticos
                });
            }
            queryClient.invalidateQueries({ queryKey: ['risk-alerts', patientId] });
            queryClient.invalidateQueries({ queryKey: ['risk-profile', patientId] });
        },
    });
}
/**
 * Hook para mensagens da família em tempo real
 */
export function useRealtimeFamilyMessages(patientId) {
    const queryClient = useQueryClient();
    useRealtimeSubscription({
        table: 'family_messages',
        filter: patientId ? `patient_id=eq.${patientId}` : undefined,
        queryKey: ['family-portal', 'messages', patientId],
        onInsert: (payload) => {
            const message = payload.new;
            // Apenas notificar se for mensagem da família para terapeuta
            if (message.sender_type === 'family') {
                toast.info('💬 Nova mensagem da família', {
                    description: `De: ${message.sender_name}`,
                    action: {
                        label: 'Ver',
                        onClick: () => {
                            window.location.href = `/family-portal/${patientId}#messages`;
                        },
                    },
                });
            }
            queryClient.invalidateQueries({
                queryKey: ['family-portal', 'messages', patientId]
            });
        },
    });
}
/**
 * Hook para eventos de segurança em tempo real
 */
export function useRealtimeSafetyEvents() {
    const queryClient = useQueryClient();
    useRealtimeSubscription({
        table: 'patient_safety_events',
        event: 'INSERT',
        queryKey: ['quality-assurance', 'safety-events'],
        onInsert: (payload) => {
            const event = payload.new;
            // Notificação urgente para eventos de segurança
            if (event.severity === 'critical' || event.severity === 'high') {
                toast.error('🚨 Evento de Segurança Crítico', {
                    description: event.description,
                    duration: 15000, // 15 segundos
                });
            }
            queryClient.invalidateQueries({
                queryKey: ['quality-assurance', 'safety-events']
            });
        },
    });
}
