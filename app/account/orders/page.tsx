'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerStore } from '@/lib/customer-store';
import { Package, ArrowLeft, ShoppingBag, Calendar, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  orderNumber: string;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: string;
  currencyCode: string;
  lineItems: Array<{
    id: string;
    title: string;
    variant: {
      title: string;
    };
    quantity: number;
    originalTotalPrice: string;
  }>;
}

export default function OrdersPage() {
  const { customer, isAuthenticated, _hasHydrated } = useCustomerStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (_hasHydrated && !isAuthenticated) {
      router.push('/');
      return;
    }

    // Fetch orders if authenticated
    if (_hasHydrated && isAuthenticated && customer) {
      fetchOrders();
    }
  }, [isAuthenticated, _hasHydrated, customer, router]);

  const fetchOrders = async () => {
    if (!customer) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call our API to fetch orders from Shopify
      const response = await fetch('/api/customer/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: customer.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch orders');
      toast.error('Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'FULFILLED':
        return { text: 'Delivered', color: 'text-green-600' };
      case 'PARTIALLY_FULFILLED':
        return { text: 'Partially Shipped', color: 'text-blue-600' };
      case 'UNFULFILLED':
        return { text: 'Processing', color: 'text-orange-500' };
      case 'REFUNDED':
        return { text: 'Refunded', color: 'text-red-600' };
      case 'CANCELLED':
        return { text: 'Cancelled', color: 'text-gray-600' };
      default:
        return { text: status, color: 'text-gray-600' };
    }
  };

  const getPaymentStatusDisplay = (status: string) => {
    switch (status) {
      case 'PAID':
        return { text: 'Paid', color: 'text-green-600' };
      case 'PENDING':
        return { text: 'Payment Pending', color: 'text-orange-500' };
      case 'REFUNDED':
        return { text: 'Refunded', color: 'text-red-600' };
      case 'PARTIALLY_REFUNDED':
        return { text: 'Partially Refunded', color: 'text-blue-600' };
      default:
        return { text: status, color: 'text-gray-600' };
    }
  };

  if (!_hasHydrated || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Store
        </Link>
        
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Your Orders</h1>
        {customer && (
          <p className="text-gray-600">
            {customer.firstName} {customer.lastName} · {customer.email}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Error loading orders</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <Button onClick={() => fetchOrders()}>
            Try Again
          </Button>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map(order => {
            const fulfillmentStatus = getStatusDisplay(order.fulfillmentStatus);
            const paymentStatus = getPaymentStatusDisplay(order.financialStatus);
            
            return (
              <div key={order.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-4 py-4 border-b">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="font-medium">Order #{order.orderNumber}</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(order.processedAt)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span className={paymentStatus.color}>{paymentStatus.text}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className={fulfillmentStatus.color}>
                          {fulfillmentStatus.text}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-4 py-4">
                  {order.lineItems.map(item => (
                    <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-500">
                          {item.variant.title !== 'Default' ? item.variant.title : ''} · Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {order.currencyCode === 'INR' ? '₹' : order.currencyCode}
                          {(parseFloat(item.originalTotalPrice) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gray-50 px-4 py-4 border-t flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <div className="flex items-center space-x-4">
                    <span className="font-bold">
                      {order.currencyCode === 'INR' ? '₹' : order.currencyCode}
                      {parseFloat(order.totalPrice).toFixed(2)}
                    </span>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/orders/${order.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">When you place an order, it will appear here.</p>
          <Button asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
}