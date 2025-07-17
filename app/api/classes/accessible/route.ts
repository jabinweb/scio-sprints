import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    // Check user's paid subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('classId')
      .eq('userId', userId)
      .eq('status', 'ACTIVE')
      .gte('endDate', new Date().toISOString());

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
    }

    const subscribedClassIds = new Set(subscriptions?.map(s => s.classId).filter(Boolean) || []);
    
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
      const hasSubscription = subscribedClassIds.has(cls.id);

      return {
        ...cls,
        accessType: hasSchoolAccess ? 'school' : hasSubscription ? 'subscription' : 'none',
        schoolAccess: hasSchoolAccess,
        subscriptionAccess: hasSubscription
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
     