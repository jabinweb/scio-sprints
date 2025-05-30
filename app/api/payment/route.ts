import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    // Fetch payment settings from database
    const settingsDoc = await adminDb.collection('appSettings').doc('general').get();
    
    if (!settingsDoc.exists) {
      return NextResponse.json({ error: 'Payment configuration not found' }, { status: 500 });
    }

    const settings = settingsDoc.data();
    const paymentMode = settings?.paymentMode || 'test';
    
    // Use appropriate keys based on payment mode
    const keyId = paymentMode === 'test' ? settings?.razorpayTestKeyId : settings?.razorpayKeyId;
    const keySecret = paymentMode === 'test' ? settings?.razorpayTestKeySecret : settings?.razorpayKeySecret;

    if (!keyId || !keySecret) {
      return NextResponse.json({ 
        error: `Razorpay ${paymentMode} credentials not configured` 
      }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paisa
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId, // Send the appropriate key ID to frontend
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 });
  }
}
