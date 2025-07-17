'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { supabase } from '@/lib/supabase';
import { LoginDialog } from '@/components/auth/login-dialog';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function ClassLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    if (!loading && user && classId) {
      const checkSubscription = async () => {
        try {
          // Check for active subscription with valid end date
          const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('userId', user.id)
            .eq('classId', parseInt(classId))
            .eq('status', 'ACTIVE')
            .gte('endDate', new Date().toISOString())
            .maybeSingle();

          if (error) {
            console.error('Error checking subscription:', error);
            setHasSubscription(false);
          } else {
            const hasActiveSubscription = !!subscription;
            setHasSubscription(hasActiveSubscription);
            
            // If no subscription, redirect back to dashboard
            if (!hasActiveSubscription) {
              setTimeout(() => {
                router.push('/dashboard');
              }, 100);
            }
          }
        } catch (error) {
          console.error('Unexpected error checking subscription:', error);
          setHasSubscription(false);
          router.push('/dashboard');
        } finally {
          setCheckingSubscription(false);
        }
      };

      checkSubscription();
    } else if (!loading) {
      setCheckingSubscription(false);
    }
  }, [user, loading, classId, router]);

  if (loading || checkingSubscription) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginDialog defaultOpen onClose={() => {}} />;
  }

  // If no subscription, show loading while redirecting
  if (!hasSubscription) {
    return <LoadingScreen />;
  }

  return (
    <>
      <div className="container p-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => router.push('/dashboard')}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      {children}
    </>
  );
}




