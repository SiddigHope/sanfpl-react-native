import { useState, useCallback } from 'react';

type RefreshFunction = () => Promise<void>;

export const useRefresh = (onRefresh: RefreshFunction) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  return {
    isRefreshing,
    handleRefresh,
  };
};