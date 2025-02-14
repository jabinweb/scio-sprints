import { NextResponse } from 'next/server';
import { sendDemoEmail } from '@/lib/mail';
import { adminDb } from '@/lib/firebase-admin';
import { RequestStatus } from '@/types/enums';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Basic validation
    if (!data.email?.trim() || !data.name?.trim() || !data.school?.trim() || !data.role?.trim()) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Save to Firebase using Admin SDK
    try {
      const docRef = await adminDb.collection('demoRequests').add({
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        school: data.school.trim(),
        role: data.role,
        createdAt: new Date(),
        status: RequestStatus.PENDING
      });
      console.log('Demo request saved with ID:', docRef.id);
    } catch (error) {
      console.error('Firestore save error:', error);
      throw error;
    }

    await sendDemoEmail(data);
    
    return NextResponse.json({ 
      success: true,
      message: 'Check your email for demo access!'
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to process signup' },
      { status: 500 }
    );
  }
}
