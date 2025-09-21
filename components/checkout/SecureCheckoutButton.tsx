'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCustomerStore } from '@/lib/customer-store';
import { useCartStore } from '@/lib/store';
import { EmailAuthModal } from '@/components/auth/EmailAuthModal';
import { ShoppingBag, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface SecureCheckoutButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  fullWidth?: boolean;
  productId?: string; // Optional: If checking out a specific product
  text?: string;
}

export default function SecureCheckoutButton({ 
  className = '', 
  variant = 'default', 
  size = 'default',
  fullWidth = false,
  productId,
  text = 'Checkout'
}: SecureCheckoutButtonProps) {
  const router = useRouter();
  const { isAuthenticated, customer } = useCustomerStore();
  const { items, totalQuantity } = useCartStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    // If cart is empty and no product ID is provided, show error
    if (totalQuantity === 0 && !productId) {
      toast.error('Your cart is empty');
      return;
    }

    setIsLoading(true);

    // If user is authenticated, proceed to checkout
    if (isAuthenticated && customer) {
      // Redirect to checkout page
      router.push('/checkout');
    } else {
      // Show authentication modal
      setIsLoading(false);
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    // After successful authentication, redirect to checkout
    router.push('/checkout');
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`${className} ${fullWidth ? 'w-full' : ''}`}
        onClick={handleCheckout}
        disabled={isLoading || (totalQuantity === 0 && !productId)}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ShoppingBag className="mr-2 h-4 w-4" />
            {text}
          </>
        )}
      </Button>

      <EmailAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
}