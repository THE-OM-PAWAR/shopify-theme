'use client';

import { useEffect, useState, useCallback } from 'react';
import { useCartStore } from '@/lib/store';
import { useCustomizationStore } from '@/lib/customization-store';
import { useCustomerStore } from '@/lib/customer-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import CustomerLoginModal from '@/components/auth/CustomerLoginModal';
import QuickCustomerLookup from '@/components/auth/QuickCustomerLookup';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, CreditCard, Truck, Shield, User, LogOut } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  phone: string;
  saveInfo: boolean;
  paymentMethod: string;
  billingAddressSame: boolean;
}

export default function CheckoutPage() {
  const { items, totalPrice, currencyCode, clearCart } = useCartStore();
  const { getCustomization, removeCustomization } = useCustomizationStore();
  const { customer, isAuthenticated, clearCustomer, _hasHydrated: customerHydrated } = useCustomerStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [emailForLogin, setEmailForLogin] = useState('');
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    phone: '',
    saveInfo: false,
    paymentMethod: 'cod',
    billingAddressSame: true,
  });

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const subtotal = totalPrice;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  // Auto-fill form with customer data when available
  useEffect(() => {
    if (customerHydrated && customer && isAuthenticated) {
      setFormData(prev => ({
        ...prev,
        email: customer.email || prev.email,
        firstName: customer.firstName || prev.firstName,
        lastName: customer.lastName || prev.lastName,
        phone: customer.phone || prev.phone,
        address: customer.defaultAddress?.address1 || prev.address,
        apartment: customer.defaultAddress?.address2 || prev.apartment,
        city: customer.defaultAddress?.city || prev.city,
        state: customer.defaultAddress?.province || prev.state,
        pinCode: customer.defaultAddress?.zip || prev.pinCode,
        country: customer.defaultAddress?.country || prev.country,
      }));
    }
  }, [customer, isAuthenticated, customerHydrated]);

  useEffect(() => {
    if (items.length === 0) {
      // Redirect to home if cart is empty
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  }, [items]);

  const handleInputChange = (field: keyof CheckoutFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmailBlur = useCallback(() => {
    // Check if email is entered and user is not authenticated
    if (formData.email && !isAuthenticated && formData.email.includes('@')) {
      setEmailForLogin(formData.email);
      // Small delay to improve UX
      setTimeout(() => {
        setShowLoginModal(true);
      }, 500);
    }
  }, [formData.email, isAuthenticated]);

  const handleCustomerFound = (customerData: any) => {
    // Customer data will be automatically filled via useEffect above
    toast.success('Welcome back! Your details have been filled automatically.');
  };

  const handleSignOut = () => {
    clearCustomer();
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      address: '',
      apartment: '',
      city: '',
      state: '',
      pinCode: '',
      country: 'India',
      phone: '',
      saveInfo: false,
      paymentMethod: 'cod',
      billingAddressSame: true,
    });
    toast.success('Signed out successfully');
  };

  const validateForm = (): boolean => {
    const required = ['email', 'firstName', 'lastName', 'address', 'city', 'state', 'pinCode', 'phone'];
    
    for (const field of required) {
      if (!formData[field as keyof CheckoutFormData]) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase());
        toast.error(`Please fill in ${fieldName}`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    // PIN code validation
    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(formData.pinCode)) {
      toast.error('Please enter a valid 6-digit PIN code');
      return false;
    }

    return true;
  };

  const handleCompleteOrder = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Collect customization data for items that have customizations
      const customizations: Array<{
        originalImageUrl: string;
        croppedImageUrl: string;
        renderedImageUrl: string;
        productTitle: string;
        variantTitle: string;
      }> = [];
      
      items.forEach(item => {
        const customization = getCustomization(item.productId);
        if (customization) {
          customizations.push({
            originalImageUrl: customization.originalImageUrl,
            croppedImageUrl: customization.croppedImageUrl,
            renderedImageUrl: customization.renderedImageUrl,
            productTitle: item.title,
            variantTitle: item.variantTitle || 'Default'
          });
        }
      });
      
      // Prepare order data for Shopify
      const orderData = {
        email: formData.email,
        shipping_address: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address1: formData.address,
          address2: formData.apartment,
          city: formData.city,
          province: formData.state,
          zip: formData.pinCode,
          country: formData.country,
          phone: formData.phone,
        },
        billing_address: formData.billingAddressSame ? {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address1: formData.address,
          address2: formData.apartment,
          city: formData.city,
          province: formData.state,
          zip: formData.pinCode,
          country: formData.country,
          phone: formData.phone,
        } : null,
        line_items: items.map(item => ({
          variant_id: item.variantId.includes('gid://shopify/ProductVariant/') 
            ? item.variantId.replace('gid://shopify/ProductVariant/', '')
            : item.variantId,
          quantity: item.quantity,
          price: item.price,
        })),
        total_price: total.toFixed(2),
        subtotal_price: subtotal.toFixed(2),
        total_tax: tax.toFixed(2),
        shipping_lines: shipping > 0 ? [{
          title: 'Standard Shipping',
          price: shipping.toFixed(2),
        }] : [],
        payment_method: formData.paymentMethod,
        customizations: customizations, // Include customization data
      };

      console.log('Creating order with data:', orderData);
      if (customizations.length > 0) {
        console.log('Order includes customizations for', customizations.length, 'products');
      }

      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Order placed successfully!');
        clearCart();
        
        // Clear customizations from local storage after successful order
        if (customizations.length > 0) {
          items.forEach(item => {
            const customization = getCustomization(item.productId);
            if (customization) {
              // Remove customizations from local storage since they're now processed
              removeCustomization(item.productId);
              console.log(`Customization for ${item.title} has been processed and uploaded to Shopify`);
            }
          });
        }
        
        // Redirect to success page with order details
        const params = new URLSearchParams({
          order_id: result.order.id.toString(),
          order_number: result.order.order_number,
          total_price: result.order.total_price,
          currency: result.order.currency
        });
        window.location.href = `/checkout/success?${params.toString()}`;
      } else {
        console.error('Order creation failed:', result);
        throw new Error(result.error || result.details || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some products to your cart before checking out.</p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Store
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <div className="flex items-center justify-center mt-2 space-x-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Secure checkout</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Contact</h2>
                <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700">
                  Sign in
                </Link>
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email or mobile phone number"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Delivery</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="country">Country/Region</Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="India">India</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      placeholder="First name (optional)"
                      placeholder={isAuthenticated && customer ? "First name" : "First name (optional)"}
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Input
                    placeholder="Address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    placeholder="Apartment, suite, etc. (optional)"
                    value={formData.apartment}
                    onChange={(e) => handleInputChange('apartment', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Input
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>
                  <div>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Input
                      placeholder="PIN code"
                      value={formData.pinCode}
                      onChange={(e) => handleInputChange('pinCode', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Input
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="save-info"
                    checked={formData.saveInfo}
                    onCheckedChange={(checked) => handleInputChange('saveInfo', checked as boolean)}
                  />
                  <Label htmlFor="save-info" className="text-sm">
                    Save this information for next time
                  </Label>
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Shipping method</h2>
              <div className="bg-blue-50 p-4 rounded-lg text-center text-sm text-blue-700">
                <Truck className="h-5 w-5 mx-auto mb-2" />
                Enter your shipping address to view available shipping methods.
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Payment</h2>
              <p className="text-sm text-gray-600 mb-4">All transactions are secure and encrypted.</p>
              
              <RadioGroup 
                value={formData.paymentMethod} 
                onValueChange={(value) => handleInputChange('paymentMethod', value)}
                className="space-y-3"
              >
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1">Cash on Delivery (COD)</Label>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 opacity-50">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" disabled />
                    <Label htmlFor="card" className="flex-1">Credit/Debit Card (Coming Soon)</Label>
                    <CreditCard className="h-4 w-4" />
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Billing Address */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Billing address</h2>
              
              <RadioGroup 
                value={formData.billingAddressSame ? "same" : "different"} 
                onValueChange={(value) => handleInputChange('billingAddressSame', value === "same")}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="same" id="same" />
                  <Label htmlFor="same">Same as shipping address</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="different" id="different" />
                  <Label htmlFor="different">Use a different billing address</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Complete Order Button */}
            <Button
              onClick={handleCompleteOrder}
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact
              </h2>
              {customerHydrated && (
                <div className="flex items-center gap-2">
                  {isAuthenticated && customer ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600 font-medium">
                        Welcome, {customer.firstName}!
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSignOut}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowLoginModal(true)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Sign in
                    </Button>
                  )}
                </div>
              )}
              {isLoading ? 'Processing...' : 'Complete order'}
            <div className="space-y-3">

            {/* Footer Links */}
            <div className="flex flex-wrap gap-4 text-sm text-blue-600">
              <Link href="/refund-policy" className="hover:underline">Refund policy</Link>
              <Link href="/shipping" className="hover:underline">Shipping</Link>
                onBlur={handleEmailBlur}
              <Link href="/privacy" className="hover:underline">Privacy policy</Link>
                disabled={isAuthenticated && !!customer?.email}
              <Link href="/terms" className="hover:underline">Terms of service</Link>
              {isAuthenticated && customer && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Signed in as {customer.email}</span>
                  {customer.ordersCount > 0 && (
                    <span className="text-gray-500">• {customer.ordersCount} previous orders</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Quick Customer Lookup - only show if not authenticated */}
            {customerHydrated && !isAuthenticated && (
              <div className="mt-4">
                <QuickCustomerLookup
                  onCustomerFound={handleCustomerFound}
                  initialEmail={formData.email}
                />
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
            
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {items.map((item) => {
                // Check if this product has customization
                const customization = getCustomization(item.productId);
                const displayImage = customization?.renderedImageUrl || item.image;
                
                return (
                  <div key={item.id} className="flex items-start space-x-4">
                    <div className="relative">
                      {displayImage && (
                        <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={displayImage}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      )}
                      {customization && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs px-1 py-0.5 rounded">
                          Custom
                        </div>
                      )}
                      <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {item.quantity}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
                      {item.variantTitle && (
                        <p className="text-xs text-gray-500">{item.variantTitle}</p>
                      )}
                      {customization && (
                        <p className="text-xs text-blue-600 font-medium">Customized Product</p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">
                        ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between font-semibold text-lg border-t pt-3">
                <span>Total</span>
                <span>INR ₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Login Modal */}
      <CustomerLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onCustomerFound={handleCustomerFound}
        initialEmail={emailForLogin}
      />
    </div>
  );
}