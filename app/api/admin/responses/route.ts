import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const responsesRef = adminDb.collection('formResponses');
    const snapshot = await responsesRef.orderBy('timestamp', 'desc').get();
    
    const responses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json(responses);
  } catch (error) {
    console.error('Error fetching form responses:', error);
    return NextResponse.json({ error: 'Failed to fetch form responses' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const responseId = searchParams.get('id');
    
    if (!responseId) {
      return NextResponse.json({ error: 'Response ID is required' }, { status: 400 });
    }

    await adminDb.collection('formResponses').doc(responseId).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting form response:', error);
    return NextResponse.json({ error: 'Failed to delete form response' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { responseId, status } = await request.json();
    
    if (!responseId || !status) {
      return NextResponse.json({ error: 'Response ID and status are required' }, { status: 400 });
    }

    await adminDb.collection('formResponses').doc(responseId).update({ 
      status,
      updatedAt: new Date()
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating response status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
