import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface Subject {
  id: string;
  name: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user details with school information
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        school:schools(*)
      `)
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all active classes
    const { data: allClasses, error: classError } = await supabase
      .from('classes')
      .select(`
        *,
        subjects:subjects(
          *,
          chapters:chapters(
            *,
            topics:topics(
              *,
              content:topic_contents(*)
            )
          )
        )
      `)
      .eq('isActive', true)
      .order('id', { ascending: true });

    if (classError) {
      console.error('Error fetching classes:', classError);
      return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
    }

    // Check user's paid subscriptions (both class-wide and subject-specific)
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select(`
        classId,
        subjectId,
        planType,
        status,
        endDate
      `)
      .eq('userId', userId)
      .eq('status', 'ACTIVE')
      .gte('endDate', new Date().toISOString());

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
    }

    // Separate class-wide and subject-specific subscriptions
    const classSubscriptions = new Set(
      subscriptions?.filter(s => s.classId && !s.subjectId).map(s => s.classId) || []
    );
    const subjectSubscriptions = new Map(
      subscriptions?.filter(s => s.subjectId).map(s => [s.subjectId, s.classId]) || []
    );
    const subscribedClassIds = classSubscriptions; // Keep for backward compatibility
    
    // Define grade to class mapping at the top level
    const gradeToClassMap: Record<string, number[]> = {
      '5': [5],
      '6': [6], 
      '7': [7],
      '8': [8],
      '9': [9],
      '10': [10],
      // Add more mappings as needed
    };

    // Always show all active classes, but mark their access type
    const accessibleClasses = allClasses || [];
    let accessMessage = '';
    let accessType: 'subscription' | 'school' | 'free' | 'none' = 'none';

    // School-based access logic
    if (user.school && user.school.is_active && user.grade) {
      const schoolAccessClassIds = gradeToClassMap[user.grade] || [];
      
      if (schoolAccessClassIds.length > 0) {
        accessMessage = `School access granted for Grade ${user.grade} content`;
        accessType = 'school';
      }
    }

    // If user has paid subscriptions, update access type
    if (subscribedClassIds.size > 0) {
      if (accessType === 'school') {
        accessMessage = `School access for Grade ${user.grade} + ${subscribedClassIds.size} subscribed classes`;
      } else {
        accessMessage = `Access via ${subscribedClassIds.size} active subscriptions`;
        accessType = 'subscription';
      }
    }

    // If no school or subscription access, show message for discovery
    if (accessType === 'none') {
      if (user.school) {
        if (!user.school.is_active) {
          accessMessage = 'Your school account is currently inactive. You can still subscribe to individual classes.';
        } else if (!user.grade) {
          accessMessage = 'No grade assigned. Contact your school administrator or subscribe to individual classes.';
        } else {
          accessMessage = `Browse and subscribe to classes available for Grade ${user.grade}`;
        }
      } else {
        accessMessage = 'Browse and subscribe to available classes';
      }
    }

    // Add access metadata to each class
    const classesWithAccess = accessibleClasses.map(cls => {
      const hasSchoolAccess = user.school?.is_active && user.grade && 
        (gradeToClassMap[user.grade] || []).includes(cls.id);
      const hasClassSubscription = classSubscriptions.has(cls.id);
      
      // Check which subjects have individual subscriptions
      const subjectAccess = new Map();
      if (cls.subjects) {
        cls.subjects.forEach((subject: Subject) => {
          const hasSubjectSubscription = subjectSubscriptions.has(subject.id);
          subjectAccess.set(subject.id, {
            hasAccess: hasSchoolAccess || hasClassSubscription || hasSubjectSubscription,
            accessType: hasSchoolAccess ? 'school' : 
                       hasClassSubscription ? 'class_subscription' :
                       hasSubjectSubscription ? 'subject_subscription' : 'none'
          });
        });
      }

      return {
        ...cls,
        accessType: hasSchoolAccess ? 'school' : hasClassSubscription ? 'subscription' : 'none',
        schoolAccess: hasSchoolAccess,
        subscriptionAccess: hasClassSubscription,
        subjectAccess: Object.fromEntries(subjectAccess),
        hasPartialAccess: !hasSchoolAccess && !hasClassSubscription && 
          Array.from(subjectAccess.values()).some(access => access.hasAccess)
      };
    });

    return NextResponse.json({ 
      accessibleClasses: classesWithAccess,
      userGrade: user.grade,
      schoolName: user.school?.name,
      schoolActive: user.school?.is_active,
      accessType,
      message: accessMessage
    });

  } catch (error) {
    console.error('Error in accessible classes API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
     