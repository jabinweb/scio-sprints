'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { useRouter } from 'next/navigation';

interface PaymentDialogProps {
  defaultOpen?: boolean;
  onClose?: () => void;
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

interface AppSettings {
  siteName: string;
  subscriptionPrice: number;
  paymentMode: 'test' | 'live';
  razorpayKeyId: string;
  razorpayTestKeyId: string;
}

export function PaymentDialog({ defaultOpen = false, onClose }: PaymentDialogProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const loadRazorpay = async () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setIsScriptLoaded(true);
      document.body.appendChild(script);
    };

    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    loadRazorpay();
    fetchSettings();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
    router.back(); // Go back to previous page
  };

  const handlePayment = async () => {
    if (!user || !settings) return;

    try {
      setIsLoading(true);

      const orderResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: settings.subscriptionPrice,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Payment creation failed');
      }

      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: settings.siteName,
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
                userId: user?.id,
              }),
            });

            if (verifyResponse.ok) {
              setPaymentSuccess(true);
              // Redirect after showing success for 2 seconds
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 2000);
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
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

  if (paymentSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center mb-4 text-green-600">Payment Successful!</DialogTitle>
          </DialogHeader>
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-muted-foreground">
                Welcome to {settings?.siteName}! Your subscription is now active.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Redirecting to dashboard...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        {settings?.paymentMode === 'test' && (
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
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 py-6 text-lg"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isLoading || !isScriptLoaded || !settings}
              className="flex-1 py-6 text-lg"
            >
              {isLoading ? (
                <LoadingSpinner className="mr-2" />
              ) : null}
              {!isScriptLoaded || !settings ? 'Loading...' : `Pay ₹${settings.subscriptionPrice}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
