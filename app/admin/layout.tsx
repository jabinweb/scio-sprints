'use client';

import { useSession } from 'next-auth/react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const user = session?.user;
  const loading = status === 'loading';
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Redirect to login page with admin redirect
      router.push('/auth/login?redirect=/admin');
    }
  }, [status, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoadingScreen />; // Show loading while redirecting
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
 