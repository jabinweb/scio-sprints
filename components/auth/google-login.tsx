"use client";

import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { useState } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface GoogleLoginProps {
  onSuccess?: () => void;
}

export function GoogleLogin({ onSuccess }: GoogleLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const user = await signInWithGoogle();
      
      // Check if user has subscription
      const response = await fetch('/api/user/subscription-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });
      
      const { hasActiveSubscription } = await response.json();
      
      onSuccess?.();
      
      // Redirect based on subscription status
      if (hasActiveSubscription) {
        router.push('/dashboard');
      } else {
        router.push('/demo');
      }
    } catch (error) {
      console.error('Google Sign-in Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-12 px-6 relative flex items-center justify-center gap-2 font-medium"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      <div className="relative w-5 h-5">
        <Image 
          src="/google.svg" 
          alt="Google"
          width={20}
          height={20}
          className="object-contain"
          priority
        />
      </div>
      <span className="text-sm">
        {isLoading ? "Connecting..." : "Continue with Google"}
      </span>
    </Button>
  );
}