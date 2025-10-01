import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// Hook básico para lista virtualizada
export const useVirtualizedList = (options: {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  keyExtractor?: (item: any, index: number) => string | number;
}) => {
  const { items, itemHeight, containerHeight, overscan = 5, keyExtractor = (_, index) => index } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleEndIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(visibleStartIndex, visibleEndIndex + 1).map((item, index) => ({
    item,
    index: visibleStartIndex + index,
    key: keyExtractor(item, visibleStartIndex + index),
    style: {
      position: 'absolute' as const,
      top: (visibleStartIndex + index) * itemHeight,
      height: itemHeight,
      width: '100%'
    }
  }));

  const totalHeight = items.length * itemHeight;

  const scrollToIndex = useCallback((index: number) => {
    const element = document.querySelector('[data-virtualized-container]') as HTMLElement;
    if (element) {
      element.scrollTop = index * itemHeight;
    }
  }, [itemHeight]);

  const scrollToTop = useCallback(() => {
    const element = document.querySelector('[data-virtualized-container]') as HTMLElement;
    if (element) {
      element.scrollTop = 0;
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    const element = document.querySelector('[data-virtualized-container]') as HTMLElement;
    if (element) {
      element.scrollTop = totalHeight;
    }
  }, [totalHeight]);

  return {
    visibleItems,
    totalHeight,
    scrollToIndex,
    scrollToTop,
    scrollToBottom
  };
};

// Hook para infinite scroll
export const useInfiniteScroll = (options: {
  hasMore: boolean;
  isLoading: boolean;
}) => {
  const { hasMore, isLoading } = options;
  const loadingRef = useRef<HTMLDivElement>(null);
  const [shouldLoadMore, setShouldLoadMore] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setShouldLoadMore(true);
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  useEffect(() => {
    if (shouldLoadMore) {
      setShouldLoadMore(false);
    }
  }, [shouldLoadMore]);

  return { loadingRef, shouldLoadMore };
};

interface VirtualizedListProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number, style: React.CSSProperties) => React.ReactNode;
  keyExtractor?: (item: any, index: number) => string | number;
  overscan?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  className?: string;
}

// Componente de Lista Virtualizada
export const VirtualizedList = (props: VirtualizedListProps) => {
  const {
    items,
    itemHeight,
    containerHeight,
    renderItem,
    keyExtractor = (_, index) => index,
    overscan = 5,
    onLoadMore,
    hasMore = false,
    isLoading = false,
    loadingComponent,
    emptyComponent,
    className = ''
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  const {
    visibleItems,
    totalHeight,
    scrollToIndex,
    scrollToTop,
    scrollToBottom
  } = useVirtualizedList({
    items,
    itemHeight,
    containerHeight,
    overscan,
    keyExtractor
  });

  const { loadingRef, shouldLoadMore } = useInfiniteScroll({
    hasMore,
    isLoading
  });

  // Carregar mais itens quando necessário
  useEffect(() => {
    if (shouldLoadMore && onLoadMore) {
      onLoadMore();
    }
  }, [shouldLoadMore, onLoadMore]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    // Scroll handling é feito internamente pelo hook
  }, []);

  // Componente de loading padrão
  const defaultLoadingComponent = (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500"></div>
      <span className="ml-2 text-sm text-slate-600">Carregando mais itens...</span>
    </div>
  );

  // Componente de lista vazia padrão
  const defaultEmptyComponent = (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-slate-400 mb-4">📋</div>
      <p className="text-slate-600">Nenhum item encontrado</p>
    </div>
  );

  if (items.length === 0 && !isLoading) {
    return <div className={className}>{emptyComponent || defaultEmptyComponent}</div>;
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        data-virtualized-container
        className="overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleItems.map(({ item, index, key, style }) => (
            <div key={key} style={style}>
              {renderItem(item, index, style)}
            </div>
          ))}
        </div>
        
        {/* Loading indicator para infinite scroll */}
        {hasMore && (
          <div ref={loadingRef}>
            {isLoading ? (loadingComponent || defaultLoadingComponent) : null}
          </div>
        )}
      </div>
      
      {/* Controles de navegação */}
      <div className="flex justify-center space-x-2 mt-4">
        <button
          onClick={scrollToTop}
          className="px-3 py-1 text-xs bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors"
          disabled={items.length === 0}
        >
          ↑ Topo
        </button>
        <button
          onClick={scrollToBottom}
          className="px-3 py-1 text-xs bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors"
          disabled={items.length === 0}
        >
          ↓ Final
        </button>
      </div>
    </div>
  );
};

// Hook para Lista Otimizada com Filtros
export const useOptimizedList = (
  items: any[],
  options: {
    initialSort?: (a: any, b: any) => number;
    initialFilter?: (item: any) => boolean;
    debounceMs?: number;
  } = {}
) => {
  const { initialSort, initialFilter, debounceMs = 300 } = options;
  
  const [sortFn, setSortFn] = useState<(a: any, b: any) => number | null>(initialSort || null);
  const [filterFn, setFilterFn] = useState<(item: any) => boolean>(initialFilter || (() => true));
  const [searchQuery, setSearchQuery] = useState('');

  // Debounced search
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Aplicar filtro
    result = result.filter(filterFn);

    // Aplicar busca
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(item => 
        JSON.stringify(item).toLowerCase().includes(query)
      );
    }

    // Aplicar ordenação
    if (sortFn) {
      result.sort(sortFn);
    }

    return result;
  }, [items, filterFn, debouncedSearchQuery, sortFn]);

  return {
    items: filteredAndSortedItems,
    searchQuery,
    setSearchQuery,
    setSortFn,
    setFilterFn,
    filteredCount: filteredAndSortedItems.length,
    totalCount: items.length
  };
};