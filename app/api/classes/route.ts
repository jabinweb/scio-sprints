import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      where: { isActive: true },
      include: {
        subjects: {
          orderBy: { orderIndex: 'asc' },
          include: {
            chapters: {
              orderBy: { orderIndex: 'asc' },
              include: {
                topics: {
                  orderBy: { orderIndex: 'asc' },
                  include: {
                    content: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}
