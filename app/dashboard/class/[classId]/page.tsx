'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, Play, Clock, CheckCircle, Lock, Video, FileText, Headphones, Settings } from 'lucide-react';
import { useClassData, type DbTopic } from '@/hooks/useClassData';
import { ContentPlayer } from '@/components/learning/ContentPlayer';
import { useAuth } from '@/contexts/AuthContext';
import { ClassSubscriptionManager } from '@/components/dashboard/ClassSubscriptionManager';

const getTopicIcon = (contentType: string | undefined) => {
  switch (contentType) {
    case 'VIDEO': return <Video className="h-4 w-4" />;
    case 'EXTERNAL_LINK': return <Play className="h-4 w-4" />;
    case 'PDF': return <FileText className="h-4 w-4" />;
    case 'TEXT': return <FileText className="h-4 w-4" />;
    case 'INTRACTIVE_WIGET': return <Play className="h-4 w-4" />;
    case 'AUDIO': return <Headphones className="h-4 w-4" />;
    default: return <BookOpen className="h-4 w-4" />;
  }
};

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
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<DbTopic & { completed: boolean } | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [accessMessage, setAccessMessage] = useState<string>('');
  const [accessType, setAccessType] = useState<string>('');
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  const [subjectAccess, setSubjectAccess] = useState<Record<string, boolean>>({});
  
  const { currentClass, userProgress, loading, error, markTopicComplete } = useClassData(classId);

  // Check if user has access to this specific class and subjects
  useEffect(() => {
    const checkClassAccess = async () => {
      if (!user?.id || !classId) return;

      try {
        // Use the new enhanced API endpoint
        const response = await fetch(`/api/classes/${classId}/access?userId=${user.id}`);
        const data: ClassAccessResponse = await response.json();

        if (response.ok) {
          setHasAccess(data.hasFullAccess || data.subjectAccess.some((s: SubjectAccessData) => s.hasAccess));
          setAccessType(data.accessType);
          setAccessMessage(
            data.hasFullAccess 
              ? `Full access via ${data.accessType}`
              : data.subjectAccess.some((s: SubjectAccessData) => s.hasAccess)
              ? 'Partial access - some subjects available'
              : 'No access to this class'
          );

          // Set subject-level access
          const subjectAccessMap: Record<string, boolean> = {};
          data.subjectAccess.forEach((subject: SubjectAccessData) => {
            subjectAccessMap[subject.id] = subject.hasAccess;
          });
          setSubjectAccess(subjectAccessMap);
        } else {
          setHasAccess(false);
          setAccessMessage(data.error || 'Access denied');
        }
      } catch (error) {
        console.error('Error checking class access:', error);
        setHasAccess(false);
        setAccessMessage('Unable to verify access');
      }
    };

    checkClassAccess();
  }, [user?.id, classId]);

  useEffect(() => {
    // Auto-select first unlocked subject
    const firstUnlockedSubject = currentClass?.subjects.find(s => !s.isLocked);
    if (firstUnlockedSubject) {
      setSelectedSubject(firstUnlockedSubject.id);
    }
  }, [currentClass]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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
      } : {}
    };
    setSelectedTopic(topicWithCompleted);
    setIsPlayerOpen(true);
  };

  const handleTopicComplete = async () => {
    if (selectedTopic) {
      await markTopicComplete(selectedTopic.id, true);
      setIsPlayerOpen(false);
      setSelectedTopic(null);
    }
  };

  const handlePlayerClose = () => {
    setIsPlayerOpen(false);
    setSelectedTopic(null);
  };

  const getSubjectProgress = (subject: SubjectData) => {
    const allTopics = subject.chapters.flatMap((ch: ChapterData) => ch.topics);
    const completedCount = allTopics.filter((topic: DbTopic) => userProgress.get(topic.id)).length;
    return allTopics.length > 0 ? Math.round((completedCount / allTopics.length) * 100) : 0;
  };

  const selectedSubjectData = currentClass.subjects.find(s => s.id === selectedSubject);

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mb-4">{accessMessage}</p>
          <div className="space-y-2">
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
            <p className="text-sm text-gray-500">
              Contact your school administrator or purchase a subscription to access this content.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Access Info */}
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
          
          {/* Overall Progress */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(currentClass.subjects.reduce((acc, s) => acc + getSubjectProgress(s), 0) / currentClass.subjects.length)}%
              </span>
            </div>
            <Progress value={Math.round(currentClass.subjects.reduce((acc, s) => acc + getSubjectProgress(s), 0) / currentClass.subjects.length)} className="h-2" />
          </div>
        </div>

        {/* Subscription Management Panel */}
        {showSubscriptionManager && (
          <div className="mb-6">
            <ClassSubscriptionManager 
              classId={parseInt(classId)}
              onSubscribe={(type, options) => {
                console.log('Subscription request:', type, options);
                // TODO: Handle subscription logic
                // This will integrate with your payment system
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
                      <h2 className="text-2xl">{selectedSubjectData.name}</h2>
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
                      const chapterProgress = Math.round(
                        (chapter.topics.filter(t => userProgress.get(t.id)).length / chapter.topics.length) * 100
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
                            {chapter.topics.map((topic) => {
                              const isCompleted = userProgress.get(topic.id) || false;
                              const contentType = topic.content?.contentType;
                              const hasSubjectAccess = subjectAccess[selectedSubject] !== false;
                              
                              return (
                                <div
                                  key={topic.id}
                                  className={`p-4 rounded-xl border-2 transition-all group ${
                                    !hasSubjectAccess 
                                      ? 'border-red-200 bg-red-50 opacity-60 cursor-not-allowed'
                                      : isCompleted 
                                      ? 'border-green-200 bg-green-50 hover:bg-green-100 cursor-pointer' 
                                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md cursor-pointer'
                                  }`}
                                  onClick={() => hasSubjectAccess && handleTopicClick(topic as DbTopic)}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-200' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                                        {getTopicIcon(contentType)}
                                      </div>
                                      <Badge variant={
                                        contentType === 'video' ? 'default' : 
                                        contentType === 'external_link' ? 'secondary' : 
                                        contentType === 'interactive_widget' ? 'secondary' : 
                                        'outline'
                                      } className="text-xs">
                                        {contentType || topic.type}
                                      </Badge>
                                    </div>
                                    {isCompleted ? (
                                      <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                      <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                                    )}
                                  </div>
                                  
                                  <h4 className="font-medium text-sm mb-2 line-clamp-2">{topic.name}</h4>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      <span>{topic.duration}</span>
                                    </div>
                                    <Play className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                                  </div>
                                </div>
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
      />
    </div>
  );
}
