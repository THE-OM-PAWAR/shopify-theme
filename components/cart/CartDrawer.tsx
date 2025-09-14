'use client';

import { useCartStore } from '@/lib/store';
import { useCustomizationStore } from '@/lib/customization-store';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import Link from 'next/link';

export default function CartDrawer() {
  const {
    isOpen,
    items,
    totalPrice,
    currencyCode,
    checkoutUrl,
    isLoading,
    _hasHydrated,
    closeCart,
    updateCartItem,
    removeFromCart,
    refreshCart,
  } = useCartStore();

  const { getCustomization, _hasHydrated: customizationHasHydrated } = useCustomizationStore();
  useEffect(() => {
    if (isOpen && _hasHydrated) {
      refreshCart();
    }
  }, [isOpen, _hasHydrated, refreshCart]);

  if (!isOpen) return null;


  const handleQuantityChange = async (variantId: string, newQuantity: number) => {
    if (isLoading) return;
    
    if (newQuantity <= 0) {
      await removeFromCart(variantId);
    } else {
      await updateCartItem(variantId, newQuantity);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={closeCart} />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({_hasHydrated ? items.length : 0})
          </h2>
          <Button variant="ghost" size="sm" onClick={closeCart}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {!_hasHydrated || isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-500 mt-2">{!_hasHydrated ? 'Loading...' : 'Loading cart...'}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <Button onClick={closeCart} variant="outline">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                // Check if this product has customization
                const customization = _hasHydrated && customizationHasHydrated ? getCustomization(item.productId) : null;
                const displayImage = customization?.renderedImageUrl || item.image;
                
                return (
                <div key={item.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  {displayImage && (
                    <div className="w-16 h-16 relative rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={displayImage}
                        alt={item.title}
                        fill
                        sizes="64px"
                      />
                        {customization && (
                          <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-1 py-0.5 rounded-bl">
                            Custom
                          </div>
                        )}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
                    {item.variantTitle && (
                      <p className="text-xs text-gray-500">{item.variantTitle}</p>
                    )}
                      {customization && (
                        <p className="text-xs text-blue-600 font-medium">Customized</p>
                      )}
                    <p className="text-gray-900 font-semibold text-sm mt-1">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: item.currencyCode,
                      }).format(parseFloat(item.price))}
                    </p>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleQuantityChange(item.variantId, item.quantity - 1)}
                        disabled={isLoading || item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleQuantityChange(item.variantId, item.quantity + 1)}
                        disabled={isLoading || item.quantity >= item.maxQuantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.variantId)}
                      className="text-red-500 hover:text-red-600 h-7 px-2"
                      disabled={isLoading}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {_hasHydrated && items.length > 0 && (
          <div className="border-t p-4 space-y-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg">Total:</span>
              <span className="font-bold text-xl">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currencyCode,
                }).format(totalPrice)}
              </span>
            </div>
            <Button 
              className="w-full" 
              asChild
              disabled={isLoading}
              size="lg"
            >
              <Link href="/checkout" onClick={closeCart}>
                {isLoading ? 'Processing...' : 'Secure Checkout'}
              </Link>
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Secure checkout powered by Stripe
            </p>
          </div>
        )}
      </div>
    </>
  );
}