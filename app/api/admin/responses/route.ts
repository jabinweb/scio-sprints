import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Since there's no form responses table in your schema, let's return user activities as responses
    const { data: responses, error } = await supabase
      .from('user_activities')
      .select(`
        *,
        user:users(email, display_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(responses || []);
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return NextResponse.json({ error: 'Failed to fetch user activities' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const responseId = searchParams.get('id');
    
    if (!responseId) {
      return NextResponse.json({ error: 'Response ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_activities')
      .delete()
      .eq('id', responseId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user activity:', error);
    return NextResponse.json({ error: 'Failed to delete user activity' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { responseId, metadata } = await request.json();
    
    if (!responseId) {
      return NextResponse.json({ error: 'Response ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_activities')
      .update({ 
        metadata: metadata || {},
      })
      .eq('id', responseId);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user activity:', error);
    return NextResponse.json({ error: 'Failed to update user activity' }, { status: 500 });
  }
}

