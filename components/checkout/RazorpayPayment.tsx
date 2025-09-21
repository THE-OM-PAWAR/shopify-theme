'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  amount: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId?: string;
  onSuccess: (paymentDetails: any) => void;
  onError: (error: any) => void;
  disabled?: boolean;
  buttonText?: string;
  className?: string;
}

export default function RazorpayPayment({
  amount,
  currency = 'INR',
  customerName,
  customerEmail,
  customerPhone,
  orderId,
  onSuccess,
  onError,
  disabled = false,
  buttonText = 'Pay Now',
  className = '',
}: RazorpayPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    if (window.Razorpay) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!isScriptLoaded) {
      toast.error('Payment system is loading. Please try again in a moment.');
      return;
    }

    setIsLoading(true);
    try {
      // Create Razorpay order
      const response = await fetch('/api/payment/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          receipt: orderId || `receipt_${Date.now()}`,
          notes: {
            customerName,
            customerEmail,
            customerPhone,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const data = await response.json();
      const { order, key_id } = data;

      if (!order || !key_id) {
        throw new Error('Invalid response from payment server');
      }

      // Initialize Razorpay checkout
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'Your Store Name',
        description: 'Purchase',
        order_id: order.id,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: '#3B82F6', // blue-500
        },
        handler: function (response: any) {
          // Payment successful
          onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      // Handle payment errors
      razorpay.on('payment.failed', function (response: any) {
        onError({
          code: response.error.code,
          description: response.error.description,
          source: response.error.source,
          step: response.error.step,
          reason: response.error.reason,
        });
      });
    } catch (error) {
      console.error('Error initializing payment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initialize payment');
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isLoading || !isScriptLoaded}
      className={`${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          {buttonText}
        </>
      )}
    </Button>
  );
}
