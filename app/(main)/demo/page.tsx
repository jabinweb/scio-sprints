'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginDialog } from '@/components/auth/login-dialog';
import { LoadingScreen } from '@/components/ui/loading-screen';

export default function Demo() {
  const { user, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // Show login dialog if user is not authenticated
  if (!user) {
    return <LoginDialog defaultOpen />;
  }

  return (
    <div className="min-h-screen py-32 bg-black">
      <div className="container mx-auto px-4">
        {/* CTA Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent">
            Ready to Transform Your Teaching?
          </h1>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Get unlimited access to our premium features and start creating engaging learning experiences today.
          </p>
        </div>

        {/* Demo iframe */}
        <div className="w-full h-[calc(100vh-20rem)]">
          <iframe 
            src="https://sciolabs.notion.site/ebd/18a6a57183ea800c95cbc5659d5f065e" 
            width="100%" 
            height="100%" 
            className="rounded-lg shadow-lg"
            style={{ border: 'none' }}
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}