'use client';

import { useEffect } from 'react';
import CartDrawer from '@/components/cart/CartDrawer';
import Header from '@/components/layout/Header';
import { Toaster } from 'react-hot-toast';
import { useCartStore } from '@/lib/store';
import Footer from '@/components/layout/footer';

interface LayoutProps {
  children: React.ReactNode; 
}

export default function Layout({ children }: LayoutProps) {
  const { refreshCart } = useCartStore();

  useEffect(() => {
    // Refresh cart on app load
    refreshCart();
  }, [refreshCart]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header/>
      <main className="flex-1">
        {children}
      </main>
      <Footer/>
      <CartDrawer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}