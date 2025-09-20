'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useClassData, type DbClass } from '@/hooks/useClassData';

interface SubjectAccessData {
  id: string;
  name: string;
  hasAccess: boolean;
  accessType: string;
}

interface ClassAccessResponse {
  hasFullAccess: boolean;
  accessType: string;
  subjectAccess: SubjectAccessData[];
  error?: string;
}

interface UseClassPageDataResult {
  currentClass: DbClass | null;
  userProgress: Map<string, boolean>;
  markTopicComplete: (topicId: string, completed?: boolean) => Promise<void>;
  subjectAccess: Record<string, boolean>;
  accessType: string;
  accessMessage: string;
  loading: boolean;
  error: string | null;
}

export function useClassPageData(classId: string): UseClassPageDataResult {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  
  // Use the existing class data hook
  const { currentClass, userProgress, loading: classDataLoading, error: classDataError, markTopicComplete } = useClassData(classId);
  
  // Access verification state
  const [subjectAccess, setSubjectAccess] = useState<Record<string, boolean>>({});
  const [accessType, setAccessType] = useState<string>('');
  const [accessMessage, setAccessMessage] = useState<string>('');
  const [accessLoading, setAccessLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);

  // Combined loading state
  const loading = classDataLoading || accessLoading;
  const error = classDataError || accessError;

  // Get subject-level access data when user and classId are available
  useEffect(() => {
    const getSubjectAccess = async () => {
      if (!user?.id || !classId) {
        setAccessLoading(false);
        return;
      }

      try {
        setAccessLoading(true);
        const response = await fetch(`/api/classes/${classId}/access?userId=${user.id}`);
        const data: ClassAccessResponse = await response.json();

        if (response.ok) {
          // Check if user has any access at all
          const hasAnyAccess = data.hasFullAccess || data.subjectAccess.some((s: SubjectAccessData) => s.hasAccess);
          
          if (!hasAnyAccess) {
            // User has no access to this class - redirect to dashboard
            console.log('No access to class, redirecting to dashboard');
            router.push('/dashboard');
            return;
          }

          setAccessType(data.accessType);
          setAccessMessage(
            data.hasFullAccess 
              ? 'Full Access'
              : data.subjectAccess.some((s: SubjectAccessData) => s.hasAccess)
              ? 'Partial access - some subjects available'
              : 'Limited access'
          );

          // Set subject-level access
          const subjectAccessMap: Record<string, boolean> = {};
          data.subjectAccess.forEach((subject: SubjectAccessData) => {
            subjectAccessMap[subject.id] = subject.hasAccess;
          });
          setSubjectAccess(subjectAccessMap);
        } else {
          console.error('Error checking access:', data.error);
          setAccessError(data.error || 'Failed to check access');
        }
      } catch (error) {
        console.error('Error getting subject access:', error);
        setAccessError('Network error while checking access');
      } finally {
        setAccessLoading(false);
      }
    };

    getSubjectAccess();
  }, [user?.id, classId, router]);

  return {
    currentClass,
    userProgress,
    markTopicComplete,
    subjectAccess,
    accessType,
    accessMessage,
    loading,
    error,
  };
}