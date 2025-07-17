import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: schools, error } = await supabase
      .from('schools')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(schools || []);
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json({ error: 'Failed to fetch schools' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const {
      name,
      email,
      phone,
      address,
      website,
      principalName,
      contactPerson,
      studentCount
    } = await request.json();
    
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Don't include ID - let the database generate it automatically
    const { data: newSchool, error } = await supabase
      .from('schools')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        website: website?.trim() || null,
        principal_name: principalName?.trim() || null,
        contact_person: contactPerson?.trim() || null,
        student_count: studentCount || 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', error);
      
      if (error.code === '23505') {
        return NextResponse.json({ 
          error: 'A school with this email already exists',
          details: error.message 
        }, { status: 409 });
      }
      
      if (error.code === '42501') {
        return NextResponse.json({ 
          error: 'Permission denied. Please check your admin permissions.',
          details: error.message 
        }, { status: 403 });
      }

      if (error.code === '23502') {
        return NextResponse.json({ 
          error: 'Database constraint violation. Please check required fields.',
          details: error.message 
        }, { status: 400 });
      }

      throw error;
    }

    return NextResponse.json({ success: true, school: newSchool });
  } catch (error) {
    console.error('Error creating school:', error);
    return NextResponse.json({ 
      error: 'Failed to create school', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const {
      id,
      name,
      email,
      phone,
      address,
      website,
      principalName,
      contactPerson,
      studentCount,
      isActive
    } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (website !== undefined) updateData.website = website;
    if (principalName !== undefined) updateData.principal_name = principalName;
    if (contactPerson !== undefined) updateData.contact_person = contactPerson;
    if (studentCount !== undefined) updateData.student_count = studentCount;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { error } = await supabase
      .from('schools')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating school:', error);
    return NextResponse.json({ error: 'Failed to update school' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('id');
    
    if (!schoolId) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('schools')
      .delete()
      .eq('id', schoolId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting school:', error);
    return NextResponse.json({ error: 'Failed to delete school' }, { status: 500 });
  }
}
