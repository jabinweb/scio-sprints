import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = await req.json();

    // Fetch payment settings from database
    const { data: settings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('key, value')
      .in('key', ['paymentMode', 'razorpayTestKeySecret', 'razorpayKeySecret', 'subscriptionPrice']);

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      return NextResponse.json({ error: 'Payment configuration not found' }, { status: 500 });
    }

    // Convert array to object
    const settingsObj = settings.reduce((acc: Record<string, string>, setting: { key: string; value: string }) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    const paymentMode = settingsObj.paymentMode || 'test';
    
    // Use appropriate secret based on payment mode
    const keySecret = paymentMode === 'test' ? settingsObj.razorpayTestKeySecret : settingsObj.razorpayKeySecret;

    if (!keySecret) {
      return NextResponse.json({ 
        error: `Razorpay ${paymentMode} secret not configured` 
      }, { status: 500 });
    }

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Store subscription in database with generated ID
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          id: crypto.randomUUID(), // Generate UUID for new subscription
          userId,
          status: 'ACTIVE',
          planType: 'premium',
          amount: parseInt(settingsObj.subscriptionPrice) || 29900, // Amount in paisa
          currency: 'INR',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
      }

      // Store payment record with generated ID
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          id: crypto.randomUUID(), // Generate UUID for new payment
          userId,
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          amount: parseInt(settingsObj.subscriptionPrice) || 29900,
          currency: 'INR',
          status: 'COMPLETED',
          description: 'Premium Subscription',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (paymentError) {
        console.error('Error creating payment record:', paymentError);
        // Don't return error as subscription is already created
      }

      return NextResponse.json({ verified: true });
    } else {
      return NextResponse.json({ verified: false }, { status: 400 });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
