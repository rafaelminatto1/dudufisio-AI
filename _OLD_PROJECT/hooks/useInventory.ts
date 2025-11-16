/**
 * 📦 USE INVENTORY HOOK - DUDUFISIO-AI
 *
 * Hook customizado para gerenciar estoque, controle de materiais
 * e funcionalidades do sistema de inventário.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getItems,
  getSuppliers,
  getCategories,
  saveItem,
  addStockMovement,
  getDashboardMetrics
} from '../services/inventoryService';
import {
  InventoryItem,
  Supplier,
  InventoryCategory,
  MovementType,
  InventoryMetrics,
  InventoryAlert
} from '../types';
import { observability } from '../lib/observabilityLogger';

interface UseInventoryState {
  items: InventoryItem[];
  suppliers: Supplier[];
  categories: InventoryCategory[];
  metrics: InventoryMetrics | null;
  alerts: InventoryAlert[];
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

interface UseInventoryActions {
  loadItems: () => Promise<void>;
  loadSuppliers: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadMetrics: () => Promise<void>;
  createItem: (itemData: Omit<InventoryItem, 'id'>) => Promise<InventoryItem>;
  updateItem: (itemData: InventoryItem) => Promise<InventoryItem>;
  addMovement: (itemId: string, type: MovementType, quantity: number, reason: string) => Promise<InventoryItem>;
  getItemsByCategory: (categoryId: string) => InventoryItem[];
  getLowStockItems: () => InventoryItem[];
  getExpiringItems: (days?: number) => InventoryItem[];
  searchItems: (query: string) => InventoryItem[];
  getItemById: (id: string) => InventoryItem | undefined;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export function useInventory(): UseInventoryState & UseInventoryActions {
  const [state, setState] = useState<UseInventoryState>({
    items: [],
    suppliers: [],
    categories: [],
    metrics: null,
    alerts: [],
    isLoading: false,
    isUpdating: false,
    error: null
  });

  // Load items
  const loadItems = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const items = await getItems();

      setState(prev => ({
        ...prev,
        items,
        isLoading: false
      }));

      observability.application.info('inventory.items.loaded', {
        count: items.length
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar itens';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      observability.application.error('inventory.items.load_error', { error: errorMessage });
    }
  }, []);

  // Load suppliers
  const loadSuppliers = useCallback(async () => {
    try {
      const suppliers = await getSuppliers();

      setState(prev => ({
        ...prev,
        suppliers
      }));

      observability.application.info('inventory.suppliers.loaded', {
        count: suppliers.length
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar fornecedores';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, []);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const categories = await getCategories();

      setState(prev => ({
        ...prev,
        categories
      }));

      observability.application.info('inventory.categories.loaded', {
        count: categories.length
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar categorias';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, []);

  // Load metrics
  const loadMetrics = useCallback(async () => {
    try {
      const metrics = await getDashboardMetrics();

      setState(prev => ({
        ...prev,
        metrics,
        alerts: metrics.criticalAlerts || []
      }));

      observability.application.info('inventory.metrics.loaded', {
        totalItems: metrics.totalItems,
        lowStockItems: metrics.lowStockItems,
        totalValue: metrics.totalValue
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar métricas';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, []);

  // Create item
  const createItem = useCallback(async (itemData: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
    try {
      setState(prev => ({ ...prev, isUpdating: true, error: null }));

      const newItem = await saveItem(itemData);

      setState(prev => ({
        ...prev,
        items: [newItem, ...prev.items],
        isUpdating: false
      }));

      // Refresh metrics after creating
      await loadMetrics();

      observability.application.info('inventory.item.created', {
        itemId: newItem.id,
        itemName: newItem.name
      });

      return newItem;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar item';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isUpdating: false
      }));
      throw error;
    }
  }, [loadMetrics]);

  // Update item
  const updateItem = useCallback(async (itemData: InventoryItem): Promise<InventoryItem> => {
    try {
      setState(prev => ({ ...prev, isUpdating: true, error: null }));

      const updatedItem = await saveItem(itemData);

      setState(prev => ({
        ...prev,
        items: prev.items.map(item => item.id === updatedItem.id ? updatedItem : item),
        isUpdating: false
      }));

      // Refresh metrics after updating
      await loadMetrics();

      observability.application.info('inventory.item.updated', {
        itemId: updatedItem.id,
        itemName: updatedItem.name
      });

      return updatedItem;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar item';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isUpdating: false
      }));
      throw error;
    }
  }, [loadMetrics]);

  // Add movement
  const addMovement = useCallback(async (
    itemId: string,
    type: MovementType,
    quantity: number,
    reason: string
  ): Promise<InventoryItem> => {
    try {
      setState(prev => ({ ...prev, isUpdating: true, error: null }));

      const updatedItem = await addStockMovement(itemId, type, quantity, reason);

      setState(prev => ({
        ...prev,
        items: prev.items.map(item => item.id === updatedItem.id ? updatedItem : item),
        isUpdating: false
      }));

      // Refresh metrics after movement
      await loadMetrics();

      observability.application.info('inventory.movement.added', {
        itemId,
        type,
        quantity,
        reason
      });

      return updatedItem;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao adicionar movimentação';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isUpdating: false
      }));
      throw error;
    }
  }, [loadMetrics]);

  // Get items by category
  const getItemsByCategory = useCallback((categoryId: string): InventoryItem[] => {
    return state.items.filter(item => item.categoryId === categoryId);
  }, [state.items]);

  // Get low stock items
  const getLowStockItems = useCallback((): InventoryItem[] => {
    return state.items.filter(item => item.currentStock <= item.minStock);
  }, [state.items]);

  // Get expiring items
  const getExpiringItems = useCallback((days: number = 30): InventoryItem[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    return state.items.filter(item => {
      if (!item.expiryDate) return false;
      return new Date(item.expiryDate) <= cutoffDate;
    });
  }, [state.items]);

  // Search items
  const searchItems = useCallback((query: string): InventoryItem[] => {
    if (!query.trim()) return state.items;

    const lowercaseQuery = query.toLowerCase();
    return state.items.filter(item =>
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.description?.toLowerCase().includes(lowercaseQuery) ||
      item.brand?.toLowerCase().includes(lowercaseQuery) ||
      item.sku?.toLowerCase().includes(lowercaseQuery)
    );
  }, [state.items]);

  // Get item by ID
  const getItemById = useCallback((id: string): InventoryItem | undefined => {
    return state.items.find(item => item.id === id);
  }, [state.items]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadItems(),
      loadSuppliers(),
      loadCategories(),
      loadMetrics()
    ]);
  }, [loadItems, loadSuppliers, loadCategories, loadMetrics]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Initialize data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    ...state,
    loadItems,
    loadSuppliers,
    loadCategories,
    loadMetrics,
    createItem,
    updateItem,
    addMovement,
    getItemsByCategory,
    getLowStockItems,
    getExpiringItems,
    searchItems,
    getItemById,
    refreshData,
    clearError
  };
}

// Specialized hooks for specific inventory features

export function useInventoryMetrics() {
  const { metrics, isLoading, error, loadMetrics } = useInventory();

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refresh: loadMetrics
  };
}

export function useInventoryAlerts() {
  const { alerts, metrics, isLoading, error, loadMetrics } = useInventory();

  // Simular alertas com propriedade isRead
  const alertsWithReadStatus = alerts.map(alert => ({
    ...alert,
    isRead: Math.random() > 0.3 // Simular alguns lidos e outros não
  }));

  const unreadAlertsCount = alertsWithReadStatus.filter(alert => !alert.isRead).length;

  const markAsRead = (alertId: string) => {
    // Em produção, isso seria uma chamada para a API
    
  };

  const markAllAsRead = () => {
    // Em produção, isso seria uma chamada para a API
    
  };

  const dismissAlert = (alertId: string) => {
    // Em produção, isso seria uma chamada para a API
    
  };

  const exportAlerts = () => {
    // Em produção, isso exportaria os alertas para CSV/PDF
    
  };

  return {
    alerts: alertsWithReadStatus,
    unreadAlertsCount,
    isLoading,
    error,
    refresh: loadMetrics,
    markAsRead,
    markAllAsRead,
    dismissAlert,
    exportAlerts
  };
}

export function useLowStockItems() {
  const { items, isLoading, error, getLowStockItems, refreshData } = useInventory();

  const lowStockItems = getLowStockItems();

  return {
    lowStockItems,
    count: lowStockItems.length,
    isLoading,
    error,
    refresh: refreshData
  };
}

export function useExpiringItems(days: number = 30) {
  const { items, isLoading, error, getExpiringItems, refreshData } = useInventory();

  const expiringItems = getExpiringItems(days);

  return {
    expiringItems,
    count: expiringItems.length,
    isLoading,
    error,
    refresh: refreshData
  };
}

export function useItemSearch() {
  const { items, searchItems } = useInventory();
  const [query, setQuery] = useState('');

  const results = searchItems(query);

  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
  }, []);

  const clear = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    results,
    search,
    clear,
    resultCount: results.length,
    totalItems: items.length
  };
}