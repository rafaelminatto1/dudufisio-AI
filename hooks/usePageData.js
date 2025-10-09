// hooks/usePageData.ts
import { useState, useEffect, useCallback } from 'react';
export const usePageData = (fetchers, dependencies = []) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            await Promise.all(fetchers.map(fetcher => fetcher()));
            setError(null);
        }
        catch (err) {
            setError(err);
            console.error("Failed to fetch page data:", err);
        }
        finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencies]); // Dependencies array to control refetching
    useEffect(() => {
        loadData();
    }, [loadData]);
    return { isLoading, error, refetch: loadData };
};
