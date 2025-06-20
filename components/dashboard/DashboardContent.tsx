'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, BookOpen, Users, Clock, ChevronRight } from "lucide-react";
import { useClassData } from '@/hooks/useClassData';

interface ClassWithSubjects {
  id: number;
  name: string;
  description: string;
  subjects: Array<{
    id: string;
    name: string;
    chapters: Array<{
      id: string;
      name: string;
      topics: Array<{
        id: string;
        name: string;
      }>;
    }>;
  }>;
}

export function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { classes, userProgress, loading, error } = useClassData();

  const handleClassClick = (classId: number) => {
    router.push(`/dashboard/class/${classId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Classes</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Classes Available</h2>
          <p className="text-muted-foreground">Classes will appear here once they&apos;re added.</p>
        </div>
      </div>
    );
  }

  const calculateClassProgress = (classData: ClassWithSubjects) => {
    if (!classData.subjects || !Array.isArray(classData.subjects)) return 0;
    
    const allTopics = classData.subjects.flatMap((s) => 
      s.chapters?.flatMap((ch) => ch.topics || []) || []
    );
    
    if (allTopics.length === 0) return 0;
    
    const completedCount = allTopics.filter((topic) => userProgress.get(topic.id)).length;
    return Math.round((completedCount / allTopics.length) * 100);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}!
            </h1>
            <p className="text-muted-foreground">Manage your learning journey</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => logout()}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Class Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
          {classes.map((cls) => {
            const progress = calculateClassProgress(cls);
            const subjectCount = cls.subjects?.length || 0;
            const chapterCount = cls.subjects?.reduce((acc, s) => acc + (s.chapters?.length || 0), 0) || 0;

            return (
              <Card 
                key={cls.id}
                className="relative cursor-pointer hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 border-0 shadow-lg bg-white group overflow-hidden"
                onClick={() => handleClassClick(cls.id)}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="w-full h-full bg-gradient-to-br from-current to-transparent" />
                </div>

                <CardHeader className="pb-4 relative">
                  {/* Icon Section */}
                  <div className="w-full h-36 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-6 relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                    <BookOpen className="h-16 w-16 text-white drop-shadow-lg" />
                    <div className="absolute inset-0 bg-white/10 rounded-xl" />
                    
                    {/* Floating Elements */}
                    <div className="absolute top-3 right-3 w-2 h-2 bg-white/30 rounded-full animate-pulse" />
                    <div className="absolute bottom-4 left-4 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-300" />
                    <div className="absolute top-1/2 left-3 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse delay-700" />
                  </div>

                  {/* Title and Description */}
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                      {cls.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 leading-relaxed">{cls.description}</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 relative">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
                      <Users className="h-4 w-4 text-gray-600" />
                      <div>
                        <div className="text-xs text-gray-500">Subjects</div>
                        <div className="font-semibold text-gray-800">{subjectCount}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <div>
                        <div className="text-xs text-gray-500">Chapters</div>
                        <div className="font-semibold text-gray-800">{chapterCount}</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Progress</span>
                      <span className="text-xs font-medium text-gray-700">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between p-3 bg-white/80 rounded-lg group-hover:bg-white/90 transition-all">
                      <span className="text-sm font-medium text-gray-700">Start Learning</span>
                      <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gray-700 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </CardContent>

                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-lg" />
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
