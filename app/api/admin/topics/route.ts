import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper function to convert content type to database enum
const convertContentType = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'external_link': return 'EXTERNAL_LINK';
    case 'video': return 'VIDEO';
    case 'pdf': return 'PDF';
    case 'text': return 'TEXT';
    case 'interactive_widget': return 'INTERACTIVE_WIDGET';
    case 'iframe': return 'IFRAME';
    default: return 'EXTERNAL_LINK';
  }
};

// Helper function to convert topic type to database enum
const convertTopicType = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'video': return 'VIDEO';
    case 'interactive': return 'INTERACTIVE';
    case 'exercise': return 'EXERCISE';
    case 'audio': return 'AUDIO';
    default: return 'VIDEO';
  }
};

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

    // Transform the response to ensure content is properly structured
    const transformedTopics = (topics || []).map(topic => {
      let content = undefined;
      
      if (topic.content && Array.isArray(topic.content) && topic.content.length > 0) {
        const contentData = topic.content[0];
        content = {
          contentType: contentData.contentType?.toLowerCase() || 'external_link', // Convert to lowercase for form
          url: contentData.url,
          videoUrl: contentData.videoUrl,
          pdfUrl: contentData.pdfUrl,
          textContent: contentData.textContent,
          widgetConfig: contentData.widgetConfig,
        };
      }
      
      console.log(`Topic ${topic.name} content:`, content); // Debug log
      
      return {
        ...topic,
        content
      };
    });

    console.log('Returning transformed topics:', transformedTopics);
    return NextResponse.json(transformedTopics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, type, duration, orderIndex, chapterId, content } = await request.json();
    
    if (!name || !type || !duration || !chapterId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create topic
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .insert({
        id: crypto.randomUUID(),
        name,
        type: convertTopicType(type), // Convert to proper enum
        duration,
        orderIndex: orderIndex || 0,
        chapterId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (topicError) throw topicError;

    // Create content if provided
    if (content && topic) {
      const { error: contentError } = await supabase
        .from('topic_contents')
        .insert({
          id: crypto.randomUUID(),
          topicId: topic.id,
          contentType: convertContentType(content.contentType), // Convert to proper enum
          url: content.url || null,
          videoUrl: content.videoUrl || null,
          pdfUrl: content.pdfUrl || null,
          textContent: content.textContent || null,
          widgetConfig: content.widgetConfig || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (contentError) {
        console.error('Error creating topic content:', contentError);
        // Don't throw here, topic is already created
      }
    }

    return NextResponse.json({ success: true, topic });
  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, type, duration, orderIndex, content } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 });
    }

    // Update topic
    const { error: topicError } = await supabase
      .from('topics')
      .update({
        name,
        type: convertTopicType(type), // Convert to proper enum
        duration,
        orderIndex,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (topicError) throw topicError;

    // Handle content update with proper enum conversion
    if (content) {
      // First check if content exists
      const { data: existingContent, error: checkError } = await supabase
        .from('topic_contents')
        .select('id')
        .eq('topicId', id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing content:', checkError);
      }

      if (existingContent) {
        // Update existing content with proper enum conversion
        const { error: contentError } = await supabase
          .from('topic_contents')
          .update({
            contentType: convertContentType(content.contentType), // Convert to proper enum
            url: content.url || null,
            videoUrl: content.videoUrl || null,
            pdfUrl: content.pdfUrl || null,
            textContent: content.textContent || null,
            widgetConfig: content.widgetConfig || null,
            updated_at: new Date().toISOString(),
          })
          .eq('topicId', id);

        if (contentError) {
          console.error('Error updating topic content:', contentError);
          throw contentError;
        }
      } else {
        // Create new content with generated ID and proper enum
        const { error: contentError } = await supabase
          .from('topic_contents')
          .insert({
            id: crypto.randomUUID(),
            topicId: id,
            contentType: convertContentType(content.contentType), // Convert to proper enum
            url: content.url || null,
            videoUrl: content.videoUrl || null,
            pdfUrl: content.pdfUrl || null,
            textContent: content.textContent || null,
            widgetConfig: content.widgetConfig || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (contentError) {
          console.error('Error creating topic content:', contentError);
          throw contentError;
        }
      }
    }

    return NextResponse.json({ success: true });
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
