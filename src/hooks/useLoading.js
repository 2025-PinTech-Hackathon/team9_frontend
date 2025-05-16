import { useState, useCallback } from 'react';

export const useLoading = () => {
    const [isLoading, setIsLoading] = useState(false);

    const withLoading = useCallback(async (promise) => {
        setIsLoading(true);
        try {
            const result = await promise;
            return result;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { isLoading, withLoading };
}; 