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

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
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
    if (!user) return;

    try {
      setIsLoading(true);

      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 89600,
          currency: 'INR',
          userId: user.uid,
        }),
      });

      const orderData = await orderResponse.json() as { orderId: string };

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: 89600,
        currency: 'INR',
        name: 'ScioLabs',
        description: 'Premium Subscription',
        order_id: orderData.orderId,
        handler: async (response: RazorpayResponse) => {
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
        },
        prefill: {
          name: user.displayName || '',
          email: user.email || '',
        },
        theme: {
          color: '#4B9DCE',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsLoading(false);
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
