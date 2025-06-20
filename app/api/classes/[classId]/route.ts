import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Next.js 15: params is a Promise and must be awaited
export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { classId } = await params;

  try {
    const { data: classData, error } = await supabase
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
      .eq('id', classId)
      .single();

    if (error) throw error;

    return NextResponse.json(classData);
  } catch (error) {
    console.error('Error fetching class data:', error);
    return NextResponse.json({ error: 'Failed to fetch class data' }, { status: 500 });
  }
}
