"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface LoginDialogProps {
  defaultOpen?: boolean;
  onClose?: () => void;
}

export function LoginDialog({ defaultOpen = false, onClose }: LoginDialogProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  // When the user is already logged in, don't show dialog and redirect
  useEffect(() => {
    if (session?.user && defaultOpen) {
      setOpen(false);
      router.push('/dashboard');
    }
  }, [session, defaultOpen, router]);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && onClose) {
      onClose();
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent dialog from opening
    if (session?.user) {
      router.push('/dashboard');
    } else {
      setOpen(true);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signIn('google');
    } catch {
      setError('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('Email/password authentication not configured. Please use Google Sign In.');
  };

  return (
    <Dialog open={open && !session?.user} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="rounded-full"
          onClick={handleButtonClick}
        >
          {session?.user ? 'Dashboard' : 'Sign In'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl text-center">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white text-gray-800 border hover:bg-gray-50"
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
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              'Continue with Google'
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-blue-600 hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}