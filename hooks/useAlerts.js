// hooks/useAlerts.ts
import { useState, useEffect, useCallback } from 'react';
import { getSupplyAlerts, markAlertAsRead, resolveAlert, runAlertChecks, checkLowStock, checkExpiringItems, checkOverdueOrders, getNotifications, markNotificationAsRead, markAllNotificationsAsRead, createNotification, deleteNotification, getUserNotificationSettings, updateUserNotificationSettings, getAlertHistory, addAlertHistory, getUnreadNotificationCount, getAlertSummary, escalateAlert, getAutoAlertRules, createAutoAlertRule, updateAutoAlertRule } from '../services/alertService';
// ============================================================================
// HOOK PARA ALERTAS DE INSUMOS
// ============================================================================
export const useSupplyAlerts = (filters) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchAlerts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getSupplyAlerts(filters?.unreadOnly);
            let filteredAlerts = data;
            if (filters?.severity) {
                filteredAlerts = filteredAlerts.filter(alert => alert.severity === filters.severity);
            }
            if (filters?.alertType) {
                filteredAlerts = filteredAlerts.filter(alert => alert.alertType === filters.alertType);
            }
            setAlerts(filteredAlerts);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar alertas');
        }
        finally {
            setLoading(false);
        }
    }, [filters]);
    const markAsRead = useCallback(async (alertId) => {
        try {
            await markAlertAsRead(alertId);
            setAlerts(prev => prev.map(alert => alert.id === alertId ? { ...alert, isRead: true } : alert));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao marcar alerta como lido');
            throw err;
        }
    }, []);
    const resolveAlertById = useCallback(async (alertId) => {
        try {
            await resolveAlert(alertId);
            setAlerts(prev => prev.filter(alert => alert.id !== alertId));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao resolver alerta');
            throw err;
        }
    }, []);
    const escalateAlertById = useCallback(async (alertId, reason) => {
        try {
            await escalateAlert(alertId, reason);
            setAlerts(prev => prev.map(alert => alert.id === alertId ? { ...alert, severity: 'critical' } : alert));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao escalar alerta');
            throw err;
        }
    }, []);
    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);
    return {
        alerts,
        loading,
        error,
        refetch: fetchAlerts,
        markAsRead,
        resolveAlert: resolveAlertById,
        escalateAlert: escalateAlertById
    };
};
// ============================================================================
// HOOK PARA NOTIFICAÇÕES
// ============================================================================
export const useNotifications = (userId, unreadOnly = false) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getNotifications(userId, unreadOnly);
            setNotifications(data);
            if (userId) {
                const count = await getUnreadNotificationCount(userId);
                setUnreadCount(count);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar notificações');
        }
        finally {
            setLoading(false);
        }
    }, [userId, unreadOnly]);
    const markAsRead = useCallback(async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications(prev => prev.map(notification => notification.id === notificationId
                ? { ...notification, isRead: true, readAt: new Date().toISOString() }
                : notification));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao marcar notificação como lida');
            throw err;
        }
    }, []);
    const markAllAsRead = useCallback(async () => {
        if (!userId)
            return;
        try {
            await markAllNotificationsAsRead(userId);
            setNotifications(prev => prev.map(notification => ({
                ...notification,
                isRead: true,
                readAt: new Date().toISOString()
            })));
            setUnreadCount(0);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao marcar todas como lidas');
            throw err;
        }
    }, [userId]);
    const createNotificationItem = useCallback(async (notificationData) => {
        try {
            const newNotification = await createNotification(notificationData);
            setNotifications(prev => [newNotification, ...prev]);
            if (!newNotification.isRead) {
                setUnreadCount(prev => prev + 1);
            }
            return newNotification;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar notificação');
            throw err;
        }
    }, []);
    const deleteNotificationItem = useCallback(async (notificationId) => {
        try {
            await deleteNotification(notificationId);
            setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao excluir notificação');
            throw err;
        }
    }, []);
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);
    return {
        notifications,
        unreadCount,
        loading,
        error,
        refetch: fetchNotifications,
        markAsRead,
        markAllAsRead,
        createNotification: createNotificationItem,
        deleteNotification: deleteNotificationItem
    };
};
// ============================================================================
// HOOK PARA CONFIGURAÇÕES DE NOTIFICAÇÃO
// ============================================================================
export const useUserNotificationSettings = (userId) => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getUserNotificationSettings(userId);
            setSettings(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
        }
        finally {
            setLoading(false);
        }
    }, [userId]);
    const updateSettings = useCallback(async (newSettings) => {
        try {
            const updatedSettings = await updateUserNotificationSettings(userId, newSettings);
            setSettings(updatedSettings);
            return updatedSettings;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar configurações');
            throw err;
        }
    }, [userId]);
    useEffect(() => {
        if (userId) {
            fetchSettings();
        }
    }, [fetchSettings, userId]);
    return {
        settings,
        loading,
        error,
        refetch: fetchSettings,
        updateSettings
    };
};
// ============================================================================
// HOOK PARA HISTÓRICO DE ALERTAS
// ============================================================================
export const useAlertHistory = (alertId) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchHistory = useCallback(async () => {
        if (!alertId)
            return;
        try {
            setLoading(true);
            setError(null);
            const data = await getAlertHistory(alertId);
            setHistory(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar histórico');
        }
        finally {
            setLoading(false);
        }
    }, [alertId]);
    const addHistoryItem = useCallback(async (historyData) => {
        try {
            const newHistoryItem = await addAlertHistory(historyData);
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
// HOOK PARA REGRAS DE ALERTA AUTOMÁTICO
// ============================================================================
export const useAutoAlertRules = () => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchRules = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAutoAlertRules();
            setRules(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar regras');
        }
        finally {
            setLoading(false);
        }
    }, []);
    const addRule = useCallback(async (ruleData) => {
        try {
            const newRule = await createAutoAlertRule(ruleData);
            setRules(prev => [newRule, ...prev]);
            return newRule;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar regra');
            throw err;
        }
    }, []);
    const updateRule = useCallback(async (id, ruleData) => {
        try {
            const updatedRule = await updateAutoAlertRule(id, ruleData);
            setRules(prev => prev.map(rule => rule.id === id ? updatedRule : rule));
            return updatedRule;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar regra');
            throw err;
        }
    }, []);
    useEffect(() => {
        fetchRules();
    }, [fetchRules]);
    return {
        rules,
        loading,
        error,
        refetch: fetchRules,
        addRule,
        updateRule
    };
};
// ============================================================================
// HOOK PARA VERIFICAÇÕES AUTOMÁTICAS
// ============================================================================
export const useAlertChecks = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [lastRun, setLastRun] = useState(null);
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);
    const runChecks = useCallback(async () => {
        try {
            setIsRunning(true);
            setError(null);
            const checkResults = await runAlertChecks();
            setResults(checkResults);
            setLastRun(new Date());
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao executar verificações');
        }
        finally {
            setIsRunning(false);
        }
    }, []);
    const runLowStockCheck = useCallback(async () => {
        try {
            setIsRunning(true);
            setError(null);
            const alerts = await checkLowStock();
            setLastRun(new Date());
            return alerts;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao verificar estoque baixo');
            throw err;
        }
        finally {
            setIsRunning(false);
        }
    }, []);
    const runExpirationCheck = useCallback(async () => {
        try {
            setIsRunning(true);
            setError(null);
            const alerts = await checkExpiringItems();
            setLastRun(new Date());
            return alerts;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao verificar vencimentos');
            throw err;
        }
        finally {
            setIsRunning(false);
        }
    }, []);
    const runOverdueCheck = useCallback(async () => {
        try {
            setIsRunning(true);
            setError(null);
            const alerts = await checkOverdueOrders();
            setLastRun(new Date());
            return alerts;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao verificar pedidos em atraso');
            throw err;
        }
        finally {
            setIsRunning(false);
        }
    }, []);
    return {
        isRunning,
        lastRun,
        results,
        error,
        runChecks,
        runLowStockCheck,
        runExpirationCheck,
        runOverdueCheck
    };
};
// ============================================================================
// HOOK PARA RESUMO DE ALERTAS
// ============================================================================
export const useAlertSummary = () => {
    const [summary, setSummary] = useState({
        total: 0,
        bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
        byType: { low_stock: 0, critical_stock: 0, expiring: 0, expired: 0, overdue_order: 0 },
        unread: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchSummary = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAlertSummary();
            setSummary(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar resumo');
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
