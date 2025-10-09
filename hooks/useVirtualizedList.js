import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
export const useVirtualizedList = ({ items, itemHeight, containerHeight, overscan = 5, keyExtractor = (_, index) => index }) => {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef(null);
    const totalHeight = items.length * itemHeight;
    const visibleRange = useMemo(() => {
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
        const endIndex = Math.min(items.length - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);
        return { startIndex, endIndex };
    }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);
    const visibleItems = useMemo(() => {
        const result = [];
        for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
            if (items[i]) {
                result.push({
                    item: items[i],
                    index: i,
                    key: keyExtractor(items[i], i),
                    style: {
                        position: 'absolute',
                        top: i * itemHeight,
                        left: 0,
                        right: 0,
                        height: itemHeight
                    }
                });
            }
        }
        return result;
    }, [items, visibleRange, itemHeight, keyExtractor]);
    const scrollToIndex = useCallback((index) => {
        const targetScrollTop = index * itemHeight;
        if (containerRef.current) {
            containerRef.current.scrollTop = targetScrollTop;
            setScrollTop(targetScrollTop);
        }
    }, [itemHeight]);
    const scrollToTop = useCallback(() => {
        scrollToIndex(0);
    }, [scrollToIndex]);
    const scrollToBottom = useCallback(() => {
        scrollToIndex(items.length - 1);
    }, [scrollToIndex, items.length]);
    const handleScroll = useCallback((event) => {
        setScrollTop(event.currentTarget.scrollTop);
    }, []);
    return {
        visibleItems,
        totalHeight,
        scrollToIndex,
        scrollToTop,
        scrollToBottom
    };
};
export const useVirtualPagination = ({ totalItems, itemsPerPage, initialPage = 1 }) => {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const goToPage = useCallback((page) => {
        const validPage = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(validPage);
    }, [totalPages]);
    const nextPage = useCallback(() => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    }, [currentPage, totalPages]);
    const prevPage = useCallback(() => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }, [currentPage]);
    return {
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        goToPage,
        nextPage,
        prevPage,
        canGoNext: currentPage < totalPages,
        canGoPrev: currentPage > 1
    };
};
export const useDebouncedSearch = (items, searchFn, options = {}) => {
    const { delay = 300, minLength = 2 } = options;
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const timeoutRef = useRef(undefined);
    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (query.length >= minLength) {
            setIsSearching(true);
            timeoutRef.current = setTimeout(() => {
                setDebouncedQuery(query);
                setIsSearching(false);
            }, delay);
        }
        else {
            setDebouncedQuery('');
            setIsSearching(false);
        }
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [query, delay, minLength]);
    const filteredItems = useMemo(() => {
        if (!debouncedQuery || debouncedQuery.length < minLength) {
            return items;
        }
        return searchFn(items, debouncedQuery);
    }, [items, debouncedQuery, searchFn, minLength]);
    return {
        query,
        setQuery,
        filteredItems,
        isSearching,
        hasQuery: debouncedQuery.length >= minLength
    };
};
export const useInfiniteScroll = ({ hasMore, isLoading, threshold = 100 }) => {
    const [shouldLoadMore, setShouldLoadMore] = useState(false);
    const observerRef = useRef(undefined);
    const loadingRef = useRef(null);
    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }
        observerRef.current = new IntersectionObserver((entries) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !isLoading) {
                setShouldLoadMore(true);
            }
        }, {
            rootMargin: `${threshold}px`
        });
        if (loadingRef.current) {
            observerRef.current.observe(loadingRef.current);
        }
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [hasMore, isLoading, threshold]);
    useEffect(() => {
        if (shouldLoadMore) {
            setShouldLoadMore(false);
        }
    }, [shouldLoadMore]);
    return {
        loadingRef,
        shouldLoadMore
    };
};
