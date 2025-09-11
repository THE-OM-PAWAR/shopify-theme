'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStripe } from '@stripe/react-stripe-js';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';

export default function CheckoutSuccessPage() {
  const stripe = useStripe();
  const searchParams = useSearchParams();
  const { clearCart } = useCartStore();
  
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'succeeded' | 'failed'>('loading');
  const [paymentIntent, setPaymentIntent] = useState<any>(null);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = searchParams.get('payment_intent_client_secret');
    
    if (!clientSecret) {
      setPaymentStatus('failed');
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      setPaymentIntent(paymentIntent);
      
      switch (paymentIntent?.status) {
        case 'succeeded':
          setPaymentStatus('succeeded');
          clearCart(); // Clear cart on successful payment
          break;
        case 'processing':
          setPaymentStatus('loading');
          break;
        case 'requires_payment_method':
          setPaymentStatus('failed');
          break;
        default:
          setPaymentStatus('failed');
          break;
      }
    });
  }, [stripe, searchParams, clearCart]);

  if (paymentStatus === 'loading') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing your payment...</h1>
          <p className="text-gray-600">Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="bg-red-50 text-red-700 p-6 rounded-lg mb-8">
            <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
            <p>There was an issue processing your payment. Please try again.</p>
          </div>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/checkout">Try Again</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your order has been confirmed and will be processed shortly.
        </p>

        {paymentIntent && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8 text-left">
            <h2 className="font-semibold text-gray-900 mb-4">Order Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Payment ID:</span>
                <span className="font-mono text-xs">{paymentIntent.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: paymentIntent.currency.toUpperCase(),
                  }).format(paymentIntent.amount / 100)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-green-600 font-semibold capitalize">
                  {paymentIntent.status}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
          <p className="text-blue-700 text-sm">
            You'll receive an email confirmation shortly with your order details and tracking information.
            Your items will be shipped within 1-2 business days.
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}