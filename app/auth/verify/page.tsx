'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyMagicLink() {
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'error'>('verifying');
  const router = useRouter();
  const { handleMagicLinkSignIn } = useAuth();

  useEffect(() => {
    const verifyLink = async () => {
      try {
        await handleMagicLinkSignIn();
        router.push('/admin/dashboard');
      } catch {
        setVerificationStatus('error');
      }
    };

    verifyLink();
  }, [handleMagicLinkSignIn, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {verificationStatus === 'error' ? (
          <p className="text-red-500">Invalid or expired link</p>
        ) : (
          <p>Verifying your login...</p>
        )}
      </div>
    </div>
  );
}
