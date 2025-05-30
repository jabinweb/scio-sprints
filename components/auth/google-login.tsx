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
      await signInWithGoogle();
      onSuccess?.();
      router.push('/dashboard');
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