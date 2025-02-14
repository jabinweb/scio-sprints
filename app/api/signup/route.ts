import { NextResponse } from 'next/server';
import { sendDemoEmail } from '@/lib/mail';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { UserRole, RequestStatus } from '@/types/enums';

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

    // Save to Firebase with proper data structure
    try {
      const docRef = await addDoc(collection(db, 'demoRequests'), {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        school: data.school.trim(),
        role: data.role as UserRole,
        createdAt: serverTimestamp(),
        status: RequestStatus.PENDING
      });
      console.log('Demo request saved with ID:', docRef.id);
    } catch (error) {
      console.error('Firestore save error:', error);
      throw error;
    }

    // Send email
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
