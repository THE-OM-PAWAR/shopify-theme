'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, ArrowRight, Download, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';

interface OrderDetails {
  id: string;
  order_number: string;
  total_price: string;
  currency: string;
  created_at: string;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const { clearCart } = useCartStore();
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    const orderNumber = searchParams.get('order_number');
    const totalPrice = searchParams.get('total_price');
    const currency = searchParams.get('currency');
    
    if (orderId && orderNumber) {
      setOrderDetails({
        id: orderId,
        order_number: orderNumber,
        total_price: totalPrice || '0',
        currency: currency || 'INR',
        created_at: new Date().toISOString(),
      });
      
      // Clear cart on successful order
      clearCart();
    } else {
      console.warn('Missing order details in URL params');
    }
  }, [searchParams, clearCart]);

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
            <p className="text-gray-600 mb-2">
              Thank you for your purchase. Your order has been confirmed and will be processed shortly.
            </p>
            {orderDetails && (
              <p className="text-sm text-gray-500">
                Order #{orderDetails.order_number} • {new Date(orderDetails.created_at).toLocaleDateString()}
              </p>
            )}
          </div>

          {orderDetails && (
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h2 className="font-semibold text-gray-900 mb-4">Order Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Order Number:</span>
                  <span className="font-semibold">#{orderDetails.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-mono text-xs">{orderDetails.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-semibold">
                    ₹{parseFloat(orderDetails.total_price || '0').toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span>Cash on Delivery (COD)</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-orange-600 font-semibold">Processing</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <Package className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
              <p className="text-blue-700 text-sm">
                You'll receive an email confirmation shortly with your order details and tracking information.
                Your items will be prepared for delivery within 1-2 business days.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <Mail className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-green-900 mb-2">Order Confirmation</h3>
              <p className="text-green-700 text-sm">
                A confirmation email has been sent to your email address with all the order details
                and delivery information.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Package className="h-5 w-5 text-yellow-600 mt-0.5" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Cash on Delivery (COD) Instructions
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Please keep the exact amount ready for payment</li>
                    <li>Our delivery partner will collect the payment upon delivery</li>
                    <li>You can pay in cash to the delivery person</li>
                    <li>Please verify the order before making the payment</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="flex-1 sm:flex-none">
              <Link href="/">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" className="flex-1 sm:flex-none">
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
            <p>
              Need help with your order? 
              <Link href="/contact" className="text-blue-600 hover:text-blue-700 ml-1">
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}