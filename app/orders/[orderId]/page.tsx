'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Package, Truck, Calendar, Clock, CheckCircle, AlertCircle, Loader2, ArrowLeft, ExternalLink, MapPin, Phone, Mail, CreditCard, DollarSign, User } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface OrderDetails {
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
      image?: string;
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
      phone?: string;
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

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [orderId]);

  const fetchOrderDetails = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch order details');
      }

      const data = await response.json();
      setOrderDetails(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch order details');
      toast.error('Failed to load order details. Please try again.');
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return { text: 'Paid', color: 'text-green-600', icon: CheckCircle };
      case 'pending':
        return { text: 'Payment Pending', color: 'text-orange-500', icon: Clock };
      case 'refunded':
        return { text: 'Refunded', color: 'text-red-600', icon: AlertCircle };
      case 'partially_refunded':
        return { text: 'Partially Refunded', color: 'text-blue-600', icon: AlertCircle };
      default:
        return { text: status, color: 'text-gray-600', icon: Clock };
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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-gray-900" />
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The order you are looking for could not be found.'}</p>
          <Button asChild>
            <Link href="/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const order = orderDetails.order;
  const financialStatus = getStatusDisplay(order.financial_status);
  const fulfillmentStatus = getFulfillmentStatusDisplay(order.fulfillment_status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link 
          href="/orders" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
        
        <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
        <p className="text-gray-600">Order #{order.order_number} • Placed on {formatDate(order.created_at)}</p>
      </div>

      <div className="space-y-8">
        {/* Order Status Overview */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="font-semibold text-lg">Order Status</h2>
          </div>
          
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {financialStatus.icon && <financialStatus.icon className={`h-6 w-6 ${financialStatus.color} mr-2`} />}
                  <span className={`font-medium ${financialStatus.color}`}>
                    {financialStatus.text}
                  </span>
                </div>
                <p className="text-sm text-gray-500">Payment Status</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {fulfillmentStatus.icon && <fulfillmentStatus.icon className={`h-6 w-6 ${fulfillmentStatus.color} mr-2`} />}
                  <span className={`font-medium ${fulfillmentStatus.color}`}>
                    {fulfillmentStatus.text}
                  </span>
                </div>
                <p className="text-sm text-gray-500">Fulfillment Status</p>
              </div>
              
              {order.tracking && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Truck className="h-6 w-6 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-600">
                      {order.tracking.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Shipment Status</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="font-semibold text-lg">Order Items</h2>
          </div>
          
          <div className="divide-y">
            {order.line_items.map(item => (
              <div key={item.id} className="px-6 py-4 flex items-center space-x-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  {item.sku && <p className="text-xs text-gray-400">SKU: {item.sku}</p>}
                </div>
                
                <div className="text-right">
                  <p className="font-medium">
                    {order.currency === 'INR' ? '₹' : order.currency}
                    {(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 px-6 py-4 border-t flex justify-between">
            <span className="font-medium">Total</span>
            <span className="font-bold">
              {order.currency === 'INR' ? '₹' : order.currency}
              {parseFloat(order.total_price).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="font-semibold text-lg">Shipping Information</h2>
          </div>
          
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Shipping Address</h3>
                <div className="text-sm">
                  <p className="font-medium">
                    {order.shipping_address.first_name} {order.shipping_address.last_name}
                  </p>
                  <p>{order.shipping_address.address1}</p>
                  {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.zip}
                  </p>
                  <p>{order.shipping_address.country}</p>
                  {order.shipping_address.phone && (
                    <p className="flex items-center mt-2">
                      <Phone className="h-4 w-4 mr-2" />
                      {order.shipping_address.phone}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
                <div className="text-sm">
                  <p className="flex items-center mb-2">
                    <Mail className="h-4 w-4 mr-2" />
                    {order.customer.email}
                  </p>
                  <p className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {order.customer.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking Information */}
        {order.tracking && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-lg">Tracking Information</h2>
            </div>
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Shipment Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tracking Number:</span>
                      <span className="font-mono">{order.tracking.tracking_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Courier:</span>
                      <span>{order.tracking.courier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getShipmentStatusDisplay(order.tracking.status).color}`}>
                        {getShipmentStatusDisplay(order.tracking.status).text}
                      </span>
                    </div>
                    {order.tracking.estimated_delivery_date && (
                      <div className="flex justify-between">
                        <span>Estimated Delivery:</span>
                        <span>{formatDate(order.tracking.estimated_delivery_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Track Your Package</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Click the button below to track your package on the courier's website.
                  </p>
                  <Button asChild>
                    <a 
                      href={order.tracking.tracking_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center"
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Track Package
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tracking History */}
        {order.tracking?.tracking_history && order.tracking.tracking_history.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-lg">Tracking History</h2>
            </div>
            
            <div className="px-6 py-4">
              <div className="space-y-6">
                {order.tracking.tracking_history.map((event, index) => (
                  <div key={index} className="flex">
                    <div className="mr-4 flex flex-col items-center">
                      <div className={`rounded-full p-2 ${index === 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        {index === 0 ? <Package className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                      </div>
                      {index < order.tracking!.tracking_history.length - 1 && (
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
    </div>
  );
}
