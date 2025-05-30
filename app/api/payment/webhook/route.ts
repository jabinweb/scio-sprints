import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('x-razorpay-signature');

    // Fetch payment settings from database
    const settingsDoc = await adminDb.collection('appSettings').doc('general').get();
    
    if (!settingsDoc.exists) {
      console.error('Payment configuration not found for webhook');
      return NextResponse.json({ error: 'Payment configuration not found' }, { status: 500 });
    }

    const settings = settingsDoc.data();
    const paymentMode = settings?.paymentMode || 'test';
    
    // Use appropriate secret based on payment mode
    const webhookSecret = paymentMode === 'test' ? settings?.razorpayTestKeySecret : settings?.razorpayKeySecret;

    if (!webhookSecret) {
      console.error(`Razorpay ${paymentMode} secret not configured for webhook`);
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(body);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === signature) {
      const payment = JSON.parse(body);
      
      // Store payment info in Firestore using admin SDK
      await adminDb.collection('subscriptions').doc(payment.payload.payment.entity.id).set({
        userId: payment.payload.payment.entity.notes.userId,
        status: 'active',
        amount: payment.payload.payment.entity.amount / 100,
        createdAt: new Date(),
        paymentId: payment.payload.payment.entity.id,
        paymentMode,
        source: 'webhook',
      });

      return NextResponse.json({ status: 'ok' });
    }

    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
