import { NextResponse } from 'next/server';
import { sendDemoEmail } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Basic validation
    if (!data.email || !data.name || !data.school || !data.role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send welcome email with demo access
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
