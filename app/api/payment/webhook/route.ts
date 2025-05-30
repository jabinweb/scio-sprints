import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('x-razorpay-signature');

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
    hmac.update(body);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === signature) {
      const payment = JSON.parse(body);
      
      // Store payment info in Firestore
      await setDoc(doc(db, 'subscriptions', payment.payload.payment.entity.id), {
        userId: payment.payload.payment.entity.notes.userId,
        status: 'active',
        amount: payment.payload.payment.entity.amount / 100,
        createdAt: serverTimestamp(),
        paymentId: payment.payload.payment.entity.id,
      });

      return NextResponse.json({ status: 'ok' });
    }

    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
