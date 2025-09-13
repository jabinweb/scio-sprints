import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

interface ClassResponse {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  price: number | null;
}

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if user has an active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        endDate: {
          gte: new Date()
        }
      },
      orderBy: {
        endDate: 'desc'
      }
    });

    let accessibleClasses: ClassResponse[] = [];
    let accessType = 'none';
    let message = '';

    if (subscription) {
      // User has active subscription - get all classes
      accessibleClasses = await prisma.class.findMany({
        where: {
          isActive: true
        },
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          price: true
        },
        orderBy: {
          name: 'asc'
        }
      });
      
      accessType = 'full';
      message = 'You have access to all classes with your active subscription.';
    } else {
      // Check for demo access or free trial
      // For now, provide limited demo access to first class
      const demoClass = await prisma.class.findFirst({
        where: {
          isActive: true
        },
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          price: true
        },
        orderBy: {
          name: 'asc'
        }
      });

      if (demoClass) {
        accessibleClasses = [demoClass];
        accessType = 'demo';
        message = 'You have demo access. Subscribe to unlock all classes and features.';
      } else {
        accessType = 'none';
        message = 'No classes available. Please contact support.';
      }
    }

    return NextResponse.json({
      accessibleClasses,
      accessType,
      message,
      hasActiveSubscription: !!subscription
    });

  } catch (error) {
    console.error('Error fetching accessible classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accessible classes' },
      { status: 500 }
    );
  }
}