// hooks/usePageData.ts
import { useState, useEffect, useCallback } from 'react';

type Fetcher = (signal?: AbortSignal) => Promise<any>;

export const usePageData = (fetchers: Fetcher[], dependencies: any[] = []) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadData = useCallback(async (signal?: AbortSignal) => {
        if (signal?.aborted) return;
        
        setIsLoading(true);
        try {
            await Promise.all(fetchers.map(fetcher => fetcher(signal)));
            if (!signal?.aborted) {
                setError(null);
            }
        } catch (err: any) {
            if (!signal?.aborted) {
                setError(err);
                console.error("Failed to fetch page data:", err);
            }
        } finally {
            if (!signal?.aborted) {
                setIsLoading(false);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencies]); // Dependencies array to control refetching

    useEffect(() => {
        const abortController = new AbortController();
        loadData(abortController.signal);
        
        return () => {
            abortController.abort();
        };
    }, [loadData]);
    
    return { isLoading, error, refetch: loadData };
};
