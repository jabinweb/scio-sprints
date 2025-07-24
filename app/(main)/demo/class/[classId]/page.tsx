'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, Play, Clock, CheckCircle, Lock, Video, FileText, Headphones, Star, Trophy } from 'lucide-react';
import { classData } from '@/data/classData';
import type { Topic } from '@/data/classData';

const getTopicIcon = (contentType: string | undefined) => {
  switch (contentType) {
    case 'video': return <Video className="h-4 w-4" />;
    case 'external_link': return <Play className="h-4 w-4" />;
    case 'pdf': return <FileText className="h-4 w-4" />;
    case 'text': return <FileText className="h-4 w-4" />;
    case 'interactive_widget': return <Play className="h-4 w-4" />;
    case 'audio': return <Headphones className="h-4 w-4" />;
    default: return <BookOpen className="h-4 w-4" />;
  }
};

export default function DemoClassPage() {
  const params = useParams();
  const router = useRouter();
  const classId = parseInt(params.classId as string);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedSubjectName, setCompletedSubjectName] = useState<string>('');
  
  // Get class data
  const demoClass = classData[classId as keyof typeof classData];
  const selectedSubjectData = demoClass?.subjects.find(s => s.id === selectedSubject);

  useEffect(() => {
    // Auto-select first unlocked subject
    if (demoClass) {
      const firstUnlockedSubject = demoClass.subjects.find(s => !s.isLocked);
      if (firstUnlockedSubject) {
        setSelectedSubject(firstUnlockedSubject.id);
      }
    }
  }, [demoClass]);

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsPlayerOpen(true);
  };

  const handlePlayerClose = () => {
    setIsPlayerOpen(false);
    setSelectedTopic(null);
  };

  const handleTopicComplete = (topicId: string) => {
    const newCompletedTopics = new Set(completedTopics);
    newCompletedTopics.add(topicId);
    setCompletedTopics(newCompletedTopics);

    // Check if subject is completed
    if (selectedSubjectData) {
      const allTopicIds = selectedSubjectData.chapters.flatMap(ch => ch.topics.map(t => t.id));
      const completedCount = allTopicIds.filter(id => newCompletedTopics.has(id)).length;
      
      if (completedCount === allTopicIds.length) {
        setCompletedSubjectName(selectedSubjectData.name);
        setShowCompletionModal(true);
      }
    }
  };

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Class Not Found</h1>
          <Button onClick={() => router.push('/demo')}>
            Back to Demo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white pb-6 pt-28">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Interactive Demo - {demoClass.name}</h3>
              <p className="text-sm text-blue-100">Experience our learning platform with sample content</p>
            </div>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => router.push('/demo')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Classes
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{demoClass.name}</h1>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Demo Version
                  </span>
                </div>
                <p className="text-muted-foreground">{demoClass.description}</p>
                <p className="text-sm text-green-600 mt-1">Try our interactive learning experience!</p>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {demoClass.subjects.filter(s => !s.isLocked).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Subjects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {demoClass.subjects.reduce((acc, s) => acc + s.chapters.length, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Chapters</div>
                </div>
              </div>
            </div>
            
            {/* Overall Progress */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Demo Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(demoClass.subjects.reduce((acc, s) => acc + getSubjectProgress(s.id), 0) / demoClass.subjects.length)}%
                </span>
              </div>
              <Progress value={Math.round(demoClass.subjects.reduce((acc, s) => acc + getSubjectProgress(s.id), 0) / demoClass.subjects.length)} className="h-2" />
            </div>
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
                              {chapter.topics.map((topic: Topic) => {
                                const isCompleted = topic.completed;
                                const contentType = topic.content?.type;
                                
                                return (
                                  <div
                                    key={topic.id}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all group ${
                                      isCompleted 
                                        ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                    }`}
                                    onClick={() => handleTopicClick(topic)}
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
                  <p className="text-muted-foreground">Choose a subject from the sidebar to start exploring</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Demo Content Player Modal */}
      {isPlayerOpen && selectedTopic && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedTopic.name}</h3>
                  <p className="text-sm text-muted-foreground">Demo Content - {selectedTopic.duration}</p>
                </div>
                <Button variant="outline" onClick={handlePlayerClose}>
                  Close
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {getTopicIcon(selectedTopic.content?.type)}
                </div>
                <h4 className="text-lg font-semibold mb-2">Interactive Content Preview</h4>
                <p className="text-muted-foreground mb-4">
                  This is a demo of our interactive learning content. In the full version, you would see:
                </p>
                <ul className="text-sm text-left max-w-md mx-auto space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Interactive videos and animations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Gamified exercises and quizzes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Progress tracking and achievements
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Personalized learning paths
                  </li>
                </ul>
                <div className="mt-6 space-y-3">
                  <Button 
                    onClick={() => {
                      handleTopicComplete(selectedTopic.id);
                      handlePlayerClose();
                    }}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 mr-2"
                  >
                    Mark as Complete (Demo)
                  </Button>
                  <Button 
                    onClick={() => router.push('/')}
                    variant="outline"
                    className="ml-2"
                  >
                    Get Full Access
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
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
                  onClick={() => router.push('/')}
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
    </div>
  );
}
