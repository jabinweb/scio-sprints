'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, Clock, CheckCircle, Lock, Star, Trophy } from 'lucide-react';
import { ContentPlayer } from '@/components/learning/ContentPlayer';
import type { DbTopic } from '@/hooks/useClassData';
import { TopicItem } from '@/components/learning/TopicItem';
import { SubscriptionDialog } from '@/components/dashboard/SubscriptionDialog';
import { 
  handleTopicCompletion
} from '@/lib/topic-progression';

// Types for demo data (similar to static data but from API)

export type DemoTopic = {
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
    widgetConfig?: Record<string, unknown>;
    iframeHtml?: string;
  };
};

type DemoChapter = {
  id: string;
  name: string;
  topics: DemoTopic[];
};

type DemoSubject = {
  id: string;
  name: string;
  icon: string;
  color: string;
  isLocked: boolean;
  chapters: DemoChapter[];
  price?: number; 
};

type DemoClass = {
  id: number;
  name: string;
  description: string;
  price?: number;
  currency?: string;
  subjects: DemoSubject[];
};

// Convert demo Topic to DbTopic format for TopicItem compatibility
const convertTopicForItem = (topic: DemoTopic): DbTopic => {
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
    orderIndex: 0,
    content: {
      contentType: topic.content.type,
      url: topic.content.url,
      videoUrl: topic.content.videoUrl,
      pdfUrl: topic.content.pdfUrl,
      textContent: topic.content.iframeHtml || topic.content.textContent,
      widgetConfig: topic.content.widgetConfig,
    }
  };
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
    orderIndex: 0,
    content: {
      contentType: topic.content.type,
      url: topic.content.url,
      videoUrl: topic.content.videoUrl,
      pdfUrl: topic.content.pdfUrl,
      textContent: topic.content.iframeHtml || topic.content.textContent,
      widgetConfig: topic.content.widgetConfig,
    }
  };
};

export default function DemoClassPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;
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
  
  // Get selected subject data
  const selectedSubjectData = demoClass?.subjects.find(s => s.id === selectedSubject);

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

  const handleTopicClick = (topic: DemoTopic) => {
    // For demo: Check if this is the first topic (only enabled topic)
    if (selectedSubjectData) {
      const isFirstTopic = selectedSubjectData.chapters[0]?.topics[0]?.id === topic.id;
      
      if (!isFirstTopic) {
        // Show subscription dialog for locked topics
        setShowPaymentDialog(true);
        return;
      }
    }
    
    // Game-based learning: Allow playing the enabled topic
    setSelectedTopic(topic);
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

  const handleNextTopic = () => {
    if (selectedSubjectData && selectedTopic) {
      // For demo: Only allow access to the first topic
      const isFirstTopic = selectedSubjectData.chapters[0]?.topics[0]?.id === selectedTopic.id;
      
      if (isFirstTopic) {
        // Demo users trying to access next topic should see subscription dialog
        setShowPaymentDialog(true);
        handlePlayerClose(); // Close the player to show the subscription dialog
        return;
      }
      
      // This shouldn't happen in demo since only first topic is enabled,
      // but just in case, close the player
      handlePlayerClose();
    }
  };

  const handlePaymentDialogClose = () => {
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
    return {
      contentType: demoTopic.content.type,
      url: demoTopic.content.url,
      videoUrl: demoTopic.content.videoUrl,
      pdfUrl: demoTopic.content.pdfUrl,
      textContent: demoTopic.content.textContent,
      widgetConfig: demoTopic.content.widgetConfig
    };
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
              className="gap-2 w-fit"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Classes
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5" />
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {demoClass.name}
                </h1>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  Demo Version
                </Badge>
              </div>
              <p className="text-gray-600">{demoClass.description}</p>
              <p className="text-sm text-green-600 mt-1">Try our interactive learning experience!</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Subjects</p>
                  <p className="text-3xl font-bold text-gray-200">{demoClass.subjects.filter(s => !s.isLocked).length}</p>
                </div>
                <BookOpen className="w-10 h-10 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Chapters</p>
                  <p className="text-3xl font-bold text-gray-200">
                    {demoClass.subjects.reduce((acc, s) => acc + s.chapters.length, 0)}
                  </p>
                </div>
                <Clock className="w-10 h-10 text-green-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Progress</p>
                  <p className="text-3xl font-bold text-gray-200">
                    {selectedSubject ? getSubjectProgress(selectedSubject) : 0}%
                  </p>
                </div>
                <Trophy className="w-10 h-10 text-purple-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-gray-200">{completedTopics.size}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-orange-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subject Content</h2>
          <p className="text-gray-600">
            Explore the interactive learning materials and track your progress
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Subject Sidebar */}
          <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Subjects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {demoClass.subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        selectedSubject === subject.id 
                          ? `bg-gradient-to-r ${subject.color} text-white shadow-lg` 
                          : 'bg-gray-50 hover:bg-gray-100'
                      } ${subject.isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => !subject.isLocked && setSelectedSubject(subject.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{subject.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{subject.name}</div>
                          <div className={`text-xs ${selectedSubject === subject.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                            {subject.chapters.length} chapters
                          </div>
                        </div>
                        {subject.isLocked ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <div className="text-right">
                            <div className="text-xs font-medium">{getSubjectProgress(subject.id)}%</div>
                            <div className="w-8 h-1 bg-white/30 rounded-full mt-1">
                              <div 
                                className="h-full bg-white rounded-full transition-all"
                                style={{ width: `${getSubjectProgress(subject.id)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {selectedSubjectData ? (
                <Card className="overflow-hidden">
                  <CardHeader className={`bg-gradient-to-r ${selectedSubjectData.color} text-white`}>
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-3xl">{selectedSubjectData.icon}</span>
                      <div>
                        <h2 className="text-2xl">{selectedSubjectData.name}</h2>
                        <p className="text-white/80">{selectedSubjectData.chapters.length} chapters to explore</p>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="text-2xl font-bold">{getSubjectProgress(selectedSubjectData.id)}%</div>
                        <div className="text-sm text-white/80">Complete</div>
                      </div>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-0">
                    {/* ...existing code for chapter grid... */}
                    <div className="p-6 space-y-6">
                      {selectedSubjectData.chapters.map((chapter, chapterIndex) => {
                        const chapterProgress = Math.round(
                          (chapter.topics.filter(t => t.completed).length / chapter.topics.length) * 100
                        );
                        
                        return (
                          <div key={chapter.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${selectedSubjectData.color} text-white flex items-center justify-center text-sm font-bold`}>
                                    {chapterIndex + 1}
                                  </div>
                                  <div>
                                    <h3 className="text-xl">{chapter.name}</h3>
                                    <p className="text-sm text-muted-foreground">{chapter.topics.length} topics</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium">{chapterProgress}%</div>
                                  <Progress value={chapterProgress} className="w-20 h-2" />
                                </div>
                              </div>
                            </div>

                            {/* Topics Grid */}
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                              {chapter.topics.map((topic: DemoTopic, topicIndex) => {
                                const isCompleted = topic.completed || completedTopics.has(topic.id);
                                
                                // For demo: Only enable the very first topic of the first chapter
                                const isFirstTopic = chapterIndex === 0 && topicIndex === 0;
                                const isDisabled = !isFirstTopic;
                                
                                // Game-based learning - students can play any topic/game
                                const dbTopic = convertTopicForItem(topic);
                                
                                // Get rating for this topic
                                const topicRating = topicRatings[topic.id];
                                
                                return (
                                  <TopicItem
                                    key={topic.id}
                                    topic={dbTopic}
                                    isCompleted={isCompleted}
                                    isDisabled={isDisabled}
                                    userRating={topicRating?.userRating}
                                    hasRated={topicRating?.hasRated}
                                    onClick={() => handleTopicClick(topic)}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="p-12 text-center">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Select a Subject</h3>
                  <p className="text-muted-foreground">Choose a subject from the sidebar to start exploring</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      
      {/* Demo Content Player */}
      <ContentPlayer
        topic={selectedTopic ? convertToDbTopic(selectedTopic) : null}
        isOpen={isPlayerOpen}
        onClose={handlePlayerClose}
        onComplete={handleTopicComplete}
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
          classData={{
            id: demoClass.id,
            name: demoClass.name,
            description: demoClass.description || '',
            price: demoClass.price || 29900,
            subjects: demoClass.subjects?.map(subject => ({
              id: subject.id,
              name: subject.name,
              icon: subject.icon || '📚',
              color: subject.color || 'from-blue-500 to-blue-600',
              price: subject.price,
              chapters: subject.chapters || []
            })) || []
          }}
          onSubscribe={(type, options) => {
            console.log('Subscription success:', type, options);
            handlePaymentDialogClose();
            // Reload the page to refresh access information
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
