/**
 * 📊 USE REPORTING HOOK - DUDUFISIO-AI
 *
 * Hook customizado para gerenciar relatórios, templates e
 * funcionalidades de Business Intelligence.
 */
import { useState, useEffect, useCallback } from 'react';
import { reportingService } from '../services/reportingService';
import { observability } from '../lib/observabilityLogger';
export function useReporting() {
    const [state, setState] = useState({
        templates: [],
        reports: [],
        biMetrics: null,
        complianceReport: null,
        predictiveAnalytics: null,
        isLoading: false,
        isGenerating: false,
        error: null
    });
    // Load templates
    const loadTemplates = useCallback(async (category) => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));
            const templates = reportingService.getTemplates(category);
            setState(prev => ({
                ...prev,
                templates,
                isLoading: false
            }));
            observability.application.info('reporting.templates.loaded', {
                count: templates.length,
                category
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar templates';
            setState(prev => ({
                ...prev,
                error: errorMessage,
                isLoading: false
            }));
            observability.application.error('reporting.templates.load_error', { error: errorMessage });
        }
    }, []);
    // Generate report
    const generateReport = useCallback(async (templateId, parameters) => {
        try {
            setState(prev => ({ ...prev, isGenerating: true, error: null }));
            const report = await reportingService.generateReport(templateId, parameters, 'current-user' // In real app, get from auth context
            );
            setState(prev => ({
                ...prev,
                reports: [report, ...prev.reports],
                isGenerating: false
            }));
            observability.application.info('reporting.report.generated', {
                reportId: report.id,
                templateId
            });
            return report;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar relatório';
            setState(prev => ({
                ...prev,
                error: errorMessage,
                isGenerating: false
            }));
            observability.application.error('reporting.report.generate_error', { error: errorMessage });
            throw error;
        }
    }, []);
    // Load generated reports
    const loadReports = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));
            const reports = reportingService.getGeneratedReports();
            setState(prev => ({
                ...prev,
                reports,
                isLoading: false
            }));
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar relatórios';
            setState(prev => ({
                ...prev,
                error: errorMessage,
                isLoading: false
            }));
        }
    }, []);
    // Delete report
    const deleteReport = useCallback(async (reportId) => {
        try {
            await reportingService.deleteReport(reportId);
            setState(prev => ({
                ...prev,
                reports: prev.reports.filter(r => r.id !== reportId)
            }));
            observability.application.info('reporting.report.deleted', { reportId });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar relatório';
            setState(prev => ({ ...prev, error: errorMessage }));
        }
    }, []);
    // Load Business Intelligence metrics
    const loadBIMetrics = useCallback(async (dateRange) => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));
            const biMetrics = await reportingService.getBusinessIntelligenceMetrics(dateRange);
            setState(prev => ({
                ...prev,
                biMetrics,
                isLoading: false
            }));
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar métricas de BI';
            setState(prev => ({
                ...prev,
                error: errorMessage,
                isLoading: false
            }));
        }
    }, []);
    // Load compliance report
    const loadComplianceReport = useCallback(async (areas, dateRange) => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));
            const complianceReport = await reportingService.getComplianceReport(areas, dateRange);
            setState(prev => ({
                ...prev,
                complianceReport,
                isLoading: false
            }));
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar relatório de compliance';
            setState(prev => ({
                ...prev,
                error: errorMessage,
                isLoading: false
            }));
        }
    }, []);
    // Load predictive analytics
    const loadPredictiveAnalytics = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));
            const predictiveAnalytics = await reportingService.getPredictiveAnalytics();
            setState(prev => ({
                ...prev,
                predictiveAnalytics,
                isLoading: false
            }));
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar analytics preditivos';
            setState(prev => ({
                ...prev,
                error: errorMessage,
                isLoading: false
            }));
        }
    }, []);
    // Schedule report
    const scheduleReport = useCallback(async (templateId, parameters, schedule) => {
        try {
            const scheduleId = await reportingService.scheduleReport(templateId, parameters, schedule, 'current-user');
            observability.application.info('reporting.schedule.created', {
                scheduleId,
                templateId
            });
            return scheduleId;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao agendar relatório';
            setState(prev => ({ ...prev, error: errorMessage }));
            throw error;
        }
    }, []);
    // Export report
    const exportReport = useCallback(async (reportId, format) => {
        try {
            const report = reportingService.getReport(reportId);
            if (!report) {
                throw new Error('Relatório não encontrado');
            }
            // Return download URL from the report
            const downloadUrl = report.downloadUrls[format];
            if (!downloadUrl) {
                throw new Error(`Formato ${format} não disponível para este relatório`);
            }
            return downloadUrl;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao exportar relatório';
            setState(prev => ({ ...prev, error: errorMessage }));
            throw error;
        }
    }, []);
    // Refresh all data
    const refreshData = useCallback(async () => {
        try {
            await Promise.all([
                loadTemplates(),
                loadReports(),
                loadBIMetrics({
                    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    end: new Date().toISOString()
                }),
                loadComplianceReport(['coffito', 'lgpd', 'quality'], {
                    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    end: new Date().toISOString()
                }),
                loadPredictiveAnalytics()
            ]);
        }
        catch (error) {
            // Individual errors are handled by each function
            observability.application.error('reporting.refresh.error', { error });
        }
    }, [loadTemplates, loadReports, loadBIMetrics, loadComplianceReport, loadPredictiveAnalytics]);
    // Initialize on mount
    useEffect(() => {
        refreshData();
    }, [refreshData]);
    return {
        ...state,
        loadTemplates,
        generateReport,
        loadReports,
        deleteReport,
        loadBIMetrics,
        loadComplianceReport,
        loadPredictiveAnalytics,
        scheduleReport,
        exportReport,
        refreshData
    };
}
// Specialized hooks for specific use cases
export function useFinancialReports() {
    const reporting = useReporting();
    useEffect(() => {
        reporting.loadTemplates('financial');
    }, []);
    const generateFinancialSummary = useCallback(async (dateRange, includeForecasts = true) => {
        return reporting.generateReport('financial-summary', {
            dateRange,
            includeForecasts
        });
    }, [reporting]);
    return {
        templates: reporting.templates.filter(t => t.category === 'financial'),
        reports: reporting.reports.filter(r => reporting.templates.find(t => t.id === r.templateId)?.category === 'financial'),
        isLoading: reporting.isLoading,
        isGenerating: reporting.isGenerating,
        error: reporting.error,
        generateFinancialSummary,
        biMetrics: reporting.biMetrics
    };
}
export function useClinicalReports() {
    const reporting = useReporting();
    useEffect(() => {
        reporting.loadTemplates('clinical');
    }, []);
    const generateClinicalPerformance = useCallback(async (dateRange, therapists, protocols) => {
        return reporting.generateReport('clinical-performance', {
            dateRange,
            therapists,
            protocols
        });
    }, [reporting]);
    return {
        templates: reporting.templates.filter(t => t.category === 'clinical'),
        reports: reporting.reports.filter(r => reporting.templates.find(t => t.id === r.templateId)?.category === 'clinical'),
        isLoading: reporting.isLoading,
        isGenerating: reporting.isGenerating,
        error: reporting.error,
        generateClinicalPerformance
    };
}
export function useOperationalReports() {
    const reporting = useReporting();
    useEffect(() => {
        reporting.loadTemplates('operational');
    }, []);
    const generateOperationalDashboard = useCallback(async (period = 'today') => {
        return reporting.generateReport('operational-dashboard', { period });
    }, [reporting]);
    return {
        templates: reporting.templates.filter(t => t.category === 'operational'),
        reports: reporting.reports.filter(r => reporting.templates.find(t => t.id === r.templateId)?.category === 'operational'),
        isLoading: reporting.isLoading,
        isGenerating: reporting.isGenerating,
        error: reporting.error,
        generateOperationalDashboard
    };
}
export function useComplianceReports() {
    const reporting = useReporting();
    useEffect(() => {
        reporting.loadTemplates('compliance');
    }, []);
    const generateComplianceReport = useCallback(async (complianceArea, dateRange) => {
        return reporting.generateReport('compliance-report', {
            complianceArea,
            dateRange
        });
    }, [reporting]);
    return {
        templates: reporting.templates.filter(t => t.category === 'compliance'),
        reports: reporting.reports.filter(r => reporting.templates.find(t => t.id === r.templateId)?.category === 'compliance'),
        complianceReport: reporting.complianceReport,
        isLoading: reporting.isLoading,
        isGenerating: reporting.isGenerating,
        error: reporting.error,
        generateComplianceReport
    };
}
