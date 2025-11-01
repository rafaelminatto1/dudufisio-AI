import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

export interface BulkAction<T> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: (items: T[]) => Promise<void>;
  variant?: 'default' | 'destructive';
  requiresConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationDescription?: string;
  disabled?: (items: T[]) => boolean;
}

export interface UseBulkActionsConfig<T> {
  actions: BulkAction<T>[];
  messages?: {
    successPrefix?: string;
    errorPrefix?: string;
  };
}

export function useBulkActions<T extends { id: string }>({
  actions,
  messages = {},
}: UseBulkActionsConfig<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<BulkAction<T> | null>(null);

  const selectItem = useCallback((id: string) => {
    setSelectedIds((prev) => new Set(prev).add(id));
  }, []);

  const deselectItem = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggleItem = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((items: T[]) => {
    setSelectedIds(new Set(items.map((item) => item.id)));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleAll = useCallback((items: T[]) => {
    if (selectedIds.size === items.length) {
      deselectAll();
    } else {
      selectAll(items);
    }
  }, [selectedIds.size, deselectAll, selectAll]);

  const isSelected = useCallback(
    (id: string) => {
      return selectedIds.has(id);
    },
    [selectedIds]
  );

  const isAllSelected = useCallback(
    (items: T[]) => {
      return items.length > 0 && items.every((item) => selectedIds.has(item.id));
    },
    [selectedIds]
  );

  const isSomeSelected = useCallback(
    (items: T[]) => {
      return items.some((item) => selectedIds.has(item.id)) && !isAllSelected(items);
    },
    [selectedIds, isAllSelected]
  );

  const getSelectedItems = useCallback(
    (items: T[]): T[] => {
      return items.filter((item) => selectedIds.has(item.id));
    },
    [selectedIds]
  );

  const executeAction = useCallback(
    async (action: BulkAction<T>, items: T[]) => {
      const selectedItems = getSelectedItems(items);

      if (selectedItems.length === 0) {
        toast.error('Nenhum item selecionado');
        return;
      }

      if (action.disabled?.(selectedItems)) {
        return;
      }

      if (action.requiresConfirmation) {
        setPendingAction(action);
        setConfirmDialogOpen(true);
        return;
      }

      await performAction(action, selectedItems);
    },
    [getSelectedItems]
  );

  const performAction = useCallback(
    async (action: BulkAction<T>, items: T[]) => {
      setIsProcessing(true);
      setCurrentAction(action.id);

      try {
        await action.action(items);
        toast.success(
          messages.successPrefix
            ? `${messages.successPrefix} ${items.length} item(s)`
            : `${action.label} executado com sucesso em ${items.length} item(s)`
        );
        deselectAll();
      } catch (error) {
        toast.error(
          messages.errorPrefix
            ? `${messages.errorPrefix} ${action.label}`
            : `Erro ao executar ${action.label}`
        );
        console.error('Bulk action error:', error);
      } finally {
        setIsProcessing(false);
        setCurrentAction(null);
        setConfirmDialogOpen(false);
        setPendingAction(null);
      }
    },
    [messages, deselectAll]
  );

  const confirmPendingAction = useCallback(
    async (items: T[]) => {
      if (pendingAction) {
        const selectedItems = getSelectedItems(items);
        await performAction(pendingAction, selectedItems);
      }
    },
    [pendingAction, getSelectedItems, performAction]
  );

  const cancelPendingAction = useCallback(() => {
    setConfirmDialogOpen(false);
    setPendingAction(null);
  }, []);

  const selectedCount = useMemo(() => selectedIds.size, [selectedIds]);

  return {
    // Selection state
    selectedIds,
    selectedCount,
    isSelected,
    isAllSelected,
    isSomeSelected,
    getSelectedItems,

    // Selection actions
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    deselectAll,
    toggleAll,

    // Bulk actions
    executeAction,
    isProcessing,
    currentAction,

    // Confirmation dialog
    confirmDialogOpen,
    pendingAction,
    confirmPendingAction,
    cancelPendingAction,
  };
}

