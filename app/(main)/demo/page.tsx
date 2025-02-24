'use client';

import React, { useEffect } from 'react';

export default function Demo() {
  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.setAttribute('data-payment_button_id', 'pl_Pzb2IDgEW1PeZ1');
    script.async = true;
    
    // Find the payment button container and append the script
    const form = document.getElementById('razorpay-form');
    if (form) {
      form.appendChild(script);
    }

    // Cleanup
    return () => {
      if (form && script) {
        form?.removeChild(script);
      }
    };
  }, []);

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
          <form id="razorpay-form" className="flex justify-center"></form>
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