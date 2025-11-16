import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';

export interface FilterConfig<T = any> {
  key: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'boolean';
  label: string;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: any;
  filterFn?: (item: T, value: any) => boolean;
}

export interface UseTableFiltersConfig<T = any> {
  filters: FilterConfig<T>[];
  debounceDelay?: number;
}

export function useTableFilters<T = any>({
  filters: filterConfigs,
  debounceDelay = 300,
}: UseTableFiltersConfig<T>) {
  const [filters, setFilters] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    filterConfigs.forEach((filter) => {
      if (filter.defaultValue !== undefined) {
        initial[filter.key] = filter.defaultValue;
      }
    });
    return initial;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, debounceDelay);

  const setFilter = useCallback((key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
  }, []);

  const activeFiltersCount = useMemo(() => {
    return Object.keys(filters).filter((key) => {
      const value = filters[key];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      return value !== undefined && value !== null && value !== '';
    }).length;
  }, [filters]);

  const hasActiveFilters = activeFiltersCount > 0 || debouncedSearch.length > 0;

  const applyFilters = useCallback(
    (data: T[]): T[] => {
      let filtered = data;

      // Apply search
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        filtered = filtered.filter((item: any) => {
          return Object.values(item).some((value) =>
            String(value).toLowerCase().includes(searchLower)
          );
        });
      }

      // Apply filters
      filterConfigs.forEach((config) => {
        const value = filters[config.key];
        if (value === undefined || value === null || value === '') return;

        if (config.filterFn) {
          filtered = filtered.filter((item) => config.filterFn!(item, value));
          return;
        }

        // Default filter logic by type
        filtered = filtered.filter((item: any) => {
          const itemValue = item[config.key];

          switch (config.type) {
            case 'text':
              return String(itemValue)
                .toLowerCase()
                .includes(String(value).toLowerCase());

            case 'select':
              return itemValue === value;

            case 'multiselect':
              if (!Array.isArray(value) || value.length === 0) return true;
              return value.includes(itemValue);

            case 'boolean':
              return itemValue === value;

            case 'number':
              return Number(itemValue) === Number(value);

            case 'date':
              return new Date(itemValue).toDateString() === new Date(value).toDateString();

            case 'daterange':
              if (!value.from) return true;
              const itemDate = new Date(itemValue);
              const fromDate = new Date(value.from);
              const toDate = value.to ? new Date(value.to) : new Date();
              return itemDate >= fromDate && itemDate <= toDate;

            default:
              return true;
          }
        });
      });

      return filtered;
    },
    [filters, debouncedSearch, filterConfigs]
  );

  return {
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
    activeFiltersCount,
    hasActiveFilters,
    applyFilters,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
  };
}

