import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        displayName: true,
        grade: true,
        section: true,
        rollNumber: true,
        phone: true,
        parentName: true,
        parentEmail: true,
        created_at: true,
        school: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...userProfile,
      joinDate: userProfile.created_at
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    const {
      name,
      displayName,
      grade,
      section,
      rollNumber,
      phone,
      parentName,
      parentEmail
    } = updates;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        displayName,
        grade,
        section,
        rollNumber,
        phone,
        parentName,
        parentEmail,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        displayName: true,
        grade: true,
        section: true,
        rollNumber: true,
        phone: true,
        parentName: true,
        parentEmail: true,
        created_at: true,
        school: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      ...updatedUser,
      joinDate: updatedUser.created_at
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}