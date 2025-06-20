import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    
    let query = supabase.from('subjects').select('*');
    
    if (classId) {
      query = query.eq('classId', parseInt(classId));
    }
    
    const { data: subjects, error } = await query.order('orderIndex', { ascending: true });

    if (error) throw error;

    return NextResponse.json(subjects || []);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, icon, color, isLocked, orderIndex, classId } = await request.json();
    
    const { data: newSubject, error } = await supabase
      .from('subjects')
      .insert({
        name,
        icon,
        color,
        isLocked: isLocked ?? false,
        orderIndex,
        classId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(newSubject);
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, icon, color, isLocked, orderIndex } = await request.json();
    
    const { data: updatedSubject, error } = await supabase
      .from('subjects')
      .update({
        name,
        icon,
        color,
        isLocked,
        orderIndex,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(updatedSubject);
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('id');
    
    if (!subjectId) {
      return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subjectId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}
