# Auto-Refresh Functionality Documentation

## Overview

This app now includes a comprehensive auto-refresh system that automatically updates data at configurable intervals. The system is designed to be intelligent, efficient, and user-friendly.

## Features

### ✅ **Smart Auto-Refresh**
- **Configurable intervals** via environment variables
- **Automatic pause** when page is not visible (saves resources)
- **Smart stopping** for completed orders (delivered/cancelled)
- **Manual controls** for users to pause/resume/refresh

### ✅ **Multiple Hook Types**
- `useAutoRefresh` - General purpose auto-refresh
- `useOrderAutoRefresh` - Order-specific with smart logic
- `useCartAutoRefresh` - Cart updates with shorter intervals
- `useDataAutoRefresh` - General data with longer intervals

### ✅ **Environment Configuration**
- `NEXT_PUBLIC_AUTO_REFRESH_ENABLED` - Enable/disable globally
- `NEXT_PUBLIC_AUTO_REFRESH_INTERVAL` - Refresh interval in seconds

## Implementation

### 1. Custom Hook (`hooks/use-auto-refresh.ts`)

```typescript
import { useAutoRefresh } from '@/hooks/use-auto-refresh';

const { refresh, start, stop, isActive, isRefreshing, lastRefresh, nextRefresh } = useAutoRefresh({
  refreshFunction: fetchData,
  intervalSeconds: 30,
  enabled: true,
  refreshOnMount: false,
  pauseWhenHidden: true,
  shouldRefresh: () => true
});
```

### 2. Order-Specific Hook

```typescript
import { useOrderAutoRefresh } from '@/hooks/use-auto-refresh';

const { refresh, start, stop, isActive } = useOrderAutoRefresh(
  fetchOrderDetails,
  orderStatus,
  fulfillmentStatus,
  { enabled: !!orderDetails }
);
```

### 3. Environment Variables

```env
# Auto-refresh Configuration
NEXT_PUBLIC_AUTO_REFRESH_ENABLED=true
NEXT_PUBLIC_AUTO_REFRESH_INTERVAL=30
```

## Pages with Auto-Refresh

### 1. **Order Tracking Page** (`/orders/track`)
- **Interval**: 30 seconds
- **Smart Logic**: Stops when order is delivered/cancelled
- **Features**: Manual refresh, pause/resume controls
- **UI**: Status indicator with last/next refresh times

### 2. **Order Details Page** (`/orders/[orderId]`)
- **Interval**: 30 seconds
- **Smart Logic**: Stops when order is delivered/cancelled
- **Features**: Manual refresh, pause/resume controls
- **UI**: Status indicator with last/next refresh times

### 3. **Orders List Page** (`/account/orders`)
- **Interval**: 60 seconds (longer for general data)
- **Features**: Manual refresh, pause/resume controls
- **UI**: Status indicator (only shown when orders exist)

## Hook Options

### `useAutoRefresh` Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `refreshFunction` | `() => void \| Promise<void>` | Required | Function to call for refreshing |
| `intervalSeconds` | `number` | `30` | Refresh interval in seconds |
| `enabled` | `boolean` | `true` | Whether auto-refresh is enabled |
| `refreshOnMount` | `boolean` | `false` | Refresh immediately on mount |
| `pauseWhenHidden` | `boolean` | `true` | Pause when page is not visible |
| `shouldRefresh` | `() => boolean` | `undefined` | Custom condition to continue refreshing |

### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `refresh` | `() => void` | Manually trigger refresh |
| `start` | `() => void` | Start auto-refresh |
| `stop` | `() => void` | Stop auto-refresh |
| `isActive` | `boolean` | Whether auto-refresh is active |
| `isRefreshing` | `boolean` | Whether a refresh is in progress |
| `lastRefresh` | `Date \| null` | Last refresh timestamp |
| `nextRefresh` | `Date \| null` | Next refresh timestamp |

## Specialized Hooks

### `useOrderAutoRefresh`
- **Purpose**: Order-specific auto-refresh
- **Smart Logic**: Automatically stops when order is delivered or cancelled
- **Default Interval**: 30 seconds

### `useCartAutoRefresh`
- **Purpose**: Cart updates
- **Default Interval**: 10 seconds (shorter for real-time feel)

### `useDataAutoRefresh`
- **Purpose**: General data updates
- **Default Interval**: 60 seconds (longer to reduce server load)

## UI Components

### Auto-Refresh Control Panel

Each page with auto-refresh includes a control panel with:

```tsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
  <div className="flex items-center justify-between">
    {/* Status Indicator */}
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        {isActive ? (
          <div className="flex items-center text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm font-medium">Auto-refresh active</span>
          </div>
        ) : (
          <div className="flex items-center text-gray-500">
            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
            <span className="text-sm font-medium">Auto-refresh paused</span>
          </div>
        )}
      </div>
      
      {/* Timestamps */}
      {lastRefresh && (
        <span className="text-xs text-gray-500">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </span>
      )}
      
      {nextRefresh && isActive && (
        <span className="text-xs text-gray-500">
          Next update: {nextRefresh.toLocaleTimeString()}
        </span>
      )}
    </div>
    
    {/* Control Buttons */}
    <div className="flex items-center space-x-2">
      <Button onClick={refresh} disabled={isRefreshing}>
        <RefreshCw className="h-3 w-3 mr-1" />
        Refresh Now
      </Button>
      
      <Button onClick={isActive ? stop : start}>
        {isActive ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
        {isActive ? 'Pause' : 'Resume'}
      </Button>
    </div>
  </div>
</div>
```

## Configuration Examples

### Development Environment
```env
NEXT_PUBLIC_AUTO_REFRESH_ENABLED=true
NEXT_PUBLIC_AUTO_REFRESH_INTERVAL=10  # Faster for testing
```

### Production Environment
```env
NEXT_PUBLIC_AUTO_REFRESH_ENABLED=true
NEXT_PUBLIC_AUTO_REFRESH_INTERVAL=30  # Standard interval
```

### Disabled Environment
```env
NEXT_PUBLIC_AUTO_REFRESH_ENABLED=false
```

## Best Practices

### 1. **Use Appropriate Intervals**
- **Orders**: 30 seconds (balance between real-time and server load)
- **Cart**: 10 seconds (real-time feel)
- **General Data**: 60 seconds (reduce server load)

### 2. **Implement Silent Refreshes**
```typescript
const fetchData = async (silent = false) => {
  // ... fetch logic
  
  if (!silent) {
    toast.success('Data updated');
  }
};
```

### 3. **Handle Errors Gracefully**
```typescript
const { refresh } = useAutoRefresh({
  refreshFunction: async () => {
    try {
      await fetchData();
    } catch (error) {
      console.error('Auto-refresh error:', error);
      // Don't show toast for auto-refresh errors
    }
  }
});
```

### 4. **Use Smart Conditions**
```typescript
const { refresh } = useOrderAutoRefresh(
  fetchOrderDetails,
  orderStatus,
  fulfillmentStatus,
  {
    shouldRefresh: () => {
      // Only refresh if order is still processing
      return !['delivered', 'cancelled'].includes(fulfillmentStatus);
    }
  }
);
```

## Performance Considerations

### 1. **Page Visibility API**
- Auto-refresh pauses when page is not visible
- Resumes when user returns to the page
- Saves bandwidth and server resources

### 2. **Smart Stopping**
- Order auto-refresh stops when order is completed
- Prevents unnecessary API calls
- Improves user experience

### 3. **Configurable Intervals**
- Different intervals for different data types
- Environment-based configuration
- Easy to adjust based on needs

## Troubleshooting

### Auto-refresh not working?
1. Check environment variables are set correctly
2. Verify `NEXT_PUBLIC_AUTO_REFRESH_ENABLED=true`
3. Check browser console for errors
4. Ensure refresh function is working manually

### Too many API calls?
1. Increase `NEXT_PUBLIC_AUTO_REFRESH_INTERVAL`
2. Check if smart stopping conditions are working
3. Verify page visibility detection is working

### Auto-refresh not stopping?
1. Check `shouldRefresh` condition
2. Verify order status values
3. Check if fulfillment status is being updated correctly

## Future Enhancements

### Potential Improvements
1. **WebSocket Integration**: Real-time updates instead of polling
2. **Push Notifications**: Notify users of status changes
3. **Custom Intervals**: User-configurable refresh rates
4. **Analytics**: Track refresh patterns and optimize intervals
5. **Offline Support**: Queue updates when offline

### Additional Hook Types
1. `useNotificationAutoRefresh` - For notification updates
2. `useInventoryAutoRefresh` - For stock level updates
3. `usePriceAutoRefresh` - For price changes

## Conclusion

The auto-refresh system provides a seamless, intelligent way to keep data up-to-date while being respectful of server resources and user preferences. The configurable nature makes it suitable for different environments and use cases.
