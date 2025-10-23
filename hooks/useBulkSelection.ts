import { useState, useCallback, useMemo } from 'react';

/**
 * Hook para gerenciar seleção múltipla de itens
 * Ideal para operações em lote (bulk actions)
 */
export function useBulkSelection<T extends { id: string }>() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);

  const toggleSelection = useCallback((id: string) => {
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

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setIsSelecting(false);
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const toggleSelectionMode = useCallback(() => {
    setIsSelecting((prev) => {
      if (prev) {
        // Se estava selecionando, limpar seleções
        setSelectedIds(new Set());
      }
      return !prev;
    });
  }, []);

  const selectedIdsArray = useMemo(() => Array.from(selectedIds), [selectedIds]);

  return {
    selectedIds: selectedIdsArray,
    selectedIdsSet: selectedIds,
    isSelecting,
    setIsSelecting,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    toggleSelectionMode,
    hasSelection: selectedIds.size > 0,
    selectionCount: selectedIds.size,
  };
}

export default useBulkSelection;

