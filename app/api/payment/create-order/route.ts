import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const { amount, currency, userId } = await request.json();

    // Fetch Razorpay keys from environment variables and validate
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.error('Missing Razorpay key_id or key_secret in environment variables');
      return NextResponse.json(
        { error: 'Payment gateway not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `order_${Date.now()}`,
    });

    // Create payment record in Supabase
    const { error } = await supabase
      .from('payments')
      .insert({
        userId: userId,
        razorpayOrderId: order.id,
        amount: amount,
        currency: currency,
        status: 'PENDING',
        description: 'Premium Learning Subscription',
      });

    if (error) {
      console.error('Error creating payment record:', error);
      return NextResponse.json(
        { error: 'Payment record creation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error('Payment order creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
