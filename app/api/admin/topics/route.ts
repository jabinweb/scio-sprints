import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');
    
    let query = supabase.from('topics').select(`
      *,
      content:topic_contents(*)
    `);
    
    if (chapterId) {
      query = query.eq('chapterId', chapterId);
    }
    
    const { data: topics, error } = await query.order('orderIndex', { ascending: true });

    if (error) throw error;

    return NextResponse.json(topics || []);
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, type, duration, orderIndex, chapterId, content } = await request.json();
    
    const { data: newTopic, error } = await supabase
      .from('topics')
      .insert({
        name,
        type: type.toUpperCase(),
        duration,
        orderIndex,
        chapterId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Create content if provided
    if (content && newTopic) {
      const { error: contentError } = await supabase
        .from('topic_contents')
        .insert({
          topicId: newTopic.id,
          contentType: content.contentType.toUpperCase(),
          url: content.url,
          videoUrl: content.videoUrl,
          pdfUrl: content.pdfUrl,
          textContent: content.textContent,
          widgetConfig: content.widgetConfig,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (contentError) {
        console.error('Error creating topic content:', contentError);
      }
    }

    return NextResponse.json(newTopic);
  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, type, duration, orderIndex, content } = await request.json();
    
    const { data: updatedTopic, error } = await supabase
      .from('topics')
      .update({
        name,
        type: type.toUpperCase(),
        duration,
        orderIndex,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update content if provided
    if (content) {
      const { error: contentError } = await supabase
        .from('topic_contents')
        .upsert({
          topicId: id,
          contentType: content.contentType.toUpperCase(),
          url: content.url,
          videoUrl: content.videoUrl,
          pdfUrl: content.pdfUrl,
          textContent: content.textContent,
          widgetConfig: content.widgetConfig,
          updated_at: new Date().toISOString(),
        });

      if (contentError) {
        console.error('Error updating topic content:', contentError);
      }
    }

    return NextResponse.json(updatedTopic);
  } catch (error) {
    console.error('Error updating topic:', error);
    return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('id');
    
    if (!topicId) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', topicId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 });
  }
}
