import { useState, useCallback, useMemo } from 'react';

export interface PaginationConfig {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

export function useTablePagination<T = any>(config: PaginationConfig = {}) {
  const {
    initialPage = 0,
    initialPageSize = 10,
    pageSizeOptions = [10, 20, 30, 50, 100],
  } = config;

  const [pageIndex, setPageIndex] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const paginateData = useCallback(
    (data: T[]): T[] => {
      const start = pageIndex * pageSize;
      const end = start + pageSize;
      return data.slice(start, end);
    },
    [pageIndex, pageSize]
  );

  const getPageCount = useCallback(
    (totalItems: number): number => {
      return Math.ceil(totalItems / pageSize);
    },
    [pageSize]
  );

  const goToPage = useCallback((page: number) => {
    setPageIndex(page);
  }, []);

  const nextPage = useCallback((totalItems: number) => {
    setPageIndex((prev) => {
      const maxPage = Math.ceil(totalItems / pageSize) - 1;
      return Math.min(prev + 1, maxPage);
    });
  }, [pageSize]);

  const previousPage = useCallback(() => {
    setPageIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const firstPage = useCallback(() => {
    setPageIndex(0);
  }, []);

  const lastPage = useCallback((totalItems: number) => {
    const maxPage = Math.ceil(totalItems / pageSize) - 1;
    setPageIndex(maxPage);
  }, [pageSize]);

  const changePageSize = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPageIndex(0); // Reset to first page when changing page size
  }, []);

  const canNextPage = useCallback(
    (totalItems: number): boolean => {
      return pageIndex < Math.ceil(totalItems / pageSize) - 1;
    },
    [pageIndex, pageSize]
  );

  const canPreviousPage = useCallback((): boolean => {
    return pageIndex > 0;
  }, [pageIndex]);

  const getPaginationInfo = useCallback(
    (totalItems: number) => {
      const start = pageIndex * pageSize + 1;
      const end = Math.min((pageIndex + 1) * pageSize, totalItems);
      const pageCount = getPageCount(totalItems);

      return {
        start,
        end,
        total: totalItems,
        currentPage: pageIndex + 1,
        totalPages: pageCount,
      };
    },
    [pageIndex, pageSize, getPageCount]
  );

  const getPaginationRange = useCallback(
    (totalItems: number, visiblePages: number = 5): number[] => {
      const pageCount = getPageCount(totalItems);
      const halfVisible = Math.floor(visiblePages / 2);
      
      let startPage = Math.max(0, pageIndex - halfVisible);
      let endPage = Math.min(pageCount - 1, startPage + visiblePages - 1);
      
      if (endPage - startPage < visiblePages - 1) {
        startPage = Math.max(0, endPage - visiblePages + 1);
      }
      
      const range: number[] = [];
      for (let i = startPage; i <= endPage; i++) {
        range.push(i);
      }
      
      return range;
    },
    [pageIndex, getPageCount]
  );

  return {
    // State
    pageIndex,
    pageSize,
    pageSizeOptions,

    // Actions
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    changePageSize,
    setPageIndex,
    setPageSize,

    // Utilities
    paginateData,
    getPageCount,
    canNextPage,
    canPreviousPage,
    getPaginationInfo,
    getPaginationRange,
  };
}

