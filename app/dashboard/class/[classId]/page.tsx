'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, Play, Clock, CheckCircle, Lock, Video, FileText, Headphones } from 'lucide-react';
import { useClassData, type DbTopic } from '@/hooks/useClassData';
import { ContentPlayer } from '@/components/learning/ContentPlayer';

const getTopicIcon = (type: string) => {
  switch (type) {
    case 'video': return <Video className="h-4 w-4" />;
    case 'interactive': return <Play className="h-4 w-4" />;
    case 'exercise': return <FileText className="h-4 w-4" />;
    case 'audio': return <Headphones className="h-4 w-4" />;
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

export default function ClassPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<DbTopic & { completed: boolean } | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  
  const { currentClass, userProgress, loading, error, markTopicComplete } = useClassData(classId);

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
    // Convert DbTopic to the expected format with proper content structure
    const topicWithCompleted: DbTopic & { completed: boolean } = {
      ...topic,
      completed: userProgress.get(topic.id) || false,
      content: topic.content ? {
        type: topic.content.type, // Keep contentType as is
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Progress */}
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
              <h1 className="text-2xl md:text-3xl font-bold">{currentClass.name}</h1>
              <p className="text-muted-foreground">{currentClass.description}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Subject Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Subjects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentClass.subjects.map((subject) => (
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
                          <div className="text-xs font-medium">{getSubjectProgress(subject)}%</div>
                          <div className="w-8 h-1 bg-white/30 rounded-full mt-1">
                            <div 
                              className="h-full bg-white rounded-full transition-all"
                              style={{ width: `${getSubjectProgress(subject)}%` }}
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
                              
                              return (
                                <div
                                  key={topic.id}
                                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all group ${
                                    isCompleted 
                                      ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                  }`}
                                  onClick={() => handleTopicClick(topic as DbTopic)}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-200' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                                        {getTopicIcon(topic.type)}
                                      </div>
                                      <Badge variant={topic.type === 'video' ? 'default' : topic.type === 'interactive' ? 'secondary' : 'outline'} className="text-xs">
                                        {topic.type}
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
    