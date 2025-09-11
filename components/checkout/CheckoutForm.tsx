'use client';

import { useState, useEffect } from 'react';
import {
  PaymentElement,
  AddressElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

interface CheckoutFormProps {
  clientSecret: string;
}

export default function CheckoutForm({ clientSecret }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { items, totalPrice, currencyCode, clearCart } = useCartStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('Payment succeeded!');
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.');
          break;
        default:
          setMessage('Something went wrong.');
          break;
      }
    });
  }, [stripe, clientSecret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message || 'An error occurred');
      } else {
        setMessage('An unexpected error occurred.');
      }
    } else {
      // Payment succeeded, clear the cart
      clearCart();
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: 'tabs' as const,
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Order Summary</h3>
        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.title} {item.variantTitle && `(${item.variantTitle})`} × {item.quantity}</span>
              <span>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: item.currencyCode,
                }).format(parseFloat(item.price) * item.quantity)}
              </span>
            </div>
          ))}
          <div className="border-t pt-2 font-semibold flex justify-between">
            <span>Total:</span>
            <span>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currencyCode,
              }).format(totalPrice)}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Shipping Address</h3>
        <AddressElement options={{ mode: 'shipping' }} />
      </div>

      <div>
        <h3 className="font-semibold mb-4">Payment Details</h3>
        <PaymentElement id="payment-element" options={paymentElementOptions} />
      </div>

      <Button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
          }).format(totalPrice)}`
        )}
      </Button>

      {message && (
        <div className={`text-sm p-3 rounded ${
          message.includes('succeeded') 
            ? 'bg-green-50 text-green-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          {message}
        </div>
      )}
    </form>
  );
}