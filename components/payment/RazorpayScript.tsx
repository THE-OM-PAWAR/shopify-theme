'use client';

import { useEffect } from 'react';

interface RazorpayScriptProps {
  onLoad?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayScript({ onLoad }: RazorpayScriptProps) {
  useEffect(() => {
    // Check if Razorpay script is already loaded
    if (window.Razorpay) {
      if (onLoad) onLoad();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      if (onLoad) onLoad();
    };

    // Append script to document
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      // Only remove the script if it's not needed elsewhere
      // In most cases, we want to keep it loaded for the entire session
    };
  }, [onLoad]);

  return null;
}
