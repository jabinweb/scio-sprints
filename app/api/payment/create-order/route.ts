import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { amount, currency, userId } = await request.json();

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
