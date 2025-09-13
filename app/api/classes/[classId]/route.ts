import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Next.js 15: params is a Promise and must be awaited
export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { classId } = await params;

  try {
    const classData = await prisma.class.findUnique({
      where: {
        id: parseInt(classId)
      },
      include: {
        subjects: {
          include: {
            chapters: {
              include: {
                topics: {
                  include: {
                    content: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json(classData);
  } catch (error) {
    console.error('Error fetching class data:', error);
    return NextResponse.json({ error: 'Failed to fetch class data' }, { status: 500 });
  }
}
