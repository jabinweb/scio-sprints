import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check for active subscription
    const subscriptionsSnapshot = await adminDb
      .collection('subscriptions')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    const hasActiveSubscription = !subscriptionsSnapshot.empty;

    return NextResponse.json({ hasActiveSubscription });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return NextResponse.json({ error: 'Failed to check subscription status' }, { status: 500 });
  }
}
