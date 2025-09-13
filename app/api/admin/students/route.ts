import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');

    const students = await prisma.user.findMany({
      where: {
        role: 'USER',
        ...(schoolId && { schoolId })
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json(students || []);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('id');
    
    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // Note: With NextAuth, user deletion only affects database records
    // NextAuth doesn't manage user accounts like Supabase Auth
    await prisma.user.delete({
      where: { id: studentId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
