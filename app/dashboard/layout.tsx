'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { supabase } from '@/lib/supabase';
import { LoginDialog } from '@/components/auth/login-dialog';
import { PaymentDialog } from '@/components/dashboard/PaymentDialog';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const checkSubscription = async () => {
        try {
          const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('userId', user.id)
            .eq('status', 'ACTIVE')
            .gte('endDate', new Date().toISOString())
            .maybeSingle();

          if (error) {
            console.error('Detailed error checking subscription:', {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint
            });
            setHasSubscription(false);
          } else {
            setHasSubscription(!!subscription);
          }
        } catch (error) {
          console.error('Unexpected error checking subscription:', error);
          setHasSubscription(false);
        } finally {
          setCheckingSubscription(false);
        }
      };

      checkSubscription();
    } else if (!loading) {
      setCheckingSubscription(false);
    }
  }, [user, loading]);

  if (loading || checkingSubscription) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginDialog defaultOpen onClose={() => {}} />;
  }

  if (!hasSubscription) {
    return <PaymentDialog defaultOpen />;
  }

  return (
    <>
      <div className="container p-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => router.push('/')}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>
      {children}
    </>
  );
}
