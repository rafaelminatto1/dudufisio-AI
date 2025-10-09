/**
 * React Query Hooks para Wearables
 * Hooks para integração com dispositivos wearables
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wearableIntegrationService } from '../services/wearables/wearableIntegrationService';
import { toast } from 'react-toastify';
// Query Keys
export const wearableKeys = {
    all: ['wearables'],
    connections: (patientId) => [...wearableKeys.all, 'connections', patientId],
    data: (patientId, type) => [...wearableKeys.all, 'data', patientId, type],
    aggregates: (patientId, period) => [...wearableKeys.all, 'aggregates', patientId, period],
    goals: (patientId) => [...wearableKeys.all, 'goals', patientId],
};
/**
 * Hook para buscar conexões de wearables
 */
export function useWearableConnections(patientId) {
    return useQuery({
        queryKey: wearableKeys.connections(patientId),
        queryFn: () => wearableIntegrationService.getConnections(patientId),
        enabled: !!patientId,
        staleTime: 5 * 60 * 1000,
    });
}
/**
 * Hook para buscar dados de wearables
 */
export function useWearableData(patientId, dataType, startDate, endDate) {
    return useQuery({
        queryKey: [...wearableKeys.data(patientId, dataType), startDate, endDate],
        queryFn: () => wearableIntegrationService.getWearableData(patientId, dataType, startDate, endDate),
        enabled: !!patientId,
        staleTime: 2 * 60 * 1000,
    });
}
/**
 * Hook para buscar métricas agregadas
 */
export function useWearableAggregates(patientId, period = 'week') {
    return useQuery({
        queryKey: wearableKeys.aggregates(patientId, period),
        queryFn: () => wearableIntegrationService.calculateAggregateMetrics(patientId, period),
        enabled: !!patientId,
        staleTime: 10 * 60 * 1000,
    });
}
/**
 * Hook para conectar dispositivo
 */
export function useConnectDevice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ patientId, deviceType, accessToken, refreshToken, }) => wearableIntegrationService.connectDevice(patientId, deviceType, accessToken, refreshToken),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: wearableKeys.connections(variables.patientId)
            });
            toast.success(`${variables.deviceType} conectado com sucesso!`);
        },
        onError: (err, variables) => {
            toast.error(`Erro ao conectar ${variables.deviceType}`);
            console.error(err);
        },
    });
}
/**
 * Hook para desconectar dispositivo
 */
export function useDisconnectDevice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ patientId, deviceType }) => wearableIntegrationService.disconnectDevice(patientId, deviceType),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: wearableKeys.connections(variables.patientId)
            });
            toast.success('Dispositivo desconectado');
        },
        onError: (err) => {
            toast.error('Erro ao desconectar dispositivo');
            console.error(err);
        },
    });
}
/**
 * Hook para sincronizar dispositivo
 */
export function useSyncDevice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ patientId, deviceType }) => wearableIntegrationService.syncDevice(patientId, deviceType),
        onSuccess: (syncedCount, variables) => {
            queryClient.invalidateQueries({
                queryKey: wearableKeys.data(variables.patientId)
            });
            queryClient.invalidateQueries({
                queryKey: wearableKeys.aggregates(variables.patientId)
            });
            toast.success(`${syncedCount} registros sincronizados!`);
        },
        onError: (err, variables) => {
            toast.error(`Erro ao sincronizar ${variables.deviceType}`);
            console.error(err);
        },
    });
}
/**
 * Hook para adicionar dados manualmente
 */
export function useAddWearableData() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => wearableIntegrationService.saveWearableData(data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: wearableKeys.data(variables.patient_id)
            });
            toast.success('Dados registrados!');
        },
        onError: (err) => {
            toast.error('Erro ao registrar dados');
            console.error(err);
        },
    });
}
