import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface SubjectAccess {
  id: string;
  name: string;
  hasAccess: boolean;
  accessType: 'school' | 'class_subscription' | 'subject_subscription' | 'none';
  price?: number;
  currency?: string;
  canUpgrade?: boolean;
}

interface DbSubject {
  id: string;
  name: string;
  icon: string;
  color: string;
  orderIndex: number;
  price: number;
  currency: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const { classId } = await params;

    if (!userId || !classId) {
      return NextResponse.json({ error: 'User ID and Class ID are required' }, { status: 400 });
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

    // Get class with subjects
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select(`
        *,
        subjects:subjects(
          id,
          name,
          icon,
          color,
          orderIndex,
          price,
          currency
        )
      `)
      .eq('id', parseInt(classId))
      .eq('isActive', true)
      .single();

    if (classError || !classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Check user's subscriptions
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

    // Check for class-wide subscription
    const classSubscription = subscriptions?.find(s => 
      s.classId === parseInt(classId) && !s.subjectId
    );

    // Check for subject-specific subscriptions
    const subjectSubscriptions = new Map(
      subscriptions?.filter(s => s.subjectId).map(s => [s.subjectId, s]) || []
    );

    // Check school access
    const gradeToClassMap: Record<string, number[]> = {
      '5': [5], '6': [6], '7': [7], '8': [8], '9': [9], '10': [10]
    };
    const hasSchoolAccess = user.school?.is_active && user.grade && 
      (gradeToClassMap[user.grade] || []).includes(parseInt(classId));

    // Build subject access information
    const subjectAccess: SubjectAccess[] = classData.subjects.map((subject: DbSubject) => {
      const hasSubjectSubscription = subjectSubscriptions.has(subject.id);
      const hasAccess = hasSchoolAccess || classSubscription || hasSubjectSubscription;
      
      let accessType: SubjectAccess['accessType'] = 'none';
      if (hasSchoolAccess) accessType = 'school';
      else if (classSubscription) accessType = 'class_subscription';
      else if (hasSubjectSubscription) accessType = 'subject_subscription';

      return {
        id: subject.id,
        name: subject.name,
        hasAccess,
        accessType,
        price: subject.price,
        currency: subject.currency,
        canUpgrade: hasSubjectSubscription && !classSubscription // Can upgrade from subject to class
      };
    });

    return NextResponse.json({
      classId: parseInt(classId),
      className: classData.name,
      classPrice: classData.price,
      hasFullAccess: hasSchoolAccess || !!classSubscription,
      accessType: hasSchoolAccess ? 'school' : classSubscription ? 'class_subscription' : 'partial',
      subjectAccess,
      canUpgradeToClass: subjectSubscriptions.size > 0 && !classSubscription,
      upgradeOptions: subjectSubscriptions.size > 0 && !classSubscription ? {
        currentSubjects: Array.from(subjectSubscriptions.keys()),
        classPrice: classData.price,
        potentialSavings: (subjectSubscriptions.size * Math.ceil(classData.price / classData.subjects.length)) - classData.price
      } : null
    });

  } catch (error) {
    console.error('Error in class access API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
