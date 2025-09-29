'use client';

import { useEffect, useRef, useCallback } from 'react';

interface AutoRefreshOptions {
  enabled?: boolean;
  interval?: number;
  onRefresh?: () => void | Promise<void>;
  onError?: (error: Error) => void;
  dependencies?: any[];
}

interface AutoRefreshReturn {
  isRefreshing: boolean;
  lastRefresh: Date | null;
  refreshNow: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  isPaused: boolean;
}

export const useAutoRefresh = (options: AutoRefreshOptions = {}): AutoRefreshReturn => {
  const {
    enabled = process.env.NEXT_PUBLIC_AUTO_REFRESH_ENABLED === 'true',
    interval = parseInt(process.env.NEXT_PUBLIC_AUTO_REFRESH_INTERVAL || '30') * 1000,
    onRefresh,
    onError,
    dependencies = []
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);
  const lastRefreshRef = useRef<Date | null>(null);
  const isPausedRef = useRef(false);
  const dependenciesRef = useRef(dependencies);

  const refreshNow = useCallback(async () => {
    if (isRefreshingRef.current || !onRefresh) return;

    try {
      isRefreshingRef.current = true;
      lastRefreshRef.current = new Date();
      
      console.log('🔄 Auto-refreshing data...', {
        timestamp: lastRefreshRef.current.toISOString(),
        interval: interval / 1000 + 's'
      });

      await onRefresh();
      
      console.log('✅ Auto-refresh completed successfully');
    } catch (error) {
      console.error('❌ Auto-refresh failed:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      isRefreshingRef.current = false;
    }
  }, [onRefresh, onError, interval]);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    console.log('⏸️ Auto-refresh paused');
  }, []);

  const resume = useCallback(() => {
    isPausedRef.current = false;
    if (enabled && onRefresh && !intervalRef.current) {
      intervalRef.current = setInterval(refreshNow, interval);
      console.log('▶️ Auto-refresh resumed');
    }
  }, [enabled, onRefresh, interval, refreshNow]);

  // Set up the auto-refresh interval
  useEffect(() => {
    if (!enabled || !onRefresh || isPausedRef.current) {
      return;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(refreshNow, interval);
    
    console.log('🚀 Auto-refresh started', {
      interval: interval / 1000 + 's',
      enabled: true
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, refreshNow, onRefresh]);

  // Handle dependency changes
  useEffect(() => {
    const depsChanged = JSON.stringify(dependenciesRef.current) !== JSON.stringify(dependencies);
    if (depsChanged) {
      dependenciesRef.current = dependencies;
      // Trigger a refresh when dependencies change
      if (enabled && onRefresh) {
        refreshNow();
      }
    }
  }, [dependencies, enabled, onRefresh, refreshNow]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isRefreshing: isRefreshingRef.current,
    lastRefresh: lastRefreshRef.current,
    refreshNow,
    pause,
    resume,
    isPaused: isPausedRef.current,
  };
};

// Utility hook for product data auto-refresh
export const useProductAutoRefresh = (productId?: string) => {
  const refreshProducts = useCallback(async () => {
    try {
      // Clear any cached product data
      if (typeof window !== 'undefined') {
        // Clear localStorage cache
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('product') || key.includes('shopify')) {
            localStorage.removeItem(key);
          }
        });

        // Trigger a page refresh for product pages
        if (productId && window.location.pathname.includes('/product/')) {
          window.location.reload();
        }
      }

      // Dispatch custom event for components to refresh
      window.dispatchEvent(new CustomEvent('productDataRefresh', {
        detail: { productId, timestamp: Date.now() }
      }));

    } catch (error) {
      console.error('Error refreshing product data:', error);
    }
  }, [productId]);

  return useAutoRefresh({
    enabled: true,
    interval: parseInt(process.env.NEXT_PUBLIC_AUTO_REFRESH_INTERVAL || '30') * 1000,
    onRefresh: refreshProducts,
    onError: (error) => {
      console.error('Product auto-refresh error:', error);
    }
  });
};

// Utility hook for general store data auto-refresh
export const useStoreAutoRefresh = () => {
  const refreshStoreData = useCallback(async () => {
    try {
      // Clear cached store data
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('store') || key.includes('shopify') || key.includes('cart')) {
            localStorage.removeItem(key);
          }
        });
      }

      // Dispatch custom event for components to refresh
      window.dispatchEvent(new CustomEvent('storeDataRefresh', {
        detail: { timestamp: Date.now() }
      }));

    } catch (error) {
      console.error('Error refreshing store data:', error);
    }
  }, []);

  return useAutoRefresh({
    enabled: true,
    interval: parseInt(process.env.NEXT_PUBLIC_AUTO_REFRESH_INTERVAL || '30') * 1000,
    onRefresh: refreshStoreData,
    onError: (error) => {
      console.error('Store auto-refresh error:', error);
    }
  });
};
