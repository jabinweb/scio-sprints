import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { checkUserAccess } from '@/lib/subscription-utils';
import { logDashboardAccess } from '@/lib/activity-logger';

interface UserProfileWithSchool {
  id: string;
  grade?: string | null;
  school?: {
    name: string;
    isActive: boolean;
  } | null;
}

interface ClassWithAccess {
  id: number;
  name: string;
  description: string;
  price?: number | null;
  schoolAccess: boolean;
  subscriptionAccess: boolean;
  hasPartialAccess: boolean;
  accessType: string;
  subjects: Array<{
    id: string;
    name: string;
    hasAccess: boolean;
    accessType: string;
  }>;
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user profile with school info
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        school: {
          select: {
            name: true,
            isActive: true
          }
        }
      }
    });

    // Get all classes with their subjects and chapters (excluding content for security)
    const classes = await prisma.class.findMany({
      where: { isActive: true },
      include: {
        subjects: {
          include: {
            chapters: {
              include: {
                topics: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                    duration: true,
                    description: true,
                    orderIndex: true
                    // Explicitly excluding content for security
                  },
                  orderBy: { orderIndex: 'asc' }
                }
              },
              orderBy: { orderIndex: 'asc' }
            }
          },
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: { id: 'asc' }
    });

    // Check access for each class
    const classesWithAccess = await Promise.all(
      classes.map(async (cls) => {
        // Check if user has class-level access
        const classAccess = await checkUserAccess(userId, cls.id);
        
        // Check subject-level access for each subject
        const subjectsWithAccess = await Promise.all(
          cls.subjects.map(async (subject) => {
            const subjectAccess = await checkUserAccess(userId, cls.id, subject.id);
            
            return {
              ...subject,
              hasAccess: subjectAccess.hasSubjectAccess,
              accessType: subjectAccess.accessType
            };
          })
        );

        // Determine if user has partial access (some subjects but not full class)
        const hasPartialAccess = !classAccess.hasClassAccess && 
          subjectsWithAccess.some(s => s.hasAccess);

        return {
          ...cls,
          subjects: subjectsWithAccess,
          schoolAccess: Boolean(userProfile?.school?.isActive && classAccess.accessType === 'none'),
          subscriptionAccess: classAccess.hasClassAccess,
          hasPartialAccess,
          accessType: classAccess.accessType,
          subjectAccess: subjectsWithAccess.reduce((acc, subject) => {
            acc[subject.id] = {
              hasAccess: subject.hasAccess,
              accessType: subject.accessType
            };
            return acc;
          }, {} as Record<string, { hasAccess: boolean; accessType: string }>)
        };
      })
    );

    // Log dashboard access
    await logDashboardAccess(userId);

    return NextResponse.json({
      classes: classesWithAccess,
      userProfile,
      accessMessage: generateAccessMessage(userProfile, classesWithAccess),
      accessType: determineOverallAccessType(classesWithAccess)
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateAccessMessage(userProfile: UserProfileWithSchool | null, classes: ClassWithAccess[]): string | null {
  if (!userProfile) return null;

  if (userProfile.school?.isActive) {
    return `✓ School Access: You have access through ${userProfile.school.name}`;
  }

  const hasAnySubscription = classes.some(c => c.subscriptionAccess);
  if (hasAnySubscription) {
    return `✓ Subscription Access: You have active subscriptions`;
  }

  const hasPartialAccess = classes.some(c => c.hasPartialAccess);
  if (hasPartialAccess) {
    return `⚡ Partial Access: You have access to some subjects`;
  }

  return `📚 Individual access required for premium content`;
}

function determineOverallAccessType(classes: ClassWithAccess[]): string {
  if (classes.some(c => c.schoolAccess)) return 'school';
  if (classes.some(c => c.subscriptionAccess)) return 'subscription';
  if (classes.some(c => c.hasPartialAccess)) return 'partial';
  return 'individual';
}