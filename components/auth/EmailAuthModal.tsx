'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCustomerStore } from '@/lib/customer-store';
import { Mail, ArrowRight, KeyRound, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmailAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onAuthSuccess?: () => void;
}

type AuthStep = 'email' | 'otp' | 'register';

export function EmailAuthModal({ isOpen, onClose, initialEmail = '', onAuthSuccess }: EmailAuthModalProps) {
  const { setCustomer } = useCustomerStore();
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<AuthStep>('email');
  const [isNewUser, setIsNewUser] = useState(false);
  const [sessionId, setSessionId] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail);
      setOtp('');
      setFirstName('');
      setLastName('');
      setPhone('');
      setCurrentStep('email');
      setIsNewUser(false);
      setSessionId('');
    }
  }, [isOpen, initialEmail]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // Call API to check if user exists and send OTP
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSessionId(data.sessionId);
        setIsNewUser(data.isNewUser);
        setCurrentStep('otp');
        toast.success(`OTP sent to ${email}`);
      } else {
        toast.error(data.error || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length < 4) {
      toast.error('Please enter a valid OTP');
      return;
    }

    setIsLoading(true);
    try {
      // Call API to verify OTP
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          otp, 
          sessionId 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isNewUser) {
          // If new user, proceed to registration
          setCurrentStep('register');
        } else {
          // If existing user, log them in
          setCustomer(data.customer, data.accessToken);
          toast.success(`Welcome back, ${data.customer.firstName}!`);
          onClose();
          // Call onAuthSuccess callback if provided
          if (onAuthSuccess) {
            onAuthSuccess();
          }
        }
      } else {
        toast.error(data.error || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName) {
      toast.error('Please enter your name');
      return;
    }

    setIsLoading(true);
    try {
      // Call API to register new user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          firstName,
          lastName,
          phone,
          sessionId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCustomer(data.customer, data.accessToken);
        toast.success(`Welcome, ${data.customer.firstName}!`);
        onClose();
        // Call onAuthSuccess callback if provided
        if (onAuthSuccess) {
          onAuthSuccess();
        }
      } else {
        toast.error(data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
            autoFocus
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending OTP...
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );

  const renderOtpStep = () => (
    <form onSubmit={handleOtpSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="otp">Enter OTP sent to {email}</Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="otp"
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
            className="pl-10 text-center tracking-widest text-lg"
            required
            autoFocus
            maxLength={6}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={() => setCurrentStep('email')}
          disabled={isLoading}
        >
          Back
        </Button>
        
        <Button 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify'
          )}
        </Button>
      </div>
    </form>
  );

  const renderRegisterStep = () => (
    <form onSubmit={handleRegisterSubmit} className="space-y-4">
      <p className="text-sm text-gray-500">Complete your profile to continue</p>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone (Optional)</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={() => setCurrentStep('otp')}
          disabled={isLoading}
        >
          Back
        </Button>
        
        <Button 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Complete'
          )}
        </Button>
      </div>
    </form>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'email':
        return renderEmailStep();
      case 'otp':
        return renderOtpStep();
      case 'register':
        return renderRegisterStep();
      default:
        return renderEmailStep();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {currentStep === 'email' && 'Sign In / Register'}
            {currentStep === 'otp' && 'Verify OTP'}
            {currentStep === 'register' && 'Complete Registration'}
          </DialogTitle>
        </DialogHeader>

        {renderCurrentStep()}

        <div className="text-xs text-center text-gray-500 mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </DialogContent>
    </Dialog>
  );
}