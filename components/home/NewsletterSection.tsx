'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    // Simulate subscription
    setIsSubscribed(true);
    toast.success('Successfully subscribed to our newsletter!');
    setEmail('');
    
    // Reset after 3 seconds
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
          <div className="mb-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-gray-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Stay in the Loop
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Subscribe to get special offers, free giveaways, and updates on new products delivered straight to your inbox.
            </p>
          </div>

          {!isSubscribed ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-full border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                />
                <Button 
                  type="submit" 
                  className="px-8 rounded-full bg-gray-900 hover:bg-gray-800"
                >
                  Subscribe
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                No spam, unsubscribe at any time.
              </p>
            </form>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-center gap-3 text-green-600 mb-4">
                <CheckCircle className="h-6 w-6" />
                <span className="font-semibold">Successfully subscribed!</span>
              </div>
              <p className="text-gray-600">
                Thank you for joining our newsletter. You'll receive updates soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}