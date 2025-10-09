// hooks/useReports.ts
import { useState, useEffect, useCallback } from 'react';
import { getConsumptionAnalytics, getConsumptionReport, getTaskCostAnalytics, getCostAnalysisReport, getSupplierPerformanceAnalytics, getSupplierPerformanceReport, getStockValuationReport, getPerformanceMetrics, calculatePerformanceMetrics, getScheduledReports, createScheduledReport, updateScheduledReport, deleteScheduledReport, getReportHistory, createReportHistory, exportReportToCSV, generateReportFilename, getReportSummary } from '../services/reportsService';
// ============================================================================
// HOOK PARA ANALYTICS DE CONSUMO
// ============================================================================
export const useConsumptionAnalytics = (filters) => {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getConsumptionAnalytics(filters);
            setAnalytics(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar analytics de consumo');
        }
        finally {
            setLoading(false);
        }
    }, [filters]);
    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);
    return {
        analytics,
        loading,
        error,
        refetch: fetchAnalytics
    };
};
export const useConsumptionReport = (filters) => {
    const [report, setReport] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const generateReport = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getConsumptionReport(filters);
            setReport(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao gerar relatório de consumo');
        }
        finally {
            setLoading(false);
        }
    }, [filters]);
    useEffect(() => {
        generateReport();
    }, [generateReport]);
    return {
        report,
        loading,
        error,
        refetch: generateReport
    };
};
// ============================================================================
// HOOK PARA ANALYTICS DE CUSTOS
// ============================================================================
export const useTaskCostAnalytics = (filters) => {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getTaskCostAnalytics(filters);
            setAnalytics(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar analytics de custos');
        }
        finally {
            setLoading(false);
        }
    }, [filters]);
    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);
    return {
        analytics,
        loading,
        error,
        refetch: fetchAnalytics
    };
};
export const useCostAnalysisReport = (filters) => {
    const [report, setReport] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const generateReport = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getCostAnalysisReport(filters);
            setReport(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao gerar relatório de análise de custos');
        }
        finally {
            setLoading(false);
        }
    }, [filters]);
    useEffect(() => {
        generateReport();
    }, [generateReport]);
    return {
        report,
        loading,
        error,
        refetch: generateReport
    };
};
// ============================================================================
// HOOK PARA ANALYTICS DE FORNECEDORES
// ============================================================================
export const useSupplierPerformanceAnalytics = () => {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getSupplierPerformanceAnalytics();
            setAnalytics(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar analytics de fornecedores');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);
    return {
        analytics,
        loading,
        error,
        refetch: fetchAnalytics
    };
};
export const useSupplierPerformanceReport = (supplierId) => {
    const [report, setReport] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const generateReport = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getSupplierPerformanceReport(supplierId);
            setReport(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao gerar relatório de fornecedores');
        }
        finally {
            setLoading(false);
        }
    }, [supplierId]);
    useEffect(() => {
        generateReport();
    }, [generateReport]);
    return {
        report,
        loading,
        error,
        refetch: generateReport
    };
};
// ============================================================================
// HOOK PARA VALORIZAÇÃO DO ESTOQUE
// ============================================================================
export const useStockValuationReport = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const generateReport = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getStockValuationReport();
            setReport(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao gerar relatório de valorização');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        generateReport();
    }, [generateReport]);
    return {
        report,
        loading,
        error,
        refetch: generateReport
    };
};
// ============================================================================
// HOOK PARA MÉTRICAS DE PERFORMANCE
// ============================================================================
export const usePerformanceMetrics = (period) => {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchMetrics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getPerformanceMetrics(period);
            setMetrics(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar métricas');
        }
        finally {
            setLoading(false);
        }
    }, [period]);
    const calculateMetrics = useCallback(async (periodStart, periodEnd) => {
        try {
            const count = await calculatePerformanceMetrics(periodStart, periodEnd);
            await fetchMetrics(); // Recarregar métricas após cálculo
            return count;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao calcular métricas');
            throw err;
        }
    }, [fetchMetrics]);
    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);
    return {
        metrics,
        loading,
        error,
        refetch: fetchMetrics,
        calculateMetrics
    };
};
// ============================================================================
// HOOK PARA RELATÓRIOS AGENDADOS
// ============================================================================
export const useScheduledReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getScheduledReports();
            setReports(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar relatórios agendados');
        }
        finally {
            setLoading(false);
        }
    }, []);
    const addReport = useCallback(async (reportData) => {
        try {
            const newReport = await createScheduledReport(reportData);
            setReports(prev => [newReport, ...prev]);
            return newReport;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar relatório agendado');
            throw err;
        }
    }, []);
    const editReport = useCallback(async (id, reportData) => {
        try {
            const updatedReport = await updateScheduledReport(id, reportData);
            setReports(prev => prev.map(report => report.id === id ? updatedReport : report));
            return updatedReport;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar relatório agendado');
            throw err;
        }
    }, []);
    const removeReport = useCallback(async (id) => {
        try {
            await deleteScheduledReport(id);
            setReports(prev => prev.filter(report => report.id !== id));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao excluir relatório agendado');
            throw err;
        }
    }, []);
    useEffect(() => {
        fetchReports();
    }, [fetchReports]);
    return {
        reports,
        loading,
        error,
        refetch: fetchReports,
        addReport,
        editReport,
        removeReport
    };
};
// ============================================================================
// HOOK PARA HISTÓRICO DE RELATÓRIOS
// ============================================================================
export const useReportHistory = (limit = 50) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getReportHistory(limit);
            setHistory(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar histórico de relatórios');
        }
        finally {
            setLoading(false);
        }
    }, [limit]);
    const addHistoryItem = useCallback(async (historyData) => {
        try {
            const newHistoryItem = await createReportHistory(historyData);
            setHistory(prev => [newHistoryItem, ...prev]);
            return newHistoryItem;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao adicionar histórico');
            throw err;
        }
    }, []);
    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);
    return {
        history,
        loading,
        error,
        refetch: fetchHistory,
        addHistoryItem
    };
};
// ============================================================================
// HOOK PARA EXPORTAÇÃO DE RELATÓRIOS
// ============================================================================
export const useReportExport = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState(null);
    const exportToCSV = useCallback(async (reportData, filename) => {
        try {
            setIsExporting(true);
            setError(null);
            const csvContent = await exportReportToCSV(reportData, filename);
            return csvContent;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao exportar relatório');
            throw err;
        }
        finally {
            setIsExporting(false);
        }
    }, []);
    const generateFilename = useCallback((reportType, format, date) => {
        return generateReportFilename(reportType, format, date);
    }, []);
    const downloadCSV = useCallback((csvContent, filename) => {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);
    return {
        isExporting,
        error,
        exportToCSV,
        generateFilename,
        downloadCSV
    };
};
// ============================================================================
// HOOK PARA RESUMO DE RELATÓRIOS
// ============================================================================
export const useReportSummary = () => {
    const [summary, setSummary] = useState({
        totalReports: 0,
        activeScheduledReports: 0,
        reportsGeneratedToday: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchSummary = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getReportSummary();
            setSummary(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar resumo de relatórios');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);
    return {
        summary,
        loading,
        error,
        refetch: fetchSummary
    };
};
