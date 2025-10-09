/**
 * React Query Hooks para Family Portal
 * Hooks para portal da família com LGPD compliance
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { familyPortalServiceSupabase } from '../services/family/familyPortalServiceSupabase';
import { toast } from 'react-toastify';
// Query Keys
export const familyKeys = {
    all: ['family-portal'],
    members: (patientId) => [...familyKeys.all, 'members', patientId],
    member: (id) => [...familyKeys.all, 'member', id],
    messages: (patientId) => [...familyKeys.all, 'messages', patientId],
    notifications: (memberId) => [...familyKeys.all, 'notifications', memberId],
    reports: (patientId) => [...familyKeys.all, 'reports', patientId],
    accessLogs: (memberId) => [...familyKeys.all, 'access-logs', memberId],
};
/**
 * Hook para buscar membros da família de um paciente
 */
export function useFamilyMembers(patientId) {
    return useQuery({
        queryKey: familyKeys.members(patientId),
        queryFn: () => familyPortalServiceSupabase.getFamilyMembers(patientId),
        enabled: !!patientId,
        staleTime: 5 * 60 * 1000,
    });
}
/**
 * Hook para buscar mensagens entre família e terapeuta
 */
export function useFamilyMessages(patientId) {
    return useQuery({
        queryKey: familyKeys.messages(patientId),
        queryFn: () => familyPortalServiceSupabase.getMessages(patientId),
        enabled: !!patientId,
        staleTime: 1 * 60 * 1000, // 1 minuto - mensagens são mais voláteis
        refetchInterval: 30 * 1000, // Refetch a cada 30s
    });
}
/**
 * Hook para buscar notificações de um membro
 */
export function useFamilyNotifications(memberId) {
    return useQuery({
        queryKey: familyKeys.notifications(memberId),
        queryFn: () => familyPortalServiceSupabase.getNotifications(memberId),
        enabled: !!memberId,
        staleTime: 1 * 60 * 1000,
        refetchInterval: 60 * 1000, // Refetch a cada 1 minuto
    });
}
/**
 * Hook para buscar relatórios compartilhados
 */
export function useSharedReports(patientId) {
    return useQuery({
        queryKey: familyKeys.reports(patientId),
        queryFn: () => familyPortalServiceSupabase.getSharedReports(patientId),
        enabled: !!patientId,
        staleTime: 5 * 60 * 1000,
    });
}
/**
 * Hook para buscar logs de acesso (LGPD)
 */
export function useAccessLogs(memberId) {
    return useQuery({
        queryKey: familyKeys.accessLogs(memberId),
        queryFn: () => familyPortalServiceSupabase.getAccessLogs(memberId),
        enabled: !!memberId,
        staleTime: 10 * 60 * 1000,
    });
}
/**
 * Hook para adicionar membro da família
 */
export function useAddFamilyMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => familyPortalServiceSupabase.addFamilyMember(data),
        onSuccess: (data, variables) => {
            if (variables.patient_id) {
                queryClient.invalidateQueries({
                    queryKey: familyKeys.members(variables.patient_id)
                });
            }
            toast.success('Membro da família adicionado com sucesso!');
        },
        onError: (err) => {
            toast.error('Erro ao adicionar membro da família');
            console.error(err);
        },
    });
}
/**
 * Hook para enviar mensagem
 */
export function useSendMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => familyPortalServiceSupabase.sendMessage(data),
        onMutate: async (newMessage) => {
            const patientId = newMessage.patient_id;
            if (!patientId)
                return;
            await queryClient.cancelQueries({ queryKey: familyKeys.messages(patientId) });
            const previousMessages = queryClient.getQueryData(familyKeys.messages(patientId));
            // Optimistic update
            queryClient.setQueryData(familyKeys.messages(patientId), (old = []) => [
                ...old,
                { ...newMessage, id: 'temp-' + Date.now(), created_at: new Date().toISOString() },
            ]);
            return { previousMessages, patientId };
        },
        onError: (err, newMessage, context) => {
            if (context?.previousMessages && context?.patientId) {
                queryClient.setQueryData(familyKeys.messages(context.patientId), context.previousMessages);
            }
            toast.error('Erro ao enviar mensagem');
            console.error(err);
        },
        onSuccess: (data, variables) => {
            if (variables.patient_id) {
                queryClient.invalidateQueries({
                    queryKey: familyKeys.messages(variables.patient_id)
                });
            }
            toast.success('Mensagem enviada!');
        },
    });
}
/**
 * Hook para atualizar permissões
 */
export function useUpdatePermissions() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ memberId, permissions }) => familyPortalServiceSupabase.updatePermissions(memberId, permissions),
        onSuccess: (data, { memberId }) => {
            queryClient.invalidateQueries({ queryKey: familyKeys.member(memberId) });
            toast.success('Permissões atualizadas!');
        },
        onError: (err) => {
            toast.error('Erro ao atualizar permissões');
            console.error(err);
        },
    });
}
/**
 * Hook para revogar acesso
 */
export function useRevokeAccess() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (memberId) => familyPortalServiceSupabase.revokeAccess(memberId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: familyKeys.all });
            toast.success('Acesso revogado!');
        },
        onError: (err) => {
            toast.error('Erro ao revogar acesso');
            console.error(err);
        },
    });
}
