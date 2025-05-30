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
import { useAuth } from '@/contexts/AuthContext';
import { GoogleLogin } from './google-login';
import { useRouter } from 'next/navigation';

interface LoginDialogProps {
  defaultOpen?: boolean;
  onClose?: () => void;
}

export function LoginDialog({ defaultOpen = false, onClose }: LoginDialogProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { user } = useAuth();
  const router = useRouter();

  // When the user is already logged in, don't show dialog and redirect
  useEffect(() => {
    if (user && defaultOpen) {
      setOpen(false);
      router.push('/dashboard');
    }
  }, [user, defaultOpen, router]);

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
    if (user) {
      router.push('/dashboard');
    } else {
      setOpen(true);
    }
  };

  const handleGoBack = () => {
    setOpen(false);
    router.push('/');
  };

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open && !user} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="rounded-full"
          onClick={handleButtonClick}
        >
          {user ? 'Dashboard' : 'Sign In'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl text-center">
            Welcome Back! 👋
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign in to continue
          </DialogDescription>
        </DialogHeader>
          <Button onClick={handleGoBack}>Go Back</Button>
          <GoogleLogin onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}