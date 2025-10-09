/**
 * React Query Hooks para Quality Assurance
 * Hooks para garantia de qualidade e compliance
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { qualityAssuranceServiceSupabase } from '../services/quality/qualityAssuranceServiceSupabase';
// Query Keys
export const qualityKeys = {
    all: ['quality-assurance'],
    audits: () => [...qualityKeys.all, 'audits'],
    audit: (id) => [...qualityKeys.audits(), id],
    metrics: (date) => [...qualityKeys.all, 'metrics', date],
    indicators: () => [...qualityKeys.all, 'indicators'],
    indicator: (id) => [...qualityKeys.indicators(), id],
    measurements: (indicatorId) => [...qualityKeys.all, 'measurements', indicatorId],
    issues: (status) => [...qualityKeys.all, 'issues', status],
    safetyEvents: () => [...qualityKeys.all, 'safety-events'],
    compliance: (type) => [...qualityKeys.all, 'compliance', type],
};
/**
 * Hook para buscar auditorias de compliance
 */
export function useComplianceAudits() {
    return useQuery({
        queryKey: qualityKeys.audits(),
        queryFn: () => qualityAssuranceServiceSupabase.getComplianceAudits(),
        staleTime: 15 * 60 * 1000, // 15 minutos
    });
}
/**
 * Hook para buscar métricas de qualidade
 */
export function useQualityMetrics(date = 'current') {
    return useQuery({
        queryKey: qualityKeys.metrics(date),
        queryFn: () => qualityAssuranceServiceSupabase.getQualityMetrics(date),
        staleTime: 10 * 60 * 1000,
    });
}
/**
 * Hook para buscar indicadores de qualidade (KPIs)
 */
export function useQualityIndicators() {
    return useQuery({
        queryKey: qualityKeys.indicators(),
        queryFn: () => qualityAssuranceServiceSupabase.getQualityIndicators(),
        staleTime: 20 * 60 * 1000, // 20 minutos - KPIs mudam raramente
    });
}
/**
 * Hook para buscar medições de um indicador
 */
export function useIndicatorMeasurements(indicatorId) {
    return useQuery({
        queryKey: qualityKeys.measurements(indicatorId),
        queryFn: () => qualityAssuranceServiceSupabase.getIndicatorMeasurements(indicatorId),
        enabled: !!indicatorId,
        staleTime: 10 * 60 * 1000,
    });
}
/**
 * Hook para buscar issues de compliance
 */
export function useComplianceIssues(status = 'open') {
    return useQuery({
        queryKey: qualityKeys.issues(status),
        queryFn: () => qualityAssuranceServiceSupabase.getComplianceIssues(status),
        staleTime: 5 * 60 * 1000, // 5 minutos - issues precisam ser monitorados
    });
}
/**
 * Hook para buscar eventos de segurança
 */
export function useSafetyEvents() {
    return useQuery({
        queryKey: qualityKeys.safetyEvents(),
        queryFn: () => qualityAssuranceServiceSupabase.getSafetyEvents(),
        staleTime: 5 * 60 * 1000,
        refetchInterval: 60 * 1000, // Refetch a cada 1 minuto - eventos de segurança são críticos
    });
}
/**
 * Hook para buscar status de compliance geral
 */
export function useComplianceStatus(type) {
    return useQuery({
        queryKey: qualityKeys.compliance(type),
        queryFn: () => qualityAssuranceServiceSupabase.getComplianceStatus(type),
        staleTime: 10 * 60 * 1000,
    });
}
/**
 * Hook para buscar compliance COFFITO
 */
export function useCOFFITOCompliance() {
    return useQuery({
        queryKey: [...qualityKeys.compliance('coffito')],
        queryFn: () => qualityAssuranceServiceSupabase.getCOFFITOCompliance(),
        staleTime: 15 * 60 * 1000,
    });
}
/**
 * Hook para buscar compliance LGPD
 */
export function useLGPDCompliance() {
    return useQuery({
        queryKey: [...qualityKeys.compliance('lgpd')],
        queryFn: () => qualityAssuranceServiceSupabase.getLGPDCompliance(),
        staleTime: 15 * 60 * 1000,
    });
}
/**
 * Hook para prefetch de dados de qualidade (dashboard)
 */
export function usePrefetchQualityData() {
    const queryClient = useQueryClient();
    return {
        prefetchAll: () => {
            queryClient.prefetchQuery({
                queryKey: qualityKeys.metrics(),
                queryFn: () => qualityAssuranceServiceSupabase.getQualityMetrics('current'),
            });
            queryClient.prefetchQuery({
                queryKey: qualityKeys.indicators(),
                queryFn: () => qualityAssuranceServiceSupabase.getQualityIndicators(),
            });
            queryClient.prefetchQuery({
                queryKey: qualityKeys.issues('open'),
                queryFn: () => qualityAssuranceServiceSupabase.getComplianceIssues('open'),
            });
        },
    };
}
