import { NextResponse } from 'next/server';
import { sendDemoEmail } from '@/lib/mail';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { name, email, school, role } = await req.json();

    // Basic validation
    if (!email?.trim() || !name?.trim() || !school?.trim() || !role?.trim()) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Store in Firestore using admin SDK
    await adminDb.collection('formResponses').add({
      name,
      email,
      school,
      role,
      timestamp: new Date(),
    });

    // Send email (currently disabled)
    await sendDemoEmail({ name, email, school, role });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
