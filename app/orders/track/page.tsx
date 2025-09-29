'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Truck, Calendar, Clock, CheckCircle, AlertCircle, Loader2, ArrowLeft, DollarSign, RefreshCw, Pause, Play } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useOrderAutoRefresh } from '@/hooks/use-auto-refresh';

interface TrackingDetails {
  order: {
    id: string;
    order_number: string;
    created_at: string;
    processed_at: string;
    financial_status: string;
    fulfillment_status: string;
    total_price: string;
    currency: string;
    customer: {
      email: string;
      name: string;
    };
    line_items: Array<{
      id: string;
      title: string;
      quantity: number;
      price: string;
      sku: string;
    }>;
    shipping_address: {
      first_name: string;
      last_name: string;
      address1: string;
      address2?: string;
      city: string;
      province: string;
      zip: string;
      country: string;
    };
    tracking?: {
      tracking_number: string;
      tracking_url: string;
      courier: string;
      status: string;
      estimated_delivery_date?: string;
      tracking_history: Array<{
        status: string;
        location: string;
        timestamp: string;
        description: string;
      }>;
    };
  };
}

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trackingDetails, setTrackingDetails] = useState<TrackingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-refresh functionality
  const { refresh, start, stop, isActive, isRefreshing, lastRefresh, nextRefresh } = useOrderAutoRefresh(
    async () => {
      if (orderNumber && email && trackingDetails) {
        await handleTrackOrder(new Event('submit') as any, true); // Silent refresh
      }
    },
    trackingDetails?.order?.financial_status,
    trackingDetails?.order?.fulfillment_status,
    {
      enabled: !!trackingDetails, // Only enable auto-refresh when we have tracking details
      refreshOnMount: false,
      pauseWhenHidden: true
    }
  );

  const handleTrackOrder = async (e: React.FormEvent, silent = false) => {
    e.preventDefault();
    
    if (!orderNumber || !email) {
      if (!silent) toast.error('Please enter both order number and email');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/orders/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_number: orderNumber,
          email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to track order');
      }

      const data = await response.json();
      setTrackingDetails(data);
      
      if (!silent) {
        toast.success('Order tracking updated');
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      setError(error instanceof Error ? error.message : 'Failed to track order');
      if (!silent) {
        toast.error('Failed to find your order. Please check your details and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return { text: 'Paid', color: 'text-green-600' };
      case 'pending':
        return { text: 'Payment Pending', color: 'text-orange-500' };
      case 'refunded':
        return { text: 'Refunded', color: 'text-red-600' };
      case 'partially_refunded':
        return { text: 'Partially Refunded', color: 'text-blue-600' };
      default:
        return { text: status, color: 'text-gray-600' };
    }
  };

  const getFulfillmentStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case 'fulfilled':
        return { text: 'Delivered', color: 'text-green-600', icon: CheckCircle };
      case 'partially_fulfilled':
        return { text: 'Partially Shipped', color: 'text-blue-600', icon: Truck };
      case 'unfulfilled':
        return { text: 'Processing', color: 'text-orange-500', icon: Package };
      case 'restocked':
        return { text: 'Cancelled', color: 'text-gray-600', icon: AlertCircle };
      default:
        return { text: status, color: 'text-gray-600', icon: Package };
    }
  };

  const getShipmentStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return { text: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'out_for_delivery':
        return { text: 'Out for Delivery', color: 'bg-blue-100 text-blue-800', icon: Truck };
      case 'in_transit':
        return { text: 'In Transit', color: 'bg-blue-100 text-blue-800', icon: Truck };
      case 'shipped':
        return { text: 'Shipped', color: 'bg-blue-100 text-blue-800', icon: Truck };
      case 'pending':
        return { text: 'Pending', color: 'bg-orange-100 text-orange-800', icon: Clock };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800', icon: Package };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Store
        </Link>
        
        <h1 className="text-2xl font-bold text-gray-900">Track Your Order</h1>
        <p className="text-gray-600">Enter your order details below to track your shipment</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <form onSubmit={handleTrackOrder} className="space-y-4">
          <div>
            <Label htmlFor="orderNumber">Order Number</Label>
            <Input
              id="orderNumber"
              placeholder="e.g. #1001"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email used for the order"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Tracking...
              </>
            ) : (
              'Track Order'
            )}
          </Button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="font-medium text-red-800">Order Not Found</h3>
          </div>
          <p className="mt-2 text-sm text-red-700">
            We couldn't find an order matching the details you provided. Please check your order number and email address and try again.
          </p>
        </div>
      )}

      {trackingDetails && (
        <div className="space-y-8">
          {/* Auto-refresh Controls */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
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
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refresh}
                  disabled={isRefreshing}
                  className="text-xs"
                >
                  {isRefreshing ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  Refresh Now
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isActive ? stop : start}
                  className="text-xs"
                >
                  {isActive ? (
                    <>
                      <Pause className="h-3 w-3 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 mr-1" />
                      Resume
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div>
                  <h2 className="font-semibold text-lg">Order #{trackingDetails.order.order_number}</h2>
                  <p className="text-sm text-gray-500">Placed on {formatDate(trackingDetails.order.created_at)}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/orders/${trackingDetails.order.id}`}>
                      View Order Details
                    </Link>
                  </Button>
                  {trackingDetails.order.tracking?.tracking_url && (
                    <a 
                      href={trackingDetails.order.tracking.tracking_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100"
                    >
                      <Truck className="h-4 w-4 mr-1" />
                      Track Shipment
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                {/* Order Status */}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-3">Order Status</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-500 mr-2" />
                        <span>Order Status</span>
                      </div>
                      <span className={getFulfillmentStatusDisplay(trackingDetails.order.fulfillment_status).color}>
                        {getFulfillmentStatusDisplay(trackingDetails.order.fulfillment_status).text}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                        <span>Payment Status</span>
                      </div>
                      <span className={getStatusDisplay(trackingDetails.order.financial_status).color}>
                        {getStatusDisplay(trackingDetails.order.financial_status).text}
                      </span>
                    </div>
                    
                    {trackingDetails.order.tracking && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Truck className="h-5 w-5 text-gray-500 mr-2" />
                            <span>Shipment Status</span>
                          </div>
                          <span className={getShipmentStatusDisplay(trackingDetails.order.tracking.status).color + ' px-2 py-1 rounded-full text-xs font-medium'}>
                            {getShipmentStatusDisplay(trackingDetails.order.tracking.status).text}
                          </span>
                        </div>
                        
                        {trackingDetails.order.tracking.tracking_number && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Package className="h-5 w-5 text-gray-500 mr-2" />
                              <span>Tracking Number</span>
                            </div>
                            <span className="font-mono text-sm">
                              {trackingDetails.order.tracking.tracking_number}
                            </span>
                          </div>
                        )}
                        
                        {trackingDetails.order.tracking.estimated_delivery_date && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                              <span>Estimated Delivery</span>
                            </div>
                            <span>
                              {formatDate(trackingDetails.order.tracking.estimated_delivery_date)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {/* Shipping Address */}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-3">Shipping Address</h3>
                  <div className="text-sm">
                    <p className="font-medium">
                      {trackingDetails.order.shipping_address.first_name} {trackingDetails.order.shipping_address.last_name}
                    </p>
                    <p>{trackingDetails.order.shipping_address.address1}</p>
                    {trackingDetails.order.shipping_address.address2 && <p>{trackingDetails.order.shipping_address.address2}</p>}
                    <p>
                      {trackingDetails.order.shipping_address.city}, {trackingDetails.order.shipping_address.province} {trackingDetails.order.shipping_address.zip}
                    </p>
                    <p>{trackingDetails.order.shipping_address.country}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="font-semibold">Order Items</h2>
            </div>
            
            <div className="divide-y">
              {trackingDetails.order.line_items.map(item => (
                <div key={item.id} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    {item.sku && <p className="text-xs text-gray-400">SKU: {item.sku}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {trackingDetails.order.currency === 'INR' ? '₹' : trackingDetails.order.currency}
                      {(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold">
                {trackingDetails.order.currency === 'INR' ? '₹' : trackingDetails.order.currency}
                {parseFloat(trackingDetails.order.total_price).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Tracking History */}
          {trackingDetails.order.tracking?.tracking_history && trackingDetails.order.tracking.tracking_history.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="font-semibold">Tracking History</h2>
              </div>
              
              <div className="px-6 py-4">
                <div className="space-y-6">
                  {trackingDetails.order.tracking.tracking_history.map((event, index) => (
                    <div key={index} className="flex">
                      <div className="mr-4 flex flex-col items-center">
                        <div className={`rounded-full p-2 ${index === 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                          {index === 0 ? <Package className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                        </div>
                        {index < trackingDetails.order.tracking!.tracking_history.length - 1 && (
                          <div className="h-full w-0.5 bg-gray-200 my-1"></div>
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="font-medium">{event.status}</p>
                        <p className="text-sm text-gray-500">{formatDate(event.timestamp)}</p>
                        <p className="text-sm">{event.location}</p>
                        <p className="text-sm text-gray-600">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
