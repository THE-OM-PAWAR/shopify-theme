'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Search, Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import { useCustomerStore } from '@/lib/customer-store';
import { Button } from '@/components/ui/button';
import CustomerLoginModal from '@/components/auth/CustomerLoginModal';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { totalQuantity, openCart, _hasHydrated } = useCartStore();
  const { customer, isAuthenticated, clearCustomer, _hasHydrated: customerHydrated } = useCustomerStore();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Collections', href: '/collections' },
    { name: 'Products', href: '/products' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo/logo.avif"
                alt="Storefront Logo"
                width={120}
                height={40}
                className="h-8 w-auto sm:h-10 hover:opacity-80 transition-opacity"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="hidden sm:flex hover:bg-gray-50 rounded-xl">
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Customer Account */}
            {customerHydrated && (
              <div className="relative">
                {isAuthenticated && customer ? (
                  <div className="flex items-center space-x-2">
                    <span className="hidden sm:inline text-sm text-gray-700">
                      Hi, {customer.firstName}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearCustomer()}
                      className="hover:bg-gray-50 rounded-xl"
                      title="Sign out"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLoginModal(true)}
                    className="hover:bg-gray-50 rounded-xl"
                    title="Sign in"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                )}
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={openCart}
              className="relative hover:bg-gray-50 rounded-xl"
            >
              <ShoppingBag className="h-5 w-5" />
              {_hasHydrated && totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] font-medium">
                  {totalQuantity}
                </span>
              )}
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden hover:bg-gray-50 rounded-xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Customer Login Modal */}
      <CustomerLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </header>
  );
}