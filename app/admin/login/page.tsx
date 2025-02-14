'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { FirebaseError } from 'firebase/app';
import { Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signInWithGoogle, sendMagicLink, user, loading, userRole } = useAuth();

  useEffect(() => {
    // Only redirect if we have both user and role information
    if (!loading && user && userRole) {
      router.replace('/admin/dashboard');
    }
  }, [user, loading, userRole, router]);

  // Show loading only during initial auth check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  // Don't render if already authenticated
  if (user && userRole) return null;

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push('/admin/dashboard');
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error('Google Sign-in Error:', error.code, error.message);
        setError(error.message);
      } else {
        console.error('Unexpected error:', error);
        setError('Failed to sign in with Google');
      }
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMagicLink(email);
      setIsMagicLinkSent(true);
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error('Magic Link Error:', error.code, error.message);
        setError(error.message);
      } else {
        console.error('Unexpected error:', error);
        setError('Failed to send magic link');
      }
    }
  };

  return (
    <div className="h-[calc(100vh-130px)] flex items-center justify-center">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
        
        <Button 
          onClick={handleGoogleSignIn}
          className="w-full mb-4 bg-white text-gray-800 border hover:bg-gray-50"
        >
          <div className="relative w-5 h-5 mr-2">
            <Image 
              src="/google.svg" 
              alt="Google"
              fill
              className="object-contain"
              priority
            />
          </div>
          Sign in with Google
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          {isMagicLinkSent ? (
            <p className="text-green-600 text-sm text-center">
              Check your email for the magic link!
            </p>
          ) : (
            <Button type="submit" className="w-full">
              Send Magic Link
            </Button>
          )}
        </form>
      </Card>
    </div>
  );
}
