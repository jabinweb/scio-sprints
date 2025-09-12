'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LoadingScreen } from '@/components/ui/loading-screen';
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
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login page with class redirect
      router.push(`/auth/login?redirect=/dashboard/class/${classId}`);
      return;
    }

    if (!loading && user && classId) {
      const checkAccess = async () => {
        try {
          // Use the same access API as the main class page
          const response = await fetch(`/api/classes/${classId}/access?userId=${user.id}`);
          const data = await response.json();

          if (response.ok) {
            const hasAnyAccess = data.hasFullAccess || data.subjectAccess.some((s: { hasAccess: boolean }) => s.hasAccess);
            setHasAccess(hasAnyAccess);
            
            // Only redirect if user has absolutely no access
            if (!hasAnyAccess) {
              console.log('No access to class, redirecting to dashboard');
              setTimeout(() => {
                router.push('/dashboard');
              }, 100);
            }
          } else {
            console.error('Error checking access:', data.error);
            setHasAccess(false);
            // Don't auto-redirect on API errors, let the main page handle it
          }
        } catch (error) {
          console.error('Unexpected error checking access:', error);
          setHasAccess(false);
          // Don't auto-redirect on network errors, let the main page handle it
        } finally {
          setCheckingAccess(false);
        }
      };

      checkAccess();
    } else if (!loading && !user) {
      // Reset states when user logs out
      setCheckingAccess(false);
      setHasAccess(false);
    } else if (!loading) {
      setCheckingAccess(false);
    }
  }, [user, loading, classId, router]);

  if (loading || checkingAccess) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoadingScreen />; // Show loading while redirecting to login
  }

  // If no access, show loading while redirecting
  if (!hasAccess) {
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




