'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { razorpayConfig } from '@/lib/razorpay-config';

interface PaymentDialogProps {
  defaultOpen?: boolean;
}

export function PaymentDialog({ defaultOpen = false }: PaymentDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    const loadRazorpay = async () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setIsScriptLoaded(true);
      document.body.appendChild(script);
    };
    loadRazorpay();
  }, []);

  const handlePayment = async () => {
    if (!isScriptLoaded) {
      console.error('Razorpay script not loaded');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: razorpayConfig.isTestMode ? 100 : 89600, // ₹1 for test mode
          currency: 'INR',
          userId: user?.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const { orderId } = await response.json();

      const options = {
        key: razorpayConfig.keyId,
        amount: razorpayConfig.isTestMode ? 100 : 89600,
        currency: "INR",
        name: "ScioLabs",
        description: razorpayConfig.isTestMode ? "Test Payment" : "Premium Dashboard Access",
        order_id: orderId,
        prefill: {
          email: user?.email || undefined,
        },
        modal: {
          escape: true,
          ondismiss: () => {
            setIsLoading(false);
          }
        },
        handler: function(response: any) {
          verifyPayment(response);
        },
        theme: {
          color: "#4B9DCE"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function(response: any) {
        console.error('Payment failed:', response.error);
        setIsLoading(false);
      });
      rzp.open();
    } catch (error) {
      console.error('Payment initialization failed:', error);
      setIsLoading(false);
    }
  };

  const verifyPayment = async (response: any) => {
    try {
      const verifyResponse = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...response,
          userId: user?.uid,
        }),
      });

      if (verifyResponse.ok) {
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
    }
  };

  return (
    <Dialog open={defaultOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        {razorpayConfig.isTestMode && (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-sm mb-4">
            Test Mode - Use card number 4111 1111 1111 1111
          </div>
        )}
        <DialogHeader>
          <DialogTitle className="text-2xl text-center mb-4">Complete Your Subscription</DialogTitle>
        </DialogHeader>
        <div className="text-center">
          <p className="text-muted-foreground mb-6">
            Welcome {user?.email}! To access the dashboard, please complete your subscription.
          </p>
          <Button
            onClick={handlePayment}
            disabled={isLoading || !isScriptLoaded}
            className="w-full py-6 text-lg"
          >
            {isLoading ? (
              <LoadingSpinner className="mr-2" />
            ) : null}
            {!isScriptLoaded ? 'Loading...' : 'Pay ₹896'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Add types for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}
