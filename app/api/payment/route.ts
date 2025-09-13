import { NextResponse } from 'next/server';
import { createRazorpayInstance, validateRazorpayConfig } from '@/lib/razorpay-global';

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    // Validate Razorpay configuration
    const validation = await validateRazorpayConfig();
    if (!validation.valid) {
      console.error('Razorpay configuration error:', validation.error);
      return NextResponse.json({ error: validation.error }, { status: 500 });
    }

    // Create Razorpay instance with global configuration
    const razorpay = await createRazorpayInstance();
    if (!razorpay) {
      return NextResponse.json({ 
        error: 'Failed to initialize Razorpay instance' 
      }, { status: 500 });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paisa
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    });

    // Get the configuration to return the key ID
    const config = await import('@/lib/razorpay-global').then(m => m.getRazorpayConfig());
    
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: config.keyId, // Send the appropriate key ID to frontend
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 });
  }
}
