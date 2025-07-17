import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface DbTopic {
  id: string;
  name: string;
  type: 'video' | 'interactive' | 'exercise' | 'audio'; // This is the topic type enum
  duration: string;
  orderIndex: number;
  content: {
    contentType?: string; // This is the actual content type
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
  isActive: boolean;
  price?: number;
  accessLevel?: 'school' | 'subscribed' | 'both' | 'none';
  accessMessage?: string;
  schoolAccess?: boolean;
  subscriptionAccess?: boolean;
  hasAnyAccess?: boolean;
  // Legacy fields
  accessType?: string;
}

export function useClassData(classId?: string) {
  const { user } = useAuth();
  const [classes, setClasses] = useState<DbClass[]>([]);
  const [currentClass, setCurrentClass] = useState<DbClass | null>(null);
  const [userProgress, setUserProgress] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessMessage, setAccessMessage] = useState<string>('');
  const [accessType, setAccessType] = useState<'subscription' | 'school' | 'free' | 'none'>('none');

  // Fetch accessible classes for the user (including school access)
  useEffect(() => {
    const fetchAccessibleClasses = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching classes for user:', user.id);
        const response = await fetch(`/api/classes/accessible?userId=${user.id}`);
        const data = await response.json();

        console.log('Classes API response:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch accessible classes');
        }

        // Set the raw data first
        setClasses(data.accessibleClasses || []);
        setAccessMessage(data.message || '');
        setAccessType(data.accessType || 'none');

        console.log('Set classes:', data.accessibleClasses?.length || 0);
        console.log('Access type:', data.accessType);
        console.log('Access message:', data.message);

      } catch (err) {
        console.error('Error fetching classes:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccessibleClasses();
  }, [user?.id]);

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
          isActive: classData.isActive,
          price: classData.price, // Keep price as number from database
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
                      type: topic.type, // Keep the topic type as is
                      duration: topic.duration,
                      orderIndex: topic.orderIndex,
                      content: topic.content?.[0] ? {
                        contentType: topic.content[0].contentType, // Use the actual content type
                        url: topic.content[0].url,
                        videoUrl: topic.content[0].videoUrl,
                        pdfUrl: topic.content[0].pdfUrl,
                        textContent: topic.content[0].textContent,
                        widgetConfig: topic.content[0].widgetConfig,
                      } : {
                        contentType: 'text', // Default content type
                      }
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
    accessMessage,
    accessType,
    markTopicComplete,
  };
}
         