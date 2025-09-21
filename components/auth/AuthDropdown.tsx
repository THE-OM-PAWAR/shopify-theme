'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, Package } from 'lucide-react';
import { useCustomerStore } from '@/lib/customer-store';
import { Button } from '@/components/ui/button';
import { EmailAuthModal } from './EmailAuthModal';

export default function AuthDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { customer, isAuthenticated, clearCustomer, _hasHydrated } = useCustomerStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!_hasHydrated) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-gray-50 rounded-xl"
      >
        <User className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 border border-gray-100">
          <div className="p-4">
            <h3 className="text-lg font-medium mb-2">Account</h3>
            
            {isAuthenticated && customer ? (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Hi {customer.firstName}</p>
                  <p className="text-xs text-gray-500">{customer.email}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Link 
                    href="/account/orders" 
                    className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded-md text-sm transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Package className="h-4 w-4" />
                    Orders
                  </Link>
                  
                  <Link 
                    href="/account/profile" 
                    className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded-md text-sm transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full text-sm" 
                  onClick={() => {
                    clearCustomer();
                    setIsOpen(false);
                  }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  className="w-full bg-green-100 hover:bg-green-200 text-green-800 mb-4"
                  onClick={() => {
                    setShowAuthModal(true);
                    setIsOpen(false);
                  }}
                >
                  Sign in
                </Button>
                
                <div className="grid grid-cols-2 gap-2 opacity-50">
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2 text-sm" 
                    disabled
                  >
                    <Package className="h-4 w-4" />
                    Orders
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2 text-sm" 
                    disabled
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <EmailAuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}
