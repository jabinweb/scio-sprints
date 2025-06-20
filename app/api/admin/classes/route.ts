import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: classes, error } = await supabase
      .from('classes')
      .select(`
        *,
        subjects:subjects(
          *,
          chapters:chapters(
            *,
            topics:topics(
              *,
              content:topic_contents(*)
            )
          )
        )
      `)
      .order('id', { ascending: true });

    if (error) throw error;

    return NextResponse.json(classes || []);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, isActive } = await request.json();
    
    const { data: newClass, error } = await supabase
      .from('classes')
      .insert({
        name,
        description,
        isActive: isActive ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(newClass);
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, description, isActive } = await request.json();
    
    // Validate required fields
    if (!id || !name || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure id is a number
    const classId = parseInt(id);
    if (isNaN(classId)) {
      return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 });
    }
    
    const { data: updatedClass, error } = await supabase
      .from('classes')
      .update({
        name,
        description,
        isActive: isActive ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', classId)
      .select()
      .single();

    if (error) {
      console.error('Database error updating class:', error);
      throw error;
    }

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json({ error: 'Failed to update class' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('id');
    
    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', parseInt(classId));

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 });
  }
}
