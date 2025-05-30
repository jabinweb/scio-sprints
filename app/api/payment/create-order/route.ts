import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { razorpayConfig } from '@/lib/razorpay-config';


export async function POST(req: Request) {
  try {
    const { amount, currency, userId } = await req.json();

     const razorpay = new Razorpay({
      key_id: razorpayConfig.keyId!,
      key_secret: razorpayConfig.keySecret!,
    });

    const order = await razorpay.orders.create({
      amount,
      currency,
      notes: {
        userId,
      },
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error('Order creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
