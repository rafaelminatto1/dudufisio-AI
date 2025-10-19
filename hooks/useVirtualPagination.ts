/**
 * hooks/useVirtualPagination.ts
 * 
 * Hook para paginação virtual de listas grandes
 * Renderiza apenas itens visíveis para melhor performance
 */

import { useState, useEffect, useMemo, useCallback } from 'react';

interface UseVirtualPaginationProps<T> {
  items: T[];
  itemsPerPage?: number;
  initialPage?: number;
}

interface UseVirtualPaginationResult<T> {
  currentItems: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function useVirtualPagination<T>({
  items,
  itemsPerPage = 50,
  initialPage = 1
}: UseVirtualPaginationProps<T>): UseVirtualPaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = useMemo(() => {
    return Math.ceil(items.length / itemsPerPage);
  }, [items.length, itemsPerPage]);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Resetar para página 1 quando os itens mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [items]);

  return {
    currentItems,
    currentPage,
    totalPages,
    totalItems: items.length,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage
  };
}

