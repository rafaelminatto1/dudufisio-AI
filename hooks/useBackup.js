/**
 * 🔄 USE BACKUP HOOK - DUDUFISIO-AI
 *
 * Hook customizado para gerenciar o sistema de backup de forma reativa.
 * Fornece acesso completo ao sistema de backup com estado reativo.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { backupService } from '../services/backup/backupService';
export const useBackup = (autoRefresh = true) => {
    const [config, setConfig] = useState(null);
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [currentBackup, setCurrentBackup] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // Carregar dados do sistema de backup
    const refreshData = useCallback(async () => {
        try {
            setError(null);
            const [currentConfig, currentStats, backupHistory, runningBackup] = await Promise.all([
                Promise.resolve(backupService.getConfig()),
                Promise.resolve(backupService.getBackupStats()),
                Promise.resolve(backupService.getBackupHistory()),
                Promise.resolve(backupService.getCurrentBackup())
            ]);
            setConfig(currentConfig);
            setStats(currentStats);
            setHistory(backupHistory);
            setCurrentBackup(runningBackup);
        }
        catch (err) {
            console.error('❌ Erro ao carregar dados de backup:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar dados de backup');
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    // Inicialização e auto-refresh
    useEffect(() => {
        refreshData();
        if (autoRefresh) {
            const interval = setInterval(refreshData, 30000); // 30 segundos
            return () => clearInterval(interval);
        }
    }, [refreshData, autoRefresh]);
    // Criar backup
    const createBackup = useCallback(async (type) => {
        try {
            setError(null);
            const backup = await backupService.createBackup(type, false);
            if (backup) {
                // Atualizar dados após criar backup
                await refreshData();
            }
            return backup;
        }
        catch (err) {
            console.error('❌ Erro ao criar backup:', err);
            setError(err instanceof Error ? err.message : 'Erro ao criar backup');
            return null;
        }
    }, [refreshData]);
    // Restaurar backup
    const restoreBackup = useCallback(async (options) => {
        try {
            setError(null);
            const success = await backupService.restoreBackup(options);
            if (success) {
                // Atualizar dados após restauração
                await refreshData();
            }
            return success;
        }
        catch (err) {
            console.error('❌ Erro ao restaurar backup:', err);
            setError(err instanceof Error ? err.message : 'Erro ao restaurar backup');
            return false;
        }
    }, [refreshData]);
    // Atualizar configuração
    const updateConfig = useCallback(async (newConfig) => {
        try {
            setError(null);
            const success = await backupService.updateConfig(newConfig);
            if (success) {
                // Atualizar configuração local
                setConfig(prev => prev ? { ...prev, ...newConfig } : null);
            }
            return success;
        }
        catch (err) {
            console.error('❌ Erro ao atualizar configuração:', err);
            setError(err instanceof Error ? err.message : 'Erro ao atualizar configuração');
            return false;
        }
    }, []);
    // Testar sistema
    const testSystem = useCallback(async () => {
        try {
            setError(null);
            const success = await backupService.testBackupSystem();
            // Atualizar dados após teste
            await refreshData();
            return success;
        }
        catch (err) {
            console.error('❌ Erro no teste do sistema:', err);
            setError(err instanceof Error ? err.message : 'Erro no teste do sistema');
            return false;
        }
    }, [refreshData]);
    // Pausar agendador
    const pauseScheduler = useCallback(async () => {
        try {
            setError(null);
            await backupService.pauseScheduler();
            // Atualizar configuração para refletir o estado pausado
            setConfig(prev => prev ? { ...prev, enabled: false } : null);
        }
        catch (err) {
            console.error('❌ Erro ao pausar agendador:', err);
            setError(err instanceof Error ? err.message : 'Erro ao pausar agendador');
        }
    }, []);
    // Retomar agendador
    const resumeScheduler = useCallback(async () => {
        try {
            setError(null);
            await backupService.resumeScheduler();
            // Atualizar configuração para refletir o estado ativo
            setConfig(prev => prev ? { ...prev, enabled: true } : null);
        }
        catch (err) {
            console.error('❌ Erro ao retomar agendador:', err);
            setError(err instanceof Error ? err.message : 'Erro ao retomar agendador');
        }
    }, []);
    // Estados computados
    const isBackupRunning = useMemo(() => {
        return backupService.isBackupRunning() || currentBackup !== null;
    }, [currentBackup]);
    const lastBackupDate = useMemo(() => {
        if (!stats?.lastBackup)
            return null;
        return new Date(stats.lastBackup);
    }, [stats?.lastBackup]);
    const successRate = useMemo(() => {
        return stats?.successRate || 0;
    }, [stats?.successRate]);
    const totalBackupSize = useMemo(() => {
        return stats?.totalSize || 0;
    }, [stats?.totalSize]);
    const availableBackups = useMemo(() => {
        return history.filter(backup => backup.status === 'completed');
    }, [history]);
    // Utilitários
    const formatSize = useCallback((bytes) => {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }, []);
    const formatDuration = useCallback((ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        }
        else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        }
        else {
            return `${seconds}s`;
        }
    }, []);
    const getBackupById = useCallback((id) => {
        return history.find(backup => backup.id === id) || null;
    }, [history]);
    return {
        // Estado do sistema
        config,
        stats,
        history,
        currentBackup,
        isLoading,
        error,
        // Estados computados
        isBackupRunning,
        lastBackupDate,
        successRate,
        totalBackupSize,
        availableBackups,
        // Ações
        createBackup,
        restoreBackup,
        updateConfig,
        testSystem,
        refreshData,
        // Controle do agendador
        pauseScheduler,
        resumeScheduler,
        // Utilitários
        formatSize,
        formatDuration,
        getBackupById
    };
};
export default useBackup;
