'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Star, GraduationCap, Users } from 'lucide-react';
import { SubscriptionDialog } from '@/components/dashboard/SubscriptionDialog';
import { ClassCard } from '@/components/dashboard/ClassCard';

// Types for demo classes data
interface DemoClass {
  id: number;
  name: string;
  description: string;
  price: number;
  currency?: string;
  subjectCount: number;
  chapterCount: number;
  topicCount: number;
  subjects: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    isLocked: boolean;
    price: number;
    chapters: Array<{
      id: string;
      name: string;
      topics: Array<{
        id: string;
        name: string;
        type: string;
        duration: string;
        description?: string;
        completed: boolean;
        content: {
          type: string;
          value: string;
          url?: string;
          videoUrl?: string;
          pdfUrl?: string;
          textContent?: string;
          iframeHtml?: string;
          widgetConfig?: Record<string, unknown>;
        };
      }>;
    }>;
  }>;
}



export default function DemoPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<DemoClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [selectedClassForSubscription, setSelectedClassForSubscription] = useState<DemoClass | null>(null);

  // Fetch demo classes from API
  useEffect(() => {
    const fetchDemoClasses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/demo/classes/list');
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch demo classes');
        }
        
        if (result.success && result.data) {
          setClasses(result.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching demo classes:', err);
        setError(err instanceof Error ? err.message : 'Failed to load demo classes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDemoClasses();
  }, []);

  const handleClassClick = (classId: number) => {
    router.push(`/demo/class/${classId}`);
  };

  const calculateClassProgress = (demoClass: DemoClass) => {
    const allTopics = demoClass.subjects.flatMap(s => 
      s.chapters.flatMap(ch => ch.topics)
    );
    
    if (allTopics.length === 0) return 0;
    
    const completedCount = allTopics.filter(topic => topic.completed).length;
    return Math.round((completedCount / allTopics.length) * 100);
  };

  // Transform DemoClass to ClassData format for SubscriptionDialog
  const transformToClassData = (demoClass: DemoClass) => {
    return {
      id: demoClass.id,
      name: demoClass.name,
      description: demoClass.description,
      price: demoClass.price, // Already in paisa
      subjects: demoClass.subjects.map(subject => ({
        id: subject.id,
        name: subject.name,
        icon: subject.icon,
        color: subject.color,
        price: subject.price, 
        isSubscribed: false,
        subscriptionType: undefined,
        chapters: subject.chapters.map(chapter => ({
          id: chapter.id,
          name: chapter.name,
          topics: chapter.topics.map(topic => ({
            id: topic.id,
            name: topic.name
          }))
        }))
      }))
    };
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                <Star className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-100 text-base sm:text-lg">Try ScioSprints</h3>
                <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">Experience our learning platform with sample content across all classes.</p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => router.push('/')}
              className="gap-2 w-full sm:w-fit text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Loading Demo Classes...</h2>
            <p className="text-sm sm:text-base text-gray-500">Fetching real content from our database</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="text-red-500 text-4xl sm:text-6xl mb-4">⚠️</div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Demo Unavailable</h2>
            <p className="text-sm sm:text-base text-gray-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full sm:w-auto">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Classes Content */}
      {!isLoading && !error && (
        <>
          {/* Enhanced Header */}
          <div className="relative overflow-hidden bg-white border-b border-gray-200">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 mb-6">
                <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
                  <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent leading-tight">
                    Explore All Classes
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Choose any class to experience our interactive learning content</p>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs sm:text-sm">Available Classes</p>
                      <p className="text-2xl sm:text-3xl text-gray-200 font-bold">5</p>
                    </div>
                    <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-blue-200 flex-shrink-0" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-xs sm:text-sm">Total Subjects</p>
                      <p className="text-2xl sm:text-3xl text-gray-200 font-bold">
                        18
                      </p>
                    </div>
                    <Users className="w-8 h-8 sm:w-10 sm:h-10 text-green-200 flex-shrink-0" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-xs sm:text-sm">Total Activities</p>
                      <p className="text-2xl sm:text-3xl text-gray-200 font-bold">
                        1000+
                      </p>
                    </div>
                    <Star className="w-8 h-8 sm:w-10 sm:h-10 text-purple-200 flex-shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Class Cards Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Try out our activities</h2>
              <p className="text-sm sm:text-base text-gray-600">
                Click on any class and play the activities based on the lesson content.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {classes.map((classInfo) => {
                const progress = calculateClassProgress(classInfo);

                return (
                  <ClassCard
                    key={classInfo.id}
                    variant="demo"
                    classData={{
                      id: classInfo.id,
                      name: classInfo.name,
                      description: classInfo.description,
                      price: classInfo.price,
                      subjectCount: classInfo.subjectCount,
                      chapterCount: classInfo.chapterCount,
                      subjects: classInfo.subjects
                    }}
                    progress={progress}
                    onClick={() => handleClassClick(classInfo.id)}
                    onUpgrade={(e) => {
                      e.stopPropagation();
                      setSelectedClassForSubscription(classInfo);
                      setShowSubscriptionDialog(true);
                    }}
                  />
                );
              })}
            </div>

            {/* Empty State */}
            {classes.length === 0 && (
              <div className="text-center py-12 sm:py-16">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Demo Classes Available</h3>
                <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4">
                  Demo classes will appear here once they&apos;re added to the database.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Subscription Dialog */}
      {selectedClassForSubscription && (
        <SubscriptionDialog 
          open={showSubscriptionDialog}
          onClose={() => {
            setShowSubscriptionDialog(false);
            setSelectedClassForSubscription(null);
          }}
          classData={transformToClassData(selectedClassForSubscription)}
          onSubscribe={(type, options) => {
            console.log('Demo subscription:', type, options);
            setShowSubscriptionDialog(false);
            setSelectedClassForSubscription(null);
          }}
        />
      )}
    </div>
  );
}