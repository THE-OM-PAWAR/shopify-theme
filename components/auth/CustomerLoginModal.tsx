'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCustomerStore } from '@/lib/customer-store';
import { getCustomerAccessToken, getCustomer, createCustomer, CustomerFormData } from '@/lib/shopify-customer';
import { Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface CustomerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerFound?: (customer: any) => void;
  initialEmail?: string;
}

export default function CustomerLoginModal({ 
  isOpen, 
  onClose, 
  onCustomerFound,
  initialEmail = '' 
}: CustomerLoginModalProps) {
  const { setCustomer } = useCustomerStore();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: initialEmail,
    password: '',
  });

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    email: initialEmail,
    firstName: '',
    lastName: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    province: '',
    zip: '',
    country: 'India',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const accessToken = await getCustomerAccessToken(loginForm.email, loginForm.password);
      
      if (accessToken) {
        const customer = await getCustomer(accessToken);
        
        if (customer) {
          setCustomer(customer, accessToken);
          onCustomerFound?.(customer);
          toast.success(`Welcome back, ${customer.firstName}!`);
          onClose();
        } else {
          toast.error('Failed to retrieve customer information');
        }
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['email', 'firstName', 'lastName', 'phone'];
    for (const field of requiredFields) {
      if (!registerForm[field as keyof typeof registerForm]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(registerForm.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    try {
      const customer = await createCustomer(registerForm as CustomerFormData);
      
      if (customer) {
        // Try to get access token for the new customer
        // Note: In a real implementation, you might want to send a welcome email
        // with login instructions instead of auto-logging them in
        toast.success('Account created successfully! Please check your email for login instructions.');
        
        // For demo purposes, we'll create a temporary session
        setCustomer(customer, 'temp-token');
        onCustomerFound?.(customer);
        onClose();
      } else {
        toast.error('Failed to create account');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.message.includes('email')) {
        toast.error('An account with this email already exists. Please try logging in.');
        setActiveTab('login');
        setLoginForm(prev => ({ ...prev, email: registerForm.email }));
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestCheckout = () => {
    onClose();
    // Continue with guest checkout
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Customer Account</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Create Account</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
                onClick={() => toast.info('Password reset functionality coming soon!')}
              >
                Forgot your password?
              </button>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="register-firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-firstName"
                      placeholder="First name"
                      value={registerForm.firstName}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-lastName">Last Name</Label>
                  <Input
                    id="register-lastName"
                    placeholder="Last name"
                    value={registerForm.lastName}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="10-digit phone number"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-address">Address (Optional)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-address"
                    placeholder="Street address"
                    value={registerForm.address1}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, address1: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="register-city">City</Label>
                  <Input
                    id="register-city"
                    placeholder="City"
                    value={registerForm.city}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-zip">PIN Code</Label>
                  <Input
                    id="register-zip"
                    placeholder="PIN code"
                    value={registerForm.zip}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, zip: e.target.value }))}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Button variant="outline" onClick={handleGuestCheckout} className="w-full">
          Continue as Guest
        </Button>

        <p className="text-xs text-center text-gray-500">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </DialogContent>
    </Dialog>
  );
}