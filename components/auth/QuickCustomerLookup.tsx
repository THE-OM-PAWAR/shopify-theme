'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCustomerStore } from '@/lib/customer-store';
import { ShopifyCustomer } from '@/lib/shopify-customer';
import { Search, User, Package } from 'lucide-react';
import toast from 'react-hot-toast';

interface QuickCustomerLookupProps {
  onCustomerFound?: (customer: ShopifyCustomer) => void;
  initialEmail?: string;
}

export default function QuickCustomerLookup({ onCustomerFound, initialEmail = '' }: QuickCustomerLookupProps) {
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const { setCustomer } = useCustomerStore();

  const handleLookup = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/customer-lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok && result.found) {
        const customer = result.customer;
        setCustomer(customer, 'lookup-token');
        onCustomerFound?.(customer);
        toast.success(`Welcome back, ${customer.firstName}! Your details have been loaded.`);
      } else if (result.found === false) {
        toast('No account found with this email. You can continue as a new customer or create an account.');
      } else {
        toast.error('Failed to lookup customer information');
      }
    } catch (error) {
      console.error('Customer lookup error:', error);
      toast.error('Failed to lookup customer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <User className="h-5 w-5 text-blue-600" />
        <h3 className="font-medium text-blue-900">Returning Customer?</h3>
      </div>
      
      <p className="text-sm text-blue-700 mb-4">
        Enter your email to load your saved information and previous orders.
      </p>
      
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-10"
          />
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
        </div>
        <Button 
          onClick={handleLookup} 
          disabled={isLoading || !email}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Looking up...' : 'Find Account'}
        </Button>
      </div>
      
      <div className="flex items-center gap-4 mt-3 text-xs text-blue-600">
        <div className="flex items-center gap-1">
          <Package className="h-3 w-3" />
          <span>Order History</span>
        </div>
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          <span>Saved Addresses</span>
        </div>
      </div>
    </div>
  );
}