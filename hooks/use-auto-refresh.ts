import { useEffect, useRef, useCallback } from 'react';

interface UseAutoRefreshOptions {
  /**
   * The function to call for refreshing data
   */
  refreshFunction: () => void | Promise<void>;
  
  /**
   * Refresh interval in seconds (default: 30)
   * Can be overridden by NEXT_PUBLIC_AUTO_REFRESH_INTERVAL environment variable
   */
  intervalSeconds?: number;
  
  /**
   * Whether auto-refresh is enabled (default: true)
   * Can be overridden by NEXT_PUBLIC_AUTO_REFRESH_ENABLED environment variable
   */
  enabled?: boolean;
  
  /**
   * Whether to refresh immediately on mount (default: false)
   */
  refreshOnMount?: boolean;
  
  /**
   * Whether to pause auto-refresh when page is not visible (default: true)
   */
  pauseWhenHidden?: boolean;
  
  /**
   * Custom condition to check if refresh should continue
   * Return false to stop auto-refresh
   */
  shouldRefresh?: () => boolean;
}

interface UseAutoRefreshReturn {
  /**
   * Manually trigger a refresh
   */
  refresh: () => void;
  
  /**
   * Start auto-refresh
   */
  start: () => void;
  
  /**
   * Stop auto-refresh
   */
  stop: () => void;
  
  /**
   * Whether auto-refresh is currently active
   */
  isActive: boolean;
  
  /**
   * Whether a refresh is currently in progress
   */
  isRefreshing: boolean;
  
  /**
   * Last refresh timestamp
   */
  lastRefresh: Date | null;
  
  /**
   * Next refresh timestamp
   */
  nextRefresh: Date | null;
}

/**
 * Custom hook for auto-refresh functionality with configurable intervals
 * 
 * @example
 * ```tsx
 * const { refresh, isActive, isRefreshing } = useAutoRefresh({
 *   refreshFunction: fetchOrders,
 *   intervalSeconds: 30,
 *   enabled: true,
 *   refreshOnMount: false,
 *   pauseWhenHidden: true
 * });
 * ```
 */
export function useAutoRefresh({
  refreshFunction,
  intervalSeconds = 30,
  enabled = true,
  refreshOnMount = false,
  pauseWhenHidden = true,
  shouldRefresh
}: UseAutoRefreshOptions): UseAutoRefreshReturn {
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);
  const lastRefreshRef = useRef<Date | null>(null);
  const nextRefreshRef = useRef<Date | null>(null);
  const isActiveRef = useRef(false);
  
  // Get configuration from environment variables
  const envInterval = process.env.NEXT_PUBLIC_AUTO_REFRESH_INTERVAL 
    ? parseInt(process.env.NEXT_PUBLIC_AUTO_REFRESH_INTERVAL) 
    : intervalSeconds;
  
  const envEnabled = process.env.NEXT_PUBLIC_AUTO_REFRESH_ENABLED !== 'false' && enabled;
  
  const refreshInterval = envInterval * 1000; // Convert to milliseconds
  
  const refresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    
    try {
      isRefreshingRef.current = true;
      await refreshFunction();
      lastRefreshRef.current = new Date();
      nextRefreshRef.current = new Date(Date.now() + refreshInterval);
    } catch (error) {
      console.error('Auto-refresh error:', error);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [refreshFunction, refreshInterval]);
  
  const start = useCallback(() => {
    if (!envEnabled || isActiveRef.current) return;
    
    // Check if we should refresh
    if (shouldRefresh && !shouldRefresh()) return;
    
    isActiveRef.current = true;
    
    // Set up the interval
    intervalRef.current = setInterval(() => {
      // Check if page is hidden and we should pause
      if (pauseWhenHidden && document.hidden) return;
      
      // Check if we should continue refreshing
      if (shouldRefresh && !shouldRefresh()) {
        stop();
        return;
      }
      
      refresh();
    }, refreshInterval);
    
    // Set initial next refresh time
    nextRefreshRef.current = new Date(Date.now() + refreshInterval);
  }, [envEnabled, refreshInterval, pauseWhenHidden, shouldRefresh, refresh]);
  
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isActiveRef.current = false;
    nextRefreshRef.current = null;
  }, []);
  
  // Handle page visibility changes
  useEffect(() => {
    if (!pauseWhenHidden) return;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, pause refresh
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else if (isActiveRef.current) {
        // Page is visible again, resume refresh
        start();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pauseWhenHidden, start]);
  
  // Initial setup
  useEffect(() => {
    if (envEnabled) {
      if (refreshOnMount) {
        refresh();
      }
      start();
    }
    
    return () => {
      stop();
    };
  }, [envEnabled, refreshOnMount, refresh, start, stop]);
  
  return {
    refresh,
    start,
    stop,
    isActive: isActiveRef.current,
    isRefreshing: isRefreshingRef.current,
    lastRefresh: lastRefreshRef.current,
    nextRefresh: nextRefreshRef.current
  };
}

/**
 * Hook for order-specific auto-refresh with smart refresh logic
 * Automatically stops refreshing when order is delivered or cancelled
 */
export function useOrderAutoRefresh(
  refreshFunction: () => void | Promise<void>,
  orderStatus?: string,
  fulfillmentStatus?: string,
  options?: Omit<UseAutoRefreshOptions, 'shouldRefresh'>
) {
  
  const shouldRefresh = useCallback(() => {
    // Stop refreshing if order is delivered or cancelled
    const isDelivered = fulfillmentStatus?.toLowerCase() === 'fulfilled' || 
                       fulfillmentStatus?.toLowerCase() === 'delivered';
    const isCancelled = fulfillmentStatus?.toLowerCase() === 'cancelled' ||
                       fulfillmentStatus?.toLowerCase() === 'restocked';
    
    return !isDelivered && !isCancelled;
  }, [fulfillmentStatus]);
  
  return useAutoRefresh({
    refreshFunction,
    shouldRefresh,
    intervalSeconds: 30, // Default 30 seconds for orders
    ...options
  });
}

/**
 * Hook for cart auto-refresh with shorter intervals
 */
export function useCartAutoRefresh(
  refreshFunction: () => void | Promise<void>,
  options?: Omit<UseAutoRefreshOptions, 'intervalSeconds'>
) {
  return useAutoRefresh({
    refreshFunction,
    intervalSeconds: 10, // Shorter interval for cart updates
    ...options
  });
}

/**
 * Hook for general data auto-refresh with longer intervals
 */
export function useDataAutoRefresh(
  refreshFunction: () => void | Promise<void>,
  options?: Omit<UseAutoRefreshOptions, 'intervalSeconds'>
) {
  return useAutoRefresh({
    refreshFunction,
    intervalSeconds: 60, // Longer interval for general data
    ...options
  });
}
