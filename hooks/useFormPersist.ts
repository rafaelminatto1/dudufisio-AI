import { useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';

export interface UseFormPersistConfig {
  key: string;
  storage?: Storage;
  exclude?: string[];
  debounceDelay?: number;
  enabled?: boolean;
}

export function useFormPersist<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  config: UseFormPersistConfig
) {
  const {
    key,
    storage = localStorage,
    exclude = [],
    debounceDelay = 500,
    enabled = true,
  } = config;

  const storageKey = `form_persist_${key}`;

  // Load persisted data
  useEffect(() => {
    if (!enabled) return;

    try {
      const stored = storage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        
        // Filter out excluded fields
        const filteredData = Object.keys(data).reduce((acc, key) => {
          if (!exclude.includes(key)) {
            acc[key] = data[key];
          }
          return acc;
        }, {} as Partial<T>);

        // Reset form with persisted data
        form.reset(filteredData as T, {
          keepDirty: false,
          keepTouched: false,
        });
      }
    } catch (error) {
      console.error('Error loading persisted form data:', error);
    }
  }, [key, enabled]); // Only run on mount

  // Save form data
  const saveData = useCallback(
    (data: T) => {
      if (!enabled) return;

      try {
        // Filter out excluded fields
        const filteredData = Object.keys(data).reduce((acc, key) => {
          if (!exclude.includes(key)) {
            acc[key] = data[key];
          }
          return acc;
        }, {} as Partial<T>);

        storage.setItem(storageKey, JSON.stringify(filteredData));
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    },
    [storageKey, storage, exclude, enabled]
  );

  // Watch form changes and save with debounce
  useEffect(() => {
    if (!enabled) return;

    const subscription = form.watch((data) => {
      const timeoutId = setTimeout(() => {
        saveData(data as T);
      }, debounceDelay);

      return () => clearTimeout(timeoutId);
    });

    return () => subscription.unsubscribe();
  }, [form, saveData, debounceDelay, enabled]);

  // Clear persisted data
  const clearPersistedData = useCallback(() => {
    try {
      storage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing persisted data:', error);
    }
  }, [storageKey, storage]);

  // Check if there's persisted data
  const hasPersistedData = useCallback((): boolean => {
    try {
      return storage.getItem(storageKey) !== null;
    } catch {
      return false;
    }
  }, [storageKey, storage]);

  return {
    clearPersistedData,
    hasPersistedData,
  };
}

