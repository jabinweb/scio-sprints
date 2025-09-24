'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Clock, CheckCircle, Star, Trophy } from 'lucide-react';
import { ContentPlayer } from '@/components/learning/ContentPlayer';
import type { DbTopic } from '@/hooks/useClassData';
import { SubscriptionDialog } from '@/components/dashboard/SubscriptionDialog';
import { SubjectContent } from '@/components/learning/SubjectContent';
import { 
  handleTopicCompletion
} from '@/lib/topic-progression';
import { useSession } from 'next-auth/react';

// Types for demo data (similar to static data but from API)

export type DemoTopic = {
  id: string;
  name: string;
  type: string;
  duration: string;
  description?: string;
  difficulty?: string;
  completed: boolean;
  content: {
    type: string;
    value: string;
    url?: string;
    videoUrl?: string;
    pdfUrl?: string;
    textContent?: string;
    widgetConfig?: Record<string, unknown>;
    iframeHtml?: string;
  };
};

type DemoChapter = {
  id: string;
  name: string;
  isLocked?: boolean; // New field for chapter locking
  topics: DemoTopic[];
};

type DemoSubject = {
  id: string;
  name: string;
  icon: string;
  color: string;
  isLocked: boolean;
  price?: number; // Price in paisa
  currency?: string;
  chapters: DemoChapter[];
};

type DemoClass = {
  id: number;
  name: string;
  description: string;
  price?: number;
  currency?: string;
  subjects: DemoSubject[];
};



// Convert demo Topic to DbTopic format for ContentPlayer
const convertToDbTopic = (topic: DemoTopic): DbTopic => {
  // Map database topic types to expected enum values
  const getTopicType = (type: string): 'video' | 'interactive' | 'exercise' | 'audio' => {
    switch (type.toLowerCase()) {
      case 'video': return 'video';
      case 'interactive':
      case 'interactive_widget': return 'interactive';
      case 'exercise': return 'exercise';
      case 'audio': return 'audio';
      default: return 'interactive'; // Default fallback
    }
  };

  return {
    id: topic.id,
    name: topic.name,
    type: getTopicType(topic.type),
    duration: topic.duration,
    description: topic.description,
    difficulty: topic.difficulty || 'BEGINNER',
    orderIndex: 0,
    content: {
      contentType: topic.content.type,
      url: topic.content.url,
      videoUrl: topic.content.videoUrl,
      pdfUrl: topic.content.pdfUrl,
      textContent: topic.content.textContent,
      iframeHtml: topic.content.iframeHtml,
      widgetConfig: topic.content.widgetConfig,
    }
  };
};

export default function DemoClassPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;
  const { data: session, status } = useSession();
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<DemoTopic | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedSubjectName, setCompletedSubjectName] = useState<string>('');
  const [demoClass, setDemoClass] = useState<DemoClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [topicRatings, setTopicRatings] = useState<Record<string, { userRating: number; hasRated: boolean }>>({});
  const [demoStartTime] = useState<number>(Date.now());

  
  // Get selected subject data
  const selectedSubjectData = demoClass?.subjects.find(s => s.id === selectedSubject);

  // Auto-trigger subscription dialog every 3 minutes (180000ms)
  useEffect(() => {
    const interval = setInterval(() => {
      const timeElapsed = Date.now() - demoStartTime;
      // Show subscription dialog every 3 minutes if not already showing
      if (timeElapsed > 180000 && !showPaymentDialog && !isPlayerOpen) {
        setShowPaymentDialog(true);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [demoStartTime, showPaymentDialog, isPlayerOpen]);

  // Fetch demo data from API
  useEffect(() => {
    const fetchDemoData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/demo/classes?classId=${classId}`);
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch demo data');
        }
        
        if (result.success && result.data) {
          setDemoClass(result.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching demo data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load demo data');
      } finally {
        setIsLoading(false);
      }
    };

    if (classId) {
      fetchDemoData();
    }
  }, [classId]);

  // Check for pending subscription after login
  useEffect(() => {
    // Only check if user is authenticated and page has loaded
    if (status === 'authenticated' && session && typeof window !== 'undefined') {
      const pendingSubscription = localStorage.getItem('pendingSubscription');
      
      if (pendingSubscription) {
        try {
          const parsed = JSON.parse(pendingSubscription);
          
          // Check if the pending subscription is for this class and not too old (5 minutes)
          const isValidPending = parsed.classId === parseInt(classId) && 
                                (Date.now() - parsed.timestamp) < 300000; // 5 minutes
          
          if (isValidPending) {
            // Clear the pending subscription
            localStorage.removeItem('pendingSubscription');
            
            // Trigger subscription dialog after a short delay to ensure UI is ready
            setTimeout(() => {
              setShowPaymentDialog(true);
            }, 1000);
          }
        } catch (error) {
          console.error('Error parsing pending subscription:', error);
          // Clear invalid data
          localStorage.removeItem('pendingSubscription');
        }
      }
    }
  }, [status, session, classId]);

  useEffect(() => {
    // Auto-select first unlocked subject when data is loaded
    if (demoClass && !selectedSubject) {
      const firstUnlockedSubject = demoClass.subjects.find(s => !s.isLocked);
      if (firstUnlockedSubject) {
        setSelectedSubject(firstUnlockedSubject.id);
      }
    }
  }, [demoClass, selectedSubject]);

  // Load demo ratings from localStorage for persistence
  useEffect(() => {
    if (typeof window !== 'undefined' && classId) {
      const savedRatings = localStorage.getItem(`demo-ratings-${classId}`);
      if (savedRatings) {
        try {
          setTopicRatings(JSON.parse(savedRatings));
        } catch (error) {
          console.error('Error loading demo ratings from localStorage:', error);
        }
      }
    }
  }, [classId]);

  const handleTopicClick = (topic: DemoTopic | { id: string; name: string; [key: string]: unknown }, chapterIndex?: number) => {
    // Convert to DemoTopic if needed
    const demoTopic = topic as DemoTopic;
    
    // For demo: Check if this chapter is locked (first chapter is free)
    if (selectedSubjectData && typeof chapterIndex === 'number') {
      const chapter = selectedSubjectData.chapters[chapterIndex];
      
      console.log('Topic clicked:', demoTopic.name);
      console.log('Chapter:', chapter?.name, 'isLocked:', chapter?.isLocked);
      
      if (chapter?.isLocked) {
        console.log('Showing subscription dialog for locked chapter');
        // Show subscription dialog for locked chapters
        setShowPaymentDialog(true);
        return;
      }
    }
    
    console.log('Playing topic:', demoTopic.name);
    // Game-based learning: Allow playing any topic in unlocked chapters
    setSelectedTopic(demoTopic);
    setIsPlayerOpen(true);
  };

  const handlePlayerClose = () => {
    setIsPlayerOpen(false);
    setSelectedTopic(null);
  };



  const handleTopicComplete = () => {
    if (selectedTopic) {
      const newCompletedTopics = handleTopicCompletion(
        selectedTopic.id, 
        completedTopics, 
        setCompletedTopics
      );

      // Check if all topics in the subject are completed
      if (selectedSubjectData) {
        const allTopics = selectedSubjectData.chapters.flatMap(ch => ch.topics);
        const allCompleted = allTopics.every(topic => 
          topic.completed || newCompletedTopics.has(topic.id)
        );

        if (allCompleted) {
          setCompletedSubjectName(selectedSubjectData.name);
          setShowCompletionModal(true);
        }
      }
    }
    // Note: Don't close the player dialog here
  };

  const handleTopicIncomplete = () => {
    if (selectedTopic) {
      console.log(`Demo: Marking topic ${selectedTopic.id} as incomplete`);
      setCompletedTopics(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedTopic.id);
        return newSet;
      });
    }
  };

  const handleNextTopic = () => {
    if (selectedSubjectData && selectedTopic) {
      // Find current topic and get next topic
      let foundTopic = false;
      let nextTopic = null;
      let nextChapterIndex = -1;
      
      for (let chapterIndex = 0; chapterIndex < selectedSubjectData.chapters.length; chapterIndex++) {
        const chapter = selectedSubjectData.chapters[chapterIndex];
        for (let topicIndex = 0; topicIndex < chapter.topics.length; topicIndex++) {
          const topic = chapter.topics[topicIndex];
          
          if (foundTopic) {
            nextTopic = topic;
            nextChapterIndex = chapterIndex;
            break;
          }
          
          if (topic.id === selectedTopic.id) {
            foundTopic = true;
          }
        }
        if (nextTopic) break;
      }
      
      // Check if next topic is in a locked chapter
      if (nextTopic && nextChapterIndex >= 0) {
        const nextChapter = selectedSubjectData.chapters[nextChapterIndex];
        if (nextChapter?.isLocked) {
          // Demo users trying to access locked chapter should see subscription dialog
          setShowPaymentDialog(true);
          handlePlayerClose(); // Close the player to show the subscription dialog
          return;
        }
        
        // Play next topic if in unlocked chapter
        setSelectedTopic(nextTopic);
      } else {
        // No more topics available
        handlePlayerClose();
      }
    }
  };

  const handlePaymentDialogClose = () => {
    console.log('Closing payment dialog');
    setShowPaymentDialog(false);
  };

  const setShowSubscriptionDialog = () => {
      setShowPaymentDialog(true);
  };

  // Handle difficulty rating submission
  const handleDifficultyRate = async (topicId: string, rating: number) => {
    try {
      // For demo purposes, we'll store ratings locally in state and localStorage
      const newRatings = {
        ...topicRatings,
        [topicId]: {
          userRating: rating,
          hasRated: true
        }
      };
      
      setTopicRatings(newRatings);
      
      // Save to localStorage for demo persistence
      if (typeof window !== 'undefined' && classId) {
        localStorage.setItem(`demo-ratings-${classId}`, JSON.stringify(newRatings));
      }
      
      console.log(`Demo: Topic ${topicId} rated ${rating} stars`);
    } catch (error) {
      console.error('Error saving difficulty rating in demo:', error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Demo Content...</h2>
          <p className="text-gray-500">Fetching real data from our database</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Demo Unavailable</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => router.push('/demo')}>
            Back to Demo
          </Button>
        </div>
      </div>
    );
  }

  const getSubjectProgress = (subjectId: string) => {
    if (!demoClass) return 0;
    const subject = demoClass.subjects.find(s => s.id === subjectId);
    if (!subject) return 0;
    
    const allTopics = subject.chapters.flatMap(ch => ch.topics);
    const originalCompleted = allTopics.filter(topic => topic.completed).length;
    const demoCompleted = allTopics.filter(topic => completedTopics.has(topic.id)).length;
    const totalCompleted = originalCompleted + demoCompleted;
    
    return allTopics.length > 0 ? Math.round((totalCompleted / allTopics.length) * 100) : 0;
  };

  if (!demoClass) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Demo Content Not Available</h1>
          <p className="text-gray-600 mb-4">We&apos;re unable to load demo content at this time.</p>
          <Button onClick={() => router.push('/demo')}>
            Back to Demo
          </Button>
        </div>
      </div>
    );
  }

  // Convert demo topic content to TopicContent format for ContentPlayer
  const convertDemoContentToTopicContent = (demoTopic: DemoTopic) => {
    const convertedContent = {
      contentType: demoTopic.content.type,
      url: demoTopic.content.url,
      videoUrl: demoTopic.content.videoUrl,
      pdfUrl: demoTopic.content.pdfUrl,
      textContent: demoTopic.content.textContent,
      iframeHtml: demoTopic.content.iframeHtml,
      widgetConfig: demoTopic.content.widgetConfig
    };    
    return convertedContent;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-200">Interactive Demo - {demoClass.name}</h3>
                <p className="text-sm text-blue-100">Experience our learning platform with sample content</p>
                {demoClass.price && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-blue-200">Price:</span>
                    <span className="text-sm font-semibold text-white bg-white/20 px-2 py-0.5 rounded">
                      {demoClass.currency === 'INR' ? '₹' : '$'}{(demoClass.price / 100).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => router.push('/demo')}
              className="gap-2 w-fit text-sm sm:text-base"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Back to Classes</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg mx-auto sm:mx-0">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {demoClass.name}
                </h1>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 w-fit mx-auto sm:mx-0">
                  Demo Version
                </Badge>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">{demoClass.description}</p>
              <p className="text-xs sm:text-sm text-green-600 mt-1">Try our interactive learning experience!</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm">Subjects</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-200">{demoClass.subjects.filter(s => !s.isLocked).length}</p>
                </div>
                <BookOpen className="w-6 h-6 sm:w-10 sm:h-10 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm">Chapters</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-200">
                    {demoClass.subjects.reduce((acc, s) => acc + s.chapters.length, 0)}
                  </p>
                </div>
                <Clock className="w-6 h-6 sm:w-10 sm:h-10 text-green-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs sm:text-sm">Progress</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-200">
                    {selectedSubject ? getSubjectProgress(selectedSubject) : 0}%
                  </p>
                </div>
                <Trophy className="w-6 h-6 sm:w-10 sm:h-10 text-purple-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs sm:text-sm">Completed</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-200">{completedTopics.size}</p>
                </div>
                <CheckCircle className="w-6 h-6 sm:w-10 sm:h-10 text-orange-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Subject Content</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Explore the interactive learning materials and track your progress
          </p>
        </div>

        <SubjectContent
          subjects={demoClass.subjects.map(subject => ({
            id: subject.id,
            name: subject.name,
            icon: subject.icon,
            color: subject.color,
            chapters: subject.chapters.map(chapter => ({
              id: chapter.id,
              name: chapter.name,
              topics: chapter.topics,
              isLocked: chapter.isLocked
            })),
            isLocked: subject.isLocked
          }))}
          selectedSubject={selectedSubject}
          selectedSubjectData={selectedSubjectData ? {
            id: selectedSubjectData.id,
            name: selectedSubjectData.name,
            icon: selectedSubjectData.icon,
            color: selectedSubjectData.color,
            chapters: selectedSubjectData.chapters.map(chapter => ({
              id: chapter.id,
              name: chapter.name,
              topics: chapter.topics,
              isLocked: chapter.isLocked
            })),
            isLocked: selectedSubjectData.isLocked
          } : null}
          completedTopics={completedTopics}
          topicRatings={topicRatings}
          useAccordion={true}
          showUpgradeButton={true}
          showFreeBadge={true}
          onSubjectSelect={setSelectedSubject}
          onTopicClick={handleTopicClick}
          onLockedClick={() => setShowPaymentDialog(true)}
          onUpgradeClick={() => setShowPaymentDialog(true)}
          getSubjectProgress={getSubjectProgress}
          convertTopicForItem={(topic) => convertToDbTopic(topic as DemoTopic)}
        />
      </div>
      
      {/* Demo Content Player */}
      <ContentPlayer
        topic={selectedTopic ? convertToDbTopic(selectedTopic) : null}
        isOpen={isPlayerOpen}
        onClose={handlePlayerClose}
        onComplete={handleTopicComplete}
        onIncomplete={handleTopicIncomplete}
        onNext={handleNextTopic}
        onDifficultyRate={handleDifficultyRate}
        isCompleted={selectedTopic ? (selectedTopic.completed || completedTopics.has(selectedTopic.id)) : false}
        isDemo={true}
        demoContent={selectedTopic ? convertDemoContentToTopicContent(selectedTopic) : undefined}
        isDemoLimitReached={selectedTopic && selectedSubjectData ? selectedSubjectData.chapters[0]?.topics[0]?.id === selectedTopic.id : false}
      />

      {/* Subject Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-white text-center">
              {/* Confetti Animation */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="absolute top-6 right-8 w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                <div className="absolute top-12 left-12 w-1 h-1 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-8 right-4 w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.7s' }} />
                <div className="absolute top-16 left-6 w-1.5 h-1.5 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: '0.9s' }} />
              </div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">Congratulations!</h3>
                <p className="text-green-100 text-lg">
                  You completed {completedSubjectName}
                </p>
              </div>
            </div>
            
            <div className="p-6 text-center">
              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                </div>
                <p className="text-gray-600 mb-4">
                  Great job! In the full version, you would:
                </p>
                <ul className="text-sm text-left max-w-xs mx-auto space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Earn achievement badges</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Unlock new content</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Track your progress</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Get certificates</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => setShowCompletionModal(false)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  Continue Demo
                </Button>
                <Button 
                  onClick={() => setShowSubscriptionDialog()}
                  variant="outline"
                  className="w-full"
                >
                  Get Full Access Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Dialog */}
      {demoClass && (
       <SubscriptionDialog
          open={showPaymentDialog}
          onClose={handlePaymentDialogClose}
          disableAutoRedirect={true}
          classData={{
            id: demoClass.id,
            name: demoClass.name,
            description: demoClass.description || '',
            price: demoClass.price || 29900,
            currency: demoClass.currency || 'INR',
            subjects: demoClass.subjects?.map(subject => ({
              id: subject.id,
              name: subject.name,
              icon: subject.icon || '📚',
              color: subject.color || 'from-blue-500 to-blue-600',
              price: subject.price || 7500, // Default subject price if not set
              currency: subject.currency || 'INR',
              chapters: subject.chapters || []
            })) || []
          }}
          onSubscribe={(type, options) => {
            console.log('Subscription success:', type, options);
            handlePaymentDialogClose();
            
            // Redirect to appropriate page based on subscription type
            if (type === 'class' && options.classId) {
              // Redirect to the full class dashboard
              router.push(`/dashboard/class/${options.classId}`);
            } else if (type === 'subject' && options.subjectId && options.classId) {
              // Redirect to the class dashboard with the specific subject
              router.push(`/dashboard/class/${options.classId}?subject=${options.subjectId}`);
            } else {
              // Fallback: reload the page to refresh access information
              window.location.reload();
            }
          }}
        />
      )}
    </div>
  );
}
