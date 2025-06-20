import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a service role client that bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: Request) {
  try {
    const { userId, email, displayName, photoURL } = await request.json();

    console.log('Creating user with data:', { userId, email, displayName, photoURL });

    if (!userId || !email) {
      return NextResponse.json({ error: 'User ID and email are required' }, { status: 400 });
    }

    // Check if service role key is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
      return NextResponse.json({ error: 'Service configuration error' }, { status: 500 });
    }

    // Use service role client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        email: email,
        displayName: displayName || email.split('@')[0],
        photoURL: photoURL || null,
        role: 'USER',
        lastLoginAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating user:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json({ 
        error: 'Failed to create user',
        details: error 
      }, { status: 500 });
    }

    console.log('User created successfully:', data);
    return NextResponse.json({ success: true, user: data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
