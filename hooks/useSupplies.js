// hooks/useSupplies.ts
import { useState, useEffect, useCallback } from 'react';
import { getSupplies, getSupplyById, createSupply, updateSupply, deleteSupply, getSuppliers, createSupplier, updateSupplier, getStockMovements, createStockMovement, getPurchaseOrders, createPurchaseOrder, updatePurchaseOrderStatus, getSupplyAlerts, markAlertAsRead, resolveAlert, getSuppliesDashboardData } from '../services/suppliesService';
// ============================================================================
// HOOK PARA INSUMOS
// ============================================================================
export const useSupplies = (filters) => {
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchSupplies = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getSupplies(filters);
            setSupplies(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar insumos');
        }
        finally {
            setLoading(false);
        }
    }, [filters]);
    const addSupply = useCallback(async (supplyData) => {
        try {
            const newSupply = await createSupply(supplyData);
            setSupplies(prev => [newSupply, ...prev]);
            return newSupply;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar insumo');
            throw err;
        }
    }, []);
    const editSupply = useCallback(async (id, supplyData) => {
        try {
            const updatedSupply = await updateSupply(id, supplyData);
            setSupplies(prev => prev.map(supply => supply.id === id ? updatedSupply : supply));
            return updatedSupply;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar insumo');
            throw err;
        }
    }, []);
    const removeSupply = useCallback(async (id) => {
        try {
            await deleteSupply(id);
            setSupplies(prev => prev.filter(supply => supply.id !== id));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao excluir insumo');
            throw err;
        }
    }, []);
    useEffect(() => {
        fetchSupplies();
    }, [fetchSupplies]);
    return {
        supplies,
        loading,
        error,
        refetch: fetchSupplies,
        addSupply,
        editSupply,
        removeSupply
    };
};
// ============================================================================
// HOOK PARA FORNECEDORES
// ============================================================================
export const useSuppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchSuppliers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getSuppliers();
            setSuppliers(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar fornecedores');
        }
        finally {
            setLoading(false);
        }
    }, []);
    const addSupplier = useCallback(async (supplierData) => {
        try {
            const newSupplier = await createSupplier(supplierData);
            setSuppliers(prev => [newSupplier, ...prev]);
            return newSupplier;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar fornecedor');
            throw err;
        }
    }, []);
    const editSupplier = useCallback(async (id, supplierData) => {
        try {
            const updatedSupplier = await updateSupplier(id, supplierData);
            setSuppliers(prev => prev.map(supplier => supplier.id === id ? updatedSupplier : supplier));
            return updatedSupplier;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar fornecedor');
            throw err;
        }
    }, []);
    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);
    return {
        suppliers,
        loading,
        error,
        refetch: fetchSuppliers,
        addSupplier,
        editSupplier
    };
};
// ============================================================================
// HOOK PARA MOVIMENTAÇÕES DE ESTOQUE
// ============================================================================
export const useStockMovements = (filters) => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchMovements = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getStockMovements(filters);
            setMovements(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar movimentações');
        }
        finally {
            setLoading(false);
        }
    }, [filters]);
    const addMovement = useCallback(async (movementData) => {
        try {
            const newMovement = await createStockMovement(movementData);
            setMovements(prev => [newMovement, ...prev]);
            return newMovement;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar movimentação');
            throw err;
        }
    }, []);
    useEffect(() => {
        fetchMovements();
    }, [fetchMovements]);
    return {
        movements,
        loading,
        error,
        refetch: fetchMovements,
        addMovement
    };
};
// ============================================================================
// HOOK PARA PEDIDOS DE COMPRA
// ============================================================================
export const usePurchaseOrders = (filters) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getPurchaseOrders(filters);
            setOrders(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos');
        }
        finally {
            setLoading(false);
        }
    }, [filters]);
    const addOrder = useCallback(async (orderData) => {
        try {
            const newOrder = await createPurchaseOrder(orderData);
            setOrders(prev => [newOrder, ...prev]);
            return newOrder;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar pedido');
            throw err;
        }
    }, []);
    const updateOrderStatus = useCallback(async (id, status, approvedBy) => {
        try {
            const updatedOrder = await updatePurchaseOrderStatus(id, status, approvedBy);
            setOrders(prev => prev.map(order => order.id === id ? updatedOrder : order));
            return updatedOrder;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar pedido');
            throw err;
        }
    }, []);
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
    return {
        orders,
        loading,
        error,
        refetch: fetchOrders,
        addOrder,
        updateOrderStatus
    };
};
// ============================================================================
// HOOK PARA ALERTAS
// ============================================================================
export const useSupplyAlerts = (unreadOnly = false) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const fetchAlerts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getSupplyAlerts(unreadOnly);
            setAlerts(data);
            if (!unreadOnly) {
                setUnreadCount(data.filter(alert => !alert.isRead).length);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar alertas');
        }
        finally {
            setLoading(false);
        }
    }, [unreadOnly]);
    const markAsRead = useCallback(async (alertId) => {
        try {
            await markAlertAsRead(alertId);
            setAlerts(prev => prev.map(alert => alert.id === alertId ? { ...alert, isRead: true } : alert));
            setUnreadCount(prev => Math.max(0, prev - 1));
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
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao resolver alerta');
            throw err;
        }
    }, []);
    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);
    return {
        alerts,
        unreadCount,
        loading,
        error,
        refetch: fetchAlerts,
        markAsRead,
        resolveAlert: resolveAlertById
    };
};
// ============================================================================
// HOOK PARA DASHBOARD DE INSUMOS
// ============================================================================
export const useSuppliesDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getSuppliesDashboardData();
            setDashboardData(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);
    return {
        dashboardData,
        loading,
        error,
        refetch: fetchDashboardData
    };
};
// ============================================================================
// HOOK PARA INSUMO ESPECÍFICO
// ============================================================================
export const useSupply = (id) => {
    const [supply, setSupply] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchSupply = useCallback(async () => {
        if (!id)
            return;
        try {
            setLoading(true);
            setError(null);
            const data = await getSupplyById(id);
            setSupply(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar insumo');
        }
        finally {
            setLoading(false);
        }
    }, [id]);
    const editSupply = useCallback(async (supplyData) => {
        if (!id)
            return;
        try {
            const updatedSupply = await updateSupply(id, supplyData);
            setSupply(updatedSupply);
            return updatedSupply;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar insumo');
            throw err;
        }
    }, [id]);
    useEffect(() => {
        fetchSupply();
    }, [fetchSupply]);
    return {
        supply,
        loading,
        error,
        refetch: fetchSupply,
        editSupply
    };
};
