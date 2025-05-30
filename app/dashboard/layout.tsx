'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
          // Query subscriptions by userId instead of paymentId
          const subscriptionsRef = collection(db, 'subscriptions');
          const q = query(
            subscriptionsRef,
            where('userId', '==', user.uid),
            where('status', '==', 'active'),
            limit(1)
          );

          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            console.log('Found subscription:', querySnapshot.docs[0].data());
            setHasSubscription(true);
          } else {
            console.log('No active subscription found for user:', user.uid);
            setHasSubscription(false);
          }
        } catch (error) {
          console.error('Error checking subscription:', error);
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
    return <LoginDialog defaultOpen />;
  }

  if (!hasSubscription) {
    return <PaymentDialog defaultOpen />;
  }

  return (
    <>
      <div className="container">
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
