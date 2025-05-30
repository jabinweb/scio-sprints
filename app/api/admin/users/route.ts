import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

interface SubscriptionData {
  userId: string;
  status: string;
  amount?: number;
  paymentId?: string;
  createdAt?: Date | FirebaseFirestore.Timestamp;
}

export async function GET() {
  try {
    // Get all users from Firebase Auth
    const listUsersResult = await adminAuth.listUsers();
    const users = listUsersResult.users;

    // Get subscriptions to match with users
    const subscriptionsSnapshot = await adminDb.collection('subscriptions').get();
    const subscriptions = subscriptionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as (SubscriptionData & { id: string })[];

    // Combine user data with subscription status
    const usersWithSubscriptions = users.map(user => {
      const userSubscription = subscriptions.find(sub => sub.userId === user.uid);
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
        subscription: userSubscription || null,
        hasActiveSubscription: userSubscription?.status === 'active',
      };
    });

    return NextResponse.json(usersWithSubscriptions);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Delete user from Firebase Auth
    await adminAuth.deleteUser(userId);

    // Also delete their subscriptions
    const subscriptionsSnapshot = await adminDb
      .collection('subscriptions')
      .where('userId', '==', userId)
      .get();
    
    const batch = adminDb.batch();
    subscriptionsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
