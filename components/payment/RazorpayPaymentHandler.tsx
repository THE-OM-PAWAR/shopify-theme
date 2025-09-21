'use client';

import { useState, useEffect } from 'react';
import RazorpayScript from './RazorpayScript';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface RazorpayPaymentHandlerProps {
  amount: number;
  currency: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onError: (error: any) => void;
  isDisabled?: boolean;
  buttonText?: string;
  className?: string;
}

export default function RazorpayPaymentHandler({
  amount,
  currency,
  customerInfo,
  onSuccess,
  onError,
  isDisabled = false,
  buttonText = 'Pay Now',
  className = '',
}: RazorpayPaymentHandlerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const handlePayment = async () => {
    if (!isScriptLoaded) {
      toast.error('Payment system is still loading. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      // Create order on the server
      const response = await fetch('/api/payment/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to paisa/cents
          currency,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const orderData = await response.json();

      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Your Store Name',
        description: 'Purchase from Your Store',
        order_id: orderData.id,
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone,
        },
        theme: {
          color: '#3B82F6', // Blue color
        },
        handler: function (response: any) {
          // Payment successful
          onSuccess(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          );
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      // Handle Razorpay modal close
      razorpay.on('payment.failed', function (response: any) {
        onError(response.error);
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <RazorpayScript onLoad={() => setIsScriptLoaded(true)} />
      <Button
        onClick={handlePayment}
        disabled={isLoading || isDisabled || !isScriptLoaded}
        className={`${className}`}
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          buttonText
        )}
      </Button>
    </>
  );
}
