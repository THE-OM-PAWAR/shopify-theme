'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerStore } from '@/lib/customer-store';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, CreditCard, Truck, Shield, Loader2, Plus, MapPin } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { EmailAuthModal } from '@/components/auth/EmailAuthModal';

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

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { customer, isAuthenticated, _hasHydrated } = useCustomerStore();
  const { items, totalPrice, currencyCode, clearCart } = useCartStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
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
    saveInfo: true,
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

  useEffect(() => {
    // If cart is empty, redirect to home
    if (items.length === 0) {
      toast.error('Your cart is empty');
      setTimeout(() => {
        router.push('/');
      }, 2000);
      return;
    }

    // If user is not authenticated, show auth modal
    if (_hasHydrated && !isAuthenticated) {
      setShowAuthModal(true);
    }

    // If user is authenticated, fetch their addresses and populate form
    if (_hasHydrated && isAuthenticated && customer) {
      fetchCustomerAddresses();
      
      // Populate form with customer data
      setFormData(prev => ({
        ...prev,
        email: customer.email || '',
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phone: customer.phone || '',
      }));

      // If customer has a default address, select it
      if (customer.defaultAddress) {
        setSelectedAddressId(customer.defaultAddress.id);
      }
    }
  }, [_hasHydrated, isAuthenticated, customer, items.length, router]);

  // Fetch customer addresses from Shopify
  const fetchCustomerAddresses = async () => {
    if (!customer || !customer.email) return;

    try {
      const response = await fetch('/api/customer/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: customer.email }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }

      const data = await response.json();
      setAddresses(data.addresses || []);
      
      // If customer has addresses but no selected address, select the first one
      if (data.addresses?.length > 0 && !selectedAddressId) {
        setSelectedAddressId(data.addresses[0].id);
        populateFormWithAddress(data.addresses[0]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load your saved addresses');
    }
  };

  // Populate form with selected address
  const populateFormWithAddress = (address: Address) => {
    setFormData(prev => ({
      ...prev,
      firstName: address.firstName || prev.firstName,
      lastName: address.lastName || prev.lastName,
      address: address.address1 || '',
      apartment: address.address2 || '',
      city: address.city || '',
      state: address.province || '',
      pinCode: address.zip || '',
      country: address.country || 'India',
      phone: address.phone || prev.phone,
    }));
  };

  // Handle address selection change
  const handleAddressChange = (addressId: string) => {
    setSelectedAddressId(addressId);
    
    if (addressId === 'new') {
      setShowNewAddressForm(true);
      // Clear address fields but keep personal info
      setFormData(prev => ({
        ...prev,
        address: '',
        apartment: '',
        city: '',
        state: '',
        pinCode: '',
      }));
    } else {
      setShowNewAddressForm(false);
      const selectedAddress = addresses.find(addr => addr.id === addressId);
      if (selectedAddress) {
        populateFormWithAddress(selectedAddress);
      }
    }
  };

  const handleInputChange = (field: keyof CheckoutFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  // Function to handle Razorpay payment
  const handleRazorpayPayment = async (orderData: any) => {
    try {
      // Create Razorpay order
      const razorpayResponse = await fetch('/api/payment/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Convert to paisa
          currency: 'INR',
        }),
      });

      if (!razorpayResponse.ok) {
        const errorData = await razorpayResponse.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const razorpayOrder = await razorpayResponse.json();

      // Load Razorpay script if not already loaded
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
          document.body.appendChild(script);
        });
      }

      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Your Store Name',
        description: 'Purchase from Your Store',
        order_id: razorpayOrder.id,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#3B82F6', // Blue color
        },
        handler: async function (response: any) {
          // Verify payment with server
          const verifyResponse = await fetch('/api/payment/razorpay/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (!verifyResponse.ok) {
            throw new Error('Payment verification failed');
          }

          const verifyResult = await verifyResponse.json();

          // Add payment details to order data
          orderData.payment_details = {
            payment_id: response.razorpay_payment_id,
            order_id: response.razorpay_order_id,
            signature: response.razorpay_signature,
            method: verifyResult.payment.method,
          };

          // Create order in Shopify
          await createShopifyOrder(orderData);
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

      // Handle Razorpay modal close
      razorpay.on('payment.failed', function (response: any) {
        throw new Error(response.error.description || 'Payment failed');
      });

      return true;
    } catch (error) {
      console.error('Razorpay payment error:', error);
      throw error;
    }
  };

  // Function to create Shopify order
  const createShopifyOrder = async (orderData: any) => {
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
      
      // Redirect to success page with order details
      const params = new URLSearchParams({
        order_id: result.order.id.toString(),
        order_number: result.order.order_number,
        total_price: result.order.total_price,
        currency: result.order.currency
      });
      router.push(`/checkout/success?${params.toString()}`);
    } else {
      console.error('Order creation failed:', result);
      throw new Error(result.error || result.details || 'Failed to create order');
    }
  };

  const handleCompleteOrder = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
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
        save_address: formData.saveInfo && showNewAddressForm,
      };

      // Handle payment based on selected method
      if (formData.paymentMethod === 'razorpay') {
        // For Razorpay, we initiate payment first
        await handleRazorpayPayment(orderData);
      } else {
        // For COD, create order directly
        await createShopifyOrder(orderData);
      }
    } catch (error) {
      console.error('Order creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order. Please try again.';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  // If cart is empty, show empty cart message
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
              <h2 className="text-lg font-semibold mb-4">Contact</h2>
              <div>
                <Input
                  type="email"
                  placeholder="Email or mobile phone number"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full"
                  disabled={isAuthenticated}
                />
                {isAuthenticated && (
                  <p className="text-xs text-gray-500 mt-1">
                    Logged in as {customer?.email}
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Delivery</h2>
              
              {/* Saved Addresses */}
              {isAuthenticated && addresses.length > 0 && (
                <div className="mb-6">
                  <Label htmlFor="saved-address" className="mb-2 block">Select a saved address</Label>
                  <RadioGroup 
                    value={selectedAddressId} 
                    onValueChange={handleAddressChange}
                    className="space-y-3"
                  >
                    {addresses.map(address => (
                      <div key={address.id} className="flex items-start space-x-2 border rounded-md p-3">
                        <RadioGroupItem value={address.id} id={`address-${address.id}`} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={`address-${address.id}`} className="font-medium cursor-pointer">
                            {address.firstName} {address.lastName}
                          </Label>
                          <p className="text-sm text-gray-600">
                            {address.address1}
                            {address.address2 && `, ${address.address2}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.province}, {address.zip}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.country}
                          </p>
                          {address.phone && (
                            <p className="text-sm text-gray-600">
                              {address.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex items-start space-x-2 border rounded-md p-3 border-dashed">
                      <RadioGroupItem value="new" id="address-new" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="address-new" className="font-medium cursor-pointer flex items-center">
                          <Plus className="h-4 w-4 mr-2" />
                          Add a new address
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}
              
              {/* Address Form (shown if no saved addresses or "Add new address" selected) */}
              {(showNewAddressForm || !isAuthenticated || addresses.length === 0) && (
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
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
                    <Input
                      id="apartment"
                      placeholder="Apartment, suite, etc."
                      value={formData.apartment}
                      onChange={(e) => handleInputChange('apartment', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
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
                      <Label htmlFor="pinCode">PIN code</Label>
                      <Input
                        id="pinCode"
                        placeholder="PIN code"
                        value={formData.pinCode}
                        onChange={(e) => handleInputChange('pinCode', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>

                  {isAuthenticated && showNewAddressForm && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="save-info"
                        checked={formData.saveInfo}
                        onCheckedChange={(checked) => handleInputChange('saveInfo', checked as boolean)}
                      />
                      <Label htmlFor="save-info" className="text-sm">
                        Save this address for future orders
                      </Label>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shipping Method */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Shipping method</h2>
              <div className="flex items-center justify-between border rounded-lg p-4">
                <div className="flex items-center">
                  <Truck className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="font-medium">Standard Shipping</p>
                    <p className="text-sm text-gray-500">Delivery in 3-5 business days</p>
                  </div>
                </div>
                <div className="text-right font-medium">
                  {shipping > 0 ? `₹${shipping.toFixed(2)}` : 'FREE'}
                </div>
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
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <Label htmlFor="razorpay" className="flex-1">Pay with Card/UPI/Wallet</Label>
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
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Complete order`
              )}
            </Button>

            {/* Footer Links */}
            <div className="flex flex-wrap gap-4 text-sm text-blue-600">
              <Link href="/refund-policy" className="hover:underline">Refund policy</Link>
              <Link href="/shipping" className="hover:underline">Shipping</Link>
              <Link href="/privacy" className="hover:underline">Privacy policy</Link>
              <Link href="/terms" className="hover:underline">Terms of service</Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
            
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-start space-x-4">
                  <div className="relative">
                    {item.image && (
                      <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
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
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
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

      {/* Authentication Modal */}
      <EmailAuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => {
          // Keep the user on the checkout page after authentication
          setShowAuthModal(false);
        }}
      />
    </div>
  );
}
