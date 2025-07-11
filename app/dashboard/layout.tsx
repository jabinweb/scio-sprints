'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { LoginDialog } from '@/components/auth/login-dialog';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginDialog defaultOpen onClose={() => {}} />;
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
