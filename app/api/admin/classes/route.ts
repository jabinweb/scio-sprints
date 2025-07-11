import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: classes, error } = await supabase
      .from('classes')
      .select(`
        *,
        subjects:subjects(id, name),
        subscriptions:subscriptions!classId(
          id,
          status,
          user:users(email, display_name)
        )
      `)
      .order('id', { ascending: true });

    if (error) throw error;

    // Transform the data to ensure price is properly formatted
    const transformedClasses = (classes || []).map(cls => ({
      ...cls,
      price: cls.price || 29900, // Ensure price is set (in paisa)
    }));

    return NextResponse.json(transformedClasses);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, isActive, price } = await request.json();
    
    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }

    const { data: newClass, error } = await supabase
      .from('classes')
      .insert({
        name,
        description,
        isActive: isActive !== undefined ? isActive : true,
        price: price ? parseInt(price) * 100 : 29900, // Convert to paisa
        currency: 'INR',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, class: newClass });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, description, isActive, price } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    // Use a specific type for updateData instead of any
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (price !== undefined) updateData.price = parseInt(price) * 100; // Convert to paisa

    const { error } = await supabase
      .from('classes')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
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
