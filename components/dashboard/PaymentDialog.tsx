'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';

interface PaymentDialogProps {
  defaultOpen?: boolean;
  onClose?: () => void;
  classId?: number;
  className?: string;
  price?: number;
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

export function PaymentDialog({ defaultOpen = false, onClose, classId, className, price }: PaymentDialogProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Reset state when defaultOpen changes
  useEffect(() => {
    setIsOpen(defaultOpen);
    setPaymentSuccess(false); // Reset success state when dialog reopens
  }, [defaultOpen]);

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
    setPaymentSuccess(false); // Reset success state on close
    onClose?.();
  };

  const handlePayment = async () => {
    if (!user || !settings) return;

    try {
      setIsLoading(true);

      const paymentEndpoint = classId ? '/api/payment/class' : '/api/payment';
      const paymentData = classId 
        ? { classId, userId: user.id }
        : { amount: price };

      const orderResponse = await fetch(paymentEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
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
        description: classId ? `${className} Subscription` : 'Premium Subscription',
        order_id: orderData.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyEndpoint = classId ? '/api/payment/class/verify' : '/api/payment/verify';
            const verifyData = classId 
              ? { ...response, userId: user.id, classId }
              : { ...response, userId: user.id };

            const verifyResponse = await fetch(verifyEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(verifyData),
            });

            if (verifyResponse.ok) {
              setPaymentSuccess(true);
              setTimeout(() => {
                if (classId) {
                  router.push(`/dashboard/class/${classId}`);
                } else {
                  router.push('/dashboard');
                }
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
          color: '#3B82F6',
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
                {classId 
                  ? `Welcome to ${className}! Your subscription is now active.`
                  : `Welcome to ${settings?.siteName}! Your subscription is now active.`
                }
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Redirecting...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const displayPrice = price ? Math.round(price / 100) : (settings?.subscriptionPrice || 299);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
        {settings?.paymentMode === 'test' && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-800 px-6 py-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              Test Mode - Use card number 4111 1111 1111 1111
            </div>
          </div>
        )}
        
        <div className="p-6">
          <DialogHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold">
              {classId ? `Subscribe to ${className}` : 'Complete Your Subscription'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center mt-6 space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-1">₹{displayPrice}</div>
              <div className="text-sm text-blue-600 font-medium">One-time payment</div>
            </div>
            
            <p className="text-gray-600 leading-relaxed">
              {classId 
                ? `Get unlimited access to ${className} with all subjects, chapters, and interactive content.`
                : `Welcome ${user?.email}! Complete your subscription to access all features.`
              }
            </p>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 py-3 text-base hover:bg-gray-50"
              >
                Maybe Later
              </Button>
              <Button
                onClick={handlePayment}
                disabled={isLoading || !isScriptLoaded || !settings}
                className="flex-1 py-3 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isLoading ? (
                  <LoadingSpinner className="mr-2" />
                ) : null}
                {!isScriptLoaded || !settings ? 'Loading...' : `Pay ₹${displayPrice}`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
