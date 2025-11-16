import { useState, useMemo, useCallback, useRef } from 'react'

interface VirtualizedItem<T> {
  item: T
  index: number
  key: string | number
  style: { position: 'absolute'; top: number; left: 0; right: 0; height: number }
}

export function useVirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
  keyExtractor = (_: T, index: number) => index,
}: {
  items: T[]
  itemHeight: number
  containerHeight: number
  overscan?: number
  keyExtractor?: (item: T, index: number) => string | number
}) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const totalHeight = items.length * itemHeight

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(items.length - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan)
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  const visibleItems = useMemo(() => {
    const result: VirtualizedItem<T>[] = []
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      const it = items[i]
      if (it) {
        result.push({
          item: it,
          index: i,
          key: keyExtractor(it, i),
          style: { position: 'absolute', top: i * itemHeight, left: 0, right: 0, height: itemHeight },
        })
      }
    }
    return result
  }, [items, visibleRange, itemHeight, keyExtractor])

  const scrollToIndex = useCallback((index: number) => {
    const targetScrollTop = index * itemHeight
    if (containerRef.current) {
      containerRef.current.scrollTop = targetScrollTop
      setScrollTop(targetScrollTop)
    }
  }, [itemHeight])

  const scrollToTop = useCallback(() => {
    scrollToIndex(0)
  }, [scrollToIndex])

  const scrollToBottom = useCallback(() => {
    scrollToIndex(items.length - 1)
  }, [scrollToIndex, items.length])

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((event.currentTarget as HTMLDivElement).scrollTop)
  }, [])

  return { visibleItems, totalHeight, scrollToIndex, scrollToTop, scrollToBottom, containerRef, handleScroll }
}

export function useVirtualPagination({
  totalItems,
  itemsPerPage,
  initialPage = 1,
}: {
  totalItems: number
  itemsPerPage: number
  initialPage?: number
}) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }, [totalPages])

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }, [currentPage, totalPages])

  const prevPage = useCallback(() => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }, [currentPage])

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    canGoNext: currentPage < totalPages,
    canGoPrev: currentPage > 1,
  }
}

export function useDebouncedSearch<T>(items: T[], searchFn: (items: T[], query: string) => T[], options: { delay?: number; minLength?: number } = {}) {
  const { delay = 300, minLength = 2 } = options
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (query.length >= minLength) {
      setIsSearching(true)
      timeoutRef.current = window.setTimeout(() => {
        setDebouncedQuery(query)
        setIsSearching(false)
      }, delay)
    } else {
      setDebouncedQuery('')
      setIsSearching(false)
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [query, delay, minLength])

  const filteredItems = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < minLength) return items
    return searchFn(items, debouncedQuery)
  }, [items, debouncedQuery, searchFn, minLength])

  return { query, setQuery, filteredItems, isSearching, hasQuery: debouncedQuery.length >= minLength }
}

export function useInfiniteScroll({ hasMore, isLoading, threshold = 100 }: { hasMore: boolean; isLoading: boolean; threshold?: number }) {
  const [shouldLoadMore, setShouldLoadMore] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !isLoading) setShouldLoadMore(true)
    }, { rootMargin: `${threshold}px` })
    if (loadingRef.current) observerRef.current.observe(loadingRef.current)
    return () => { observerRef.current?.disconnect() }
  }, [hasMore, isLoading, threshold])

  React.useEffect(() => { if (shouldLoadMore) setShouldLoadMore(false) }, [shouldLoadMore])

  return { loadingRef, shouldLoadMore }
}

