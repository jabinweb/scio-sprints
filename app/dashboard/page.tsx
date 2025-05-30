'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, 'subscriptions'),
          where('userId', '==', user.uid),
          where('status', '==', 'active')
        );

        const snapshot = await getDocs(q);
        setHasSubscription(!snapshot.empty);
      } catch (error) {
        console.error('Error checking subscription:', error);
        setHasSubscription(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!hasSubscription) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Subscription Required</h1>
        <p className="text-muted-foreground">Please complete your subscription to access the dashboard.</p>
      </div>
    </div>;
  }

  return <DashboardContent />;
}
