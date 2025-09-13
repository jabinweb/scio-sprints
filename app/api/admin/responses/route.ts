import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Since there's no form responses table in your schema, let's return user activities as responses
    const responses = await prisma.userActivity.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(responses);
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

    await prisma.userActivity.delete({
      where: { id: responseId }
    });

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

    await prisma.userActivity.update({
      where: { id: responseId },
      data: { 
        metadata: metadata || {},
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user activity:', error);
    return NextResponse.json({ error: 'Failed to update user activity' }, { status: 500 });
  }
}

