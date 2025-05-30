import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const signupsRef = adminDb.collection('signups');
    const snapshot = await signupsRef.orderBy('timestamp', 'desc').get();
    
    const signups = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json(signups);
  } catch (error) {
    console.error('Error fetching signups:', error);
    return NextResponse.json({ error: 'Failed to fetch signups' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const signupId = searchParams.get('id');
    
    if (!signupId) {
      return NextResponse.json({ error: 'Signup ID is required' }, { status: 400 });
    }

    await adminDb.collection('signups').doc(signupId).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting signup:', error);
    return NextResponse.json({ error: 'Failed to delete signup' }, { status: 500 });
  }
}
