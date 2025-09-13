'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, Lock, Settings } from 'lucide-react';
import { useClassData, type DbTopic } from '@/hooks/useClassData';
import { ContentPlayer } from '@/components/learning/ContentPlayer';
import { useSession } from 'next-auth/react';
import { ClassSubscriptionManager } from '@/components/dashboard/ClassSubscriptionManager';
import { TopicItem } from '@/components/learning/TopicItem';
import { 
  isTopicEnabled, 
  getNextTopic, 
  isSubjectCompleted,
  canNavigateToNext,
  type SubjectProgression 
} from '@/lib/topic-progression';

interface SubjectData {
  id: string;
  name: string;
  icon: string;
  color: string;
  isLocked: boolean;
  orderIndex: number;
  chapters: ChapterData[];
}

interface ChapterData {
  id: string;
  name: string;
  orderIndex: number;
  topics: DbTopic[];
}

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

export default function ClassPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const { data: session } = useSession();
  const user = session?.user;
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<DbTopic & { completed: boolean } | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  const [subjectAccess, setSubjectAccess] = useState<Record<string, boolean>>({});
  const [accessType, setAccessType] = useState<string>('');
  const [accessMessage, setAccessMessage] = useState<string>('');
  const [topicRatings, setTopicRatings] = useState<Record<string, { averageRating: number; totalRatings: number }>>({});
  
  const { currentClass, userProgress, loading, error, markTopicComplete } = useClassData(classId);

  // Get subject-level access data (layout already verified basic access)
  useEffect(() => {
    const getSubjectAccess = async () => {
      if (!user?.id || !classId) return;

      try {
        const response = await fetch(`/api/classes/${classId}/access?userId=${user.id}`);
        const data: ClassAccessResponse = await response.json();

        if (response.ok) {
          setAccessType(data.accessType);
          setAccessMessage(
            data.hasFullAccess 
              ? `Full access via ${data.accessType}`
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
        }
      } catch (error) {
        console.error('Error getting subject access:', error);
      }
    };

    getSubjectAccess();
  }, [user?.id, classId]);

  // Fetch topic difficulty ratings for the class
  useEffect(() => {
    const fetchTopicRatings = async () => {
      if (!classId) return;

      try {
        const response = await fetch(`/api/user/topic-ratings?classId=${classId}`);
        if (response.ok) {
          const data = await response.json();
          // Convert array to object with topicId as key
          const ratingsMap = data.ratings.reduce((acc: Record<string, { averageRating: number; totalRatings: number }>, rating: { topicId: string; averageRating: number; totalRatings: number }) => {
            acc[rating.topicId] = {
              averageRating: rating.averageRating,
              totalRatings: rating.totalRatings
            };
            return acc;
          }, {});
          setTopicRatings(ratingsMap);
        }
      } catch (error) {
        console.error('Error fetching topic ratings:', error);
      }
    };

    fetchTopicRatings();
  }, [classId]);

  useEffect(() => {
    // Auto-select first unlocked subject
    const firstUnlockedSubject = currentClass?.subjects.find(s => !s.isLocked);
    if (firstUnlockedSubject) {
      setSelectedSubject(firstUnlockedSubject.id);
    }
  }, [currentClass]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading class content...</p>
        </div>
      </div>
    );
  }

  if (error || !currentClass) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Class Not Found</h1>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleTopicClick = (topic: DbTopic) => {
    // Check if user has access to this subject
    const hasSubjectAccess = subjectAccess[selectedSubject] !== false;
    
    if (!hasSubjectAccess) {
      // Show subscription manager instead of playing content
      setShowSubscriptionManager(true);
      return;
    }

    // Check if topic should be enabled (sequential unlock)
    if (selectedSubjectData) {
      const subjectProgress: SubjectProgression = {
        id: selectedSubjectData.id,
        name: selectedSubjectData.name,
        chapters: selectedSubjectData.chapters.map(ch => ({
          id: ch.id,
          name: ch.name,
          topics: ch.topics.map(t => ({
            id: t.id,
            name: t.name,
            completed: userProgress.get(t.id) || false
          }))
        }))
      };

      // Create a Set from userProgress for compatibility with shared functions
      const completedTopicsSet = new Set<string>();
      userProgress.forEach((completed, topicId) => {
        if (completed) completedTopicsSet.add(topicId);
      });

      const topicForProgression = {
        id: topic.id,
        name: topic.name,
        completed: userProgress.get(topic.id) || false
      };

      if (!isTopicEnabled(topicForProgression, subjectProgress, completedTopicsSet)) {
        return; // Don't open disabled topics
      }
    }

    // Convert DbTopic to the expected format with proper content structure
    const topicWithCompleted: DbTopic & { completed: boolean } = {
      ...topic,
      completed: userProgress.get(topic.id) || false,
      content: topic.content ? {
        contentType: topic.content.contentType, // Use contentType for the content type
        url: topic.content.url,
        videoUrl: topic.content.videoUrl,
        pdfUrl: topic.content.pdfUrl,
        textContent: topic.content.textContent,
        widgetConfig: topic.content.widgetConfig
      } : undefined
    };
    setSelectedTopic(topicWithCompleted);
    setIsPlayerOpen(true);
  };

  const handleTopicComplete = async () => {
    if (selectedTopic) {
      await markTopicComplete(selectedTopic.id, true);
      
      // Check if subject is completed using shared utility
      if (selectedSubjectData) {
        const subjectProgress: SubjectProgression = {
          id: selectedSubjectData.id,
          name: selectedSubjectData.name,
          chapters: selectedSubjectData.chapters.map(ch => ({
            id: ch.id,
            name: ch.name,
            topics: ch.topics.map(t => ({
              id: t.id,
              name: t.name,
              completed: userProgress.get(t.id) || false
            }))
          }))
        };

        // Create a Set from userProgress for compatibility with shared functions
        const completedTopicsSet = new Set<string>();
        userProgress.forEach((isCompleted, topicId) => {
          if (isCompleted) completedTopicsSet.add(topicId);
        });
        completedTopicsSet.add(selectedTopic.id); // Add the just completed topic

        if (isSubjectCompleted(subjectProgress, completedTopicsSet)) {
          // Subject completed logic can be added here
          console.log(`Subject ${selectedSubjectData.name} completed!`);
        }
      }
      
      // Don't close the player dialog here for consistency with demo
      // setIsPlayerOpen(false);
      // setSelectedTopic(null);
    }
  };

  const handlePlayerClose = () => {
    setIsPlayerOpen(false);
    setSelectedTopic(null);
  };

  const handleNextTopic = () => {
    if (!selectedSubjectData || !selectedTopic) return;
    
    // Create subject progression data for shared utility
    const subjectProgress: SubjectProgression = {
      id: selectedSubjectData.id,
      name: selectedSubjectData.name,
      chapters: selectedSubjectData.chapters.map(ch => ({
        id: ch.id,
        name: ch.name,
        topics: ch.topics.map(t => ({
          id: t.id,
          name: t.name,
          completed: userProgress.get(t.id) || false
        }))
      }))
    };

    const currentTopicForProgression = {
      id: selectedTopic.id,
      name: selectedTopic.name,
      completed: selectedTopic.completed
    };

    // Create a Set from userProgress for compatibility with shared functions
    const completedTopicsSet = new Set<string>();
    userProgress.forEach((completed, topicId) => {
      if (completed) completedTopicsSet.add(topicId);
    });

    // Check if we can navigate to next topic (current must be completed)
    if (!canNavigateToNext(currentTopicForProgression, subjectProgress, completedTopicsSet)) {
      console.log('Cannot navigate to next topic: current topic not completed');
      return; // Don't proceed if current topic is not completed
    }

    const nextTopic = getNextTopic(currentTopicForProgression, subjectProgress);
    
    if (nextTopic) {
      // Find the full DbTopic object
      const allTopics = selectedSubjectData.chapters.flatMap((ch: ChapterData) => ch.topics);
      const fullNextTopic = allTopics.find((topic: DbTopic) => topic.id === nextTopic.id);
      
      if (fullNextTopic) {
        // Convert to the expected format with completed status
        const nextTopicWithCompleted: DbTopic & { completed: boolean } = {
          ...fullNextTopic,
          completed: userProgress.get(fullNextTopic.id) || false,
          content: fullNextTopic.content ? {
            contentType: fullNextTopic.content.contentType,
            url: fullNextTopic.content.url,
            videoUrl: fullNextTopic.content.videoUrl,
            pdfUrl: fullNextTopic.content.pdfUrl,
            textContent: fullNextTopic.content.textContent,
            widgetConfig: fullNextTopic.content.widgetConfig
          } : undefined
        };
        setSelectedTopic(nextTopicWithCompleted);
      }
    } else {
      // If no next topic, close the player
      handlePlayerClose();
    }
  };

  const getSubjectProgress = (subject: SubjectData) => {
    const allTopics = subject.chapters.flatMap((ch: ChapterData) => ch.topics);
    const completedCount = allTopics.filter((topic: DbTopic) => userProgress.get(topic.id)).length;
    return allTopics.length > 0 ? Math.round((completedCount / allTopics.length) * 100) : 0;
  };

  const handleDifficultyRate = async (topicId: string, rating: number) => {
    if (!user?.id) return;
    
    try {
      // Save the difficulty rating to the backend
      const response = await fetch('/api/user/topic-ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          topicId,
          rating,
          classId: parseInt(classId)
        }),
      });

      if (response.ok) {
        console.log(`Difficulty rating saved: Topic ${topicId} rated ${rating} stars`);
        
        // Refresh topic ratings to show updated average
        const ratingsResponse = await fetch(`/api/user/topic-ratings?classId=${classId}`);
        if (ratingsResponse.ok) {
          const data = await ratingsResponse.json();
          const ratingsMap = data.ratings.reduce((acc: Record<string, { averageRating: number; totalRatings: number }>, ratingData: { topicId: string; averageRating: number; totalRatings: number }) => {
            acc[ratingData.topicId] = {
              averageRating: ratingData.averageRating,
              totalRatings: ratingData.totalRatings
            };
            return acc;
          }, {});
          setTopicRatings(ratingsMap);
        }
      } else {
        console.error('Failed to save difficulty rating');
      }
    } catch (error) {
      console.error('Error saving difficulty rating:', error);
    }
  };

  const selectedSubjectData = currentClass.subjects.find(s => s.id === selectedSubject);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => router.push('/dashboard')}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{currentClass.name}</h1>
                {accessType === 'school' && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    School Access
                  </span>
                )}
                {accessType === 'subscription' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Subscribed
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">{currentClass.description}</p>
              {accessMessage && (
                <p className="text-sm text-green-600 mt-1">{accessMessage}</p>
              )}
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {currentClass.subjects.filter(s => !s.isLocked).length}
                </div>
                <div className="text-xs text-muted-foreground">Subjects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {currentClass.subjects.reduce((acc, s) => acc + s.chapters.length, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Chapters</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubscriptionManager(!showSubscriptionManager)}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Manage Access
              </Button>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subject Content</h2>
          <p className="text-gray-600">
            Explore the interactive learning materials and track your progress
          </p>
        </div>

        {/* Subscription Management Panel */}
        {showSubscriptionManager && (
          <div className="mb-6">
            <ClassSubscriptionManager 
              classId={parseInt(classId)}
              onSubscribe={async (type, options) => {
                console.log('Subscription request:', type, options);
                
                try {
                  // Handle different subscription types
                  if (type === 'class' || type === 'upgrade') {
                    // Redirect to class payment page for both full class and upgrade
                    router.push(`/payment/class/${classId}`);
                  } else if (type === 'subject' && options?.subjectId) {
                    // Redirect to subject payment page
                    router.push(`/payment/subject/${options.subjectId}`);
                  } else {
                    // General subscription - could be a modal or redirect
                    router.push('/dashboard/subscriptions');
                  }
                } catch (error) {
                  console.error('Subscription handling error:', error);
                }
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Subject Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Subjects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentClass.subjects.map((subject) => {
                  const hasSubjectAccess = subjectAccess[subject.id] !== false; // Default to true if not explicitly denied
                  const isAccessible = !subject.isLocked && hasSubjectAccess;
                  
                  return (
                    <div
                      key={subject.id}
                      className={`p-3 rounded-xl transition-all ${
                        selectedSubject === subject.id 
                          ? `bg-gradient-to-r ${subject.color} text-white shadow-lg` 
                          : 'bg-gray-50 hover:bg-gray-100'
                      } ${!isAccessible ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={() => isAccessible && setSelectedSubject(subject.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{subject.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center gap-2">
                            {subject.name}
                            {!hasSubjectAccess && (
                              <Lock className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                          <div className={`text-xs ${selectedSubject === subject.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                            {subject.chapters.length} chapters
                            {!hasSubjectAccess && (
                              <span className="text-red-500 ml-1">• No access</span>
                            )}
                          </div>
                        </div>
                        {subject.isLocked ? (
                          <Lock className="h-4 w-4" />
                        ) : hasSubjectAccess ? (
                          <div className="text-right">
                            <div className="text-xs font-medium">{getSubjectProgress(subject)}%</div>
                            <div className="w-8 h-1 bg-white/30 rounded-full mt-1">
                              <div 
                                className="h-full bg-white rounded-full transition-all"
                                style={{ width: `${getSubjectProgress(subject)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <Lock className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
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
                      <h2 className="text-2xl text-white">{selectedSubjectData.name}</h2>
                      <p className="text-white/80">{selectedSubjectData.chapters.length} chapters to explore</p>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-2xl font-bold">{getSubjectProgress(selectedSubjectData)}%</div>
                      <div className="text-sm text-white/80">Complete</div>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                  {/* Chapter Grid */}
                  <div className="p-6 space-y-6">
                    {selectedSubjectData.chapters.map((chapter, chapterIndex) => {
                      const chapterProgress = chapter.topics.length > 0 
                        ? Math.round((chapter.topics.filter(t => userProgress.get(t.id)).length / chapter.topics.length) * 100)
                        : 0;
                      
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
                            {chapter.topics.map((topic) => {
                              const isCompleted = userProgress.get(topic.id) || false;
                              const hasSubjectAccess = subjectAccess[selectedSubject] !== false;
                              
                              // Create subject progression data for topic enabling check
                              const subjectProgress: SubjectProgression = {
                                id: selectedSubjectData.id,
                                name: selectedSubjectData.name,
                                chapters: selectedSubjectData.chapters.map(ch => ({
                                  id: ch.id,
                                  name: ch.name,
                                  topics: ch.topics.map(t => ({
                                    id: t.id,
                                    name: t.name,
                                    completed: userProgress.get(t.id) || false
                                  }))
                                }))
                              };

                              // Create a Set from userProgress for compatibility with shared functions
                              const completedTopicsSet = new Set<string>();
                              userProgress.forEach((completed, topicId) => {
                                if (completed) completedTopicsSet.add(topicId);
                              });

                              const topicForProgression = {
                                id: topic.id,
                                name: topic.name,
                                completed: isCompleted
                              };

                              const isEnabled = isTopicEnabled(topicForProgression, subjectProgress, completedTopicsSet);
                              
                              // Get difficulty rating for this topic
                              const topicRating = topicRatings[topic.id];
                              
                              return (
                                <TopicItem
                                  key={topic.id}
                                  topic={topic}
                                  isCompleted={isCompleted}
                                  hasAccess={hasSubjectAccess}
                                  isEnabled={isEnabled}
                                  difficultyRating={topicRating?.averageRating}
                                  totalRatings={topicRating?.totalRatings}
                                  onClick={handleTopicClick}
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
                <p className="text-muted-foreground">Choose a subject from the sidebar to start learning</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ContentPlayer
        topic={selectedTopic}
        isOpen={isPlayerOpen}
        onClose={handlePlayerClose}
        onComplete={handleTopicComplete}
        onNext={handleNextTopic}
        onDifficultyRate={handleDifficultyRate}
        isCompleted={selectedTopic ? (userProgress.get(selectedTopic.id) || false) : false}
        canProceedToNext={selectedTopic && selectedSubjectData ? (() => {
          const subjectProgress: SubjectProgression = {
            id: selectedSubjectData.id,
            name: selectedSubjectData.name,
            chapters: selectedSubjectData.chapters.map(ch => ({
              id: ch.id,
              name: ch.name,
              topics: ch.topics.map(t => ({
                id: t.id,
                name: t.name,
                completed: userProgress.get(t.id) || false
              }))
            }))
          };

          const currentTopicForProgression = {
            id: selectedTopic.id,
            name: selectedTopic.name,
            completed: selectedTopic.completed
          };

          const completedTopicsSet = new Set<string>();
          userProgress.forEach((completed, topicId) => {
            if (completed) completedTopicsSet.add(topicId);
          });

          return canNavigateToNext(currentTopicForProgression, subjectProgress, completedTopicsSet);
        })() : false}
      />
    </div>
  );
}
