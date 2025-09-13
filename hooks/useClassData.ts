'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Types
export interface UserProfile {
  id: string;
  grade?: string;
  school?: {
    name: string;
    isActive: boolean;
  };
}

export interface TopicContent {
  contentType: string;
  url?: string;
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  widgetConfig?: Record<string, unknown>;
}

export interface Topic {
  id: string; // Changed to string for consistency
  name: string;
  type: string;
  duration: string | null;
  description?: string | null;
  orderIndex: number;
  content?: TopicContent;
}

export interface Chapter {
  id: string; // Changed to string for consistency
  name: string;
  orderIndex: number;
  topics: Topic[];
}

export interface Subject {
  id: string; // Changed to string for consistency
  name: string;
  icon: string;
  color: string;
  isLocked: boolean;
  orderIndex: number;
  chapters: Chapter[];
}

export interface Class {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  price: number;
  subjects: Subject[];
  // API-added properties for access control
  accessType?: 'school' | 'subscription' | 'none';
  schoolAccess?: boolean;
  subscriptionAccess?: boolean;
  subjectAccess?: Record<string, {
    hasAccess: boolean;
    accessType: 'school' | 'class_subscription' | 'subject_subscription' | 'none';
  }>;
  hasPartialAccess?: boolean;
}

// Legacy type aliases for backward compatibility
export type DbTopic = Topic;
export type DbChapter = Chapter;
export type DbSubject = Subject;
export type DbClass = Class;

export function useClassData(classId?: string) {
  const { data: session } = useSession();
  const user = session?.user;
  
  const [classes, setClasses] = useState<Class[]>([]);
  const [currentClass, setCurrentClass] = useState<Class | null>(null);
  const [userProgress, setUserProgress] = useState<Map<string, boolean>>(new Map());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessMessage, setAccessMessage] = useState<string>('');
  const [accessType, setAccessType] = useState<'full' | 'demo' | 'none' | 'school' | 'subscription' | 'free'>('none');

  // Fetch accessible classes for the user
  useEffect(() => {
    const fetchAccessibleClasses = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching dashboard data for user:', user.id);
        
        const response = await fetch('/api/dashboard');
        const data = await response.json();

        console.log('Dashboard API response:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch dashboard data');
        }

        // Set the data from API response
        setClasses(data.classes || []);
        setUserProfile(data.userProfile || null);
        setAccessMessage(data.accessMessage || '');
        setAccessType(data.accessType || 'none');

        console.log('Set classes:', data.classes?.length || 0);
        console.log('Access type:', data.accessType);
        console.log('Access message:', data.accessMessage);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccessibleClasses();
  }, [user?.id]);

  // Fetch specific class data
  useEffect(() => {
    if (!classId) return;

    const fetchClass = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/classes/${classId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch class data');
        }

        // Transform data to ensure ID consistency (convert numbers to strings)
        const transformedClass: Class = {
          ...data,
          subjects: data.subjects.map((subject: Record<string, unknown>) => ({
            ...subject,
            id: String(subject.id),
            chapters: (subject.chapters as Record<string, unknown>[]).map((chapter: Record<string, unknown>) => ({
              ...chapter,
              id: String(chapter.id),
              topics: (chapter.topics as Record<string, unknown>[]).map((topic: Record<string, unknown>) => ({
                ...topic,
                id: String(topic.id),
              }))
            }))
          })) as Subject[]
        };

        setCurrentClass(transformedClass);
        
      } catch (err) {
        console.error('Error fetching class:', err);
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
        const response = await fetch(`/api/user/progress?userId=${user.id}`);
        const data = await response.json();

        if (!response.ok) {
          console.error('Error fetching progress:', data.error);
          return;
        }

        // Convert progress object to Map
        const progressMap = new Map();
        Object.entries(data.progress || {}).forEach(([topicId, progressData]) => {
          const progress = progressData as { completed: boolean; completedAt: Date | null; timeSpent: number | null };
          progressMap.set(topicId, progress.completed);
        });
        
        setUserProgress(progressMap);
        
      } catch (err) {
        console.error('Error fetching progress:', err);
      }
    };

    fetchProgress();
  }, [user?.id]);

  // Mark topic as complete/incomplete
  const markTopicComplete = async (topicId: string, completed: boolean = true) => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/user/topic-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId,
          completed,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error updating progress:', data.error);
        return;
      }

      // Update local state only if API call succeeded
      setUserProgress(prev => new Map(prev.set(topicId, completed)));
      
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  return {
    classes,
    currentClass,
    userProgress,
    userProfile,
    loading,
    error,
    accessMessage,
    accessType,
    markTopicComplete,
  };
}
         