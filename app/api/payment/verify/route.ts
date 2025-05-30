import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { razorpay_payment_id, razorpay_order_id, userId } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Create the document using admin SDK
    await adminDb
      .collection('subscriptions')
      .doc(razorpay_payment_id)
      .set({
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        userId: userId,
        status: 'active',
        amount: 896,
        createdAt: new Date(),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ 
      error: 'Verification failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
}
