import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = await req.json();

    // Fetch payment settings from database
    const settingsDoc = await adminDb.collection('appSettings').doc('general').get();
    
    if (!settingsDoc.exists) {
      return NextResponse.json({ error: 'Payment configuration not found' }, { status: 500 });
    }

    const settings = settingsDoc.data();
    const paymentMode = settings?.paymentMode || 'test';
    
    // Use appropriate secret based on payment mode
    const keySecret = paymentMode === 'test' ? settings?.razorpayTestKeySecret : settings?.razorpayKeySecret;

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
      // Store subscription in database
      await adminDb.collection('subscriptions').add({
        userId,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: settings?.subscriptionPrice || 896,
        status: 'active',
        paymentMode,
        createdAt: new Date(),
      });

      return NextResponse.json({ verified: true });
    } else {
      return NextResponse.json({ verified: false }, { status: 400 });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
