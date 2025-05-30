'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { LoginDialog } from './login-dialog';

interface AuthProtectedRouteProps {
  children: React.ReactNode;
}

export function AuthProtectedRoute({ children }: AuthProtectedRouteProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Routes that require authentication
  const protectedRoutes = ['/demo'];
  
  // Check if current route needs protection
  const requiresAuth = protectedRoutes.some(route => pathname.startsWith(route));

  // If route doesn't require auth, render normally
  if (!requiresAuth) {
    return <>{children}</>;
  }

  // If loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If route requires auth but user not logged in, show login
  if (!user) {
    return <LoginDialog defaultOpen />;
  }

  // User is authenticated, render children
  return <>{children}</>;
}
