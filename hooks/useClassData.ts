import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface DbTopic {
  id: string;
  name: string;
  type: 'video' | 'interactive' | 'exercise' | 'audio';
  duration: string;
  orderIndex: number;
  content?: {
    contentType: 'external_link' | 'video' | 'pdf' | 'text' | 'interactive_widget';
    url?: string;
    videoUrl?: string;
    pdfUrl?: string;
    textContent?: string;
    widgetConfig?: Record<string, unknown>;
  };
}

export interface DbChapter {
  id: string;
  name: string;
  orderIndex: number;
  topics: DbTopic[];
}

export interface DbSubject {
  id: string;
  name: string;
  icon: string;
  color: string;
  isLocked: boolean;
  orderIndex: number;
  chapters: DbChapter[];
}

export interface DbClass {
  id: number;
  name: string;
  description: string;
  subjects: DbSubject[];
}

export function useClassData(classId?: string) {
  const { user } = useAuth();
  const [classes, setClasses] = useState<DbClass[]>([]);
  const [currentClass, setCurrentClass] = useState<DbClass | null>(null);
  const [userProgress, setUserProgress] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data: classes, error } = await supabase
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

        if (error) throw error;

        // Transform data structure to match expected format
        const transformedClasses = classes?.map(cls => ({
          id: cls.id,
          name: cls.name,
          description: cls.description,
          subjects: cls.subjects
            .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
            .map((subject: any) => ({
              id: subject.id,
              name: subject.name,
              icon: subject.icon,
              color: subject.color,
              isLocked: subject.isLocked,
              orderIndex: subject.orderIndex,
              chapters: subject.chapters
                .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
                .map((chapter: any) => ({
                  id: chapter.id,
                  name: chapter.name,
                  orderIndex: chapter.orderIndex,
                  topics: chapter.topics
                    .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
                    .map((topic: any) => ({
                      id: topic.id,
                      name: topic.name,
                      type: topic.type,
                      duration: topic.duration,
                      orderIndex: topic.orderIndex,
                      content: topic.content?.[0] ? {
                        contentType: topic.content[0].contentType,
                        url: topic.content[0].url,
                        videoUrl: topic.content[0].videoUrl,
                        pdfUrl: topic.content[0].pdfUrl,
                        textContent: topic.content[0].textContent,
                        widgetConfig: topic.content[0].widgetConfig,
                      } : undefined
                    }))
                }))
            }))
        })) || [];

        setClasses(transformedClasses);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Fetch specific class
  useEffect(() => {
    if (!classId) return;

    const fetchClass = async () => {
      try {
        setLoading(true);
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
          .eq('id', parseInt(classId))
          .eq('isActive', true)
          .single();

        if (error) throw error;

        // Transform data structure
        const transformedClass = {
          id: classData.id,
          name: classData.name,
          description: classData.description,
          subjects: classData.subjects
            .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
            .map((subject: any) => ({
              id: subject.id,
              name: subject.name,
              icon: subject.icon,
              color: subject.color,
              isLocked: subject.isLocked,
              orderIndex: subject.orderIndex,
              chapters: subject.chapters
                .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
                .map((chapter: any) => ({
                  id: chapter.id,
                  name: chapter.name,
                  orderIndex: chapter.orderIndex,
                  topics: chapter.topics
                    .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
                    .map((topic: any) => ({
                      id: topic.id,
                      name: topic.name,
                      type: topic.type,
                      duration: topic.duration,
                      orderIndex: topic.orderIndex,
                      content: topic.content?.[0] ? {
                        contentType: topic.content[0].contentType,
                        url: topic.content[0].url,
                        videoUrl: topic.content[0].videoUrl,
                        pdfUrl: topic.content[0].pdfUrl,
                        textContent: topic.content[0].textContent,
                        widgetConfig: topic.content[0].widgetConfig,
                      } : undefined
                    }))
                }))
            }))
        };

        setCurrentClass(transformedClass);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [classId]);

  // Fetch user progress
  useEffect(() => {
    if (!user?.id) return;

    const fetchProgress = async () => {
      try {
        const { data: progress, error } = await supabase
          .from('user_topic_progress')
          .select('topicId, completed')
          .eq('userId', user.id);

        if (error) {
          console.error('Error fetching progress:', error);
          return;
        }

        const progressMap = new Map();
        progress?.forEach((item) => {
          progressMap.set(item.topicId, item.completed);
        });
        setUserProgress(progressMap);
      } catch (err) {
        console.error('Error fetching progress:', err);
      }
    };

    fetchProgress();
  }, [user?.id]);

  const markTopicComplete = async (topicId: string, completed: boolean = true) => {
    if (!user?.id) return;

    try {
      // Simple insert/update approach without upsert
      const { data: existing, error: checkError } = await supabase
        .from('user_topic_progress')
        .select('id')
        .eq('userId', user.id)
        .eq('topicId', topicId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing progress:', checkError);
        return;
      }

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('user_topic_progress')
          .update({
            completed,
            completedAt: completed ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('userId', user.id)
          .eq('topicId', topicId);

        if (error) {
          console.error('Error updating progress:', error);
          return;
        }
      } else {
        // Insert new record with generated ID
        const { error } = await supabase
          .from('user_topic_progress')
          .insert({
            id: crypto.randomUUID(), // Generate UUID for new records
            userId: user.id,
            topicId: topicId,
            completed,
            completedAt: completed ? new Date().toISOString() : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Error inserting progress:', error);
          return;
        }
      }
      
      // Update local state only if database operation succeeded
      setUserProgress(prev => new Map(prev.set(topicId, completed)));
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  return {
    classes,
    currentClass,
    userProgress,
    loading,
    error,
    markTopicComplete,
  };
}
