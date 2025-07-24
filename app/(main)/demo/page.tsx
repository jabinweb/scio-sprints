'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Play, Clock, Star, Users, GraduationCap, ChevronRight } from 'lucide-react';
import { classData } from '@/data/classData';

export default function DemoPage() {
  const router = useRouter();

  const handleClassClick = (classId: number) => {
    router.push(`/demo/class/${classId}`);
  };

  const calculateClassProgress = (classId: number) => {
    const classInfo = classData[classId as keyof typeof classData];
    if (!classInfo) return 0;
    
    const allTopics = classInfo.subjects.flatMap(s => 
      s.chapters.flatMap(ch => ch.topics)
    );
    
    if (allTopics.length === 0) return 0;
    
    const completedCount = allTopics.filter(topic => topic.completed).length;
    return Math.round((completedCount / allTopics.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white pt-28 pb-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Interactive Demo - ScioSprints Learning Platform</h3>
              <p className="text-sm text-blue-100">Experience our learning platform with sample content across all classes</p>
            </div>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => router.push('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>

      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5" />
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Explore All Classes
              </h1>
              <p className="text-gray-600">Choose any class to experience our interactive learning content</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Available Classes</p>
                  <p className="text-3xl font-bold">{Object.keys(classData).length}</p>
                </div>
                <BookOpen className="w-10 h-10 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Subjects</p>
                  <p className="text-3xl font-bold">
                    {Object.values(classData).reduce((acc, cls) => acc + cls.subjects.length, 0)}
                  </p>
                </div>
                <Users className="w-10 h-10 text-green-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Demo Progress</p>
                  <p className="text-3xl font-bold">
                    {Math.round(Object.keys(classData).reduce((acc, key) => 
                      acc + calculateClassProgress(parseInt(key)), 0) / Object.keys(classData).length)}%
                  </p>
                </div>
                <Star className="w-10 h-10 text-purple-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Class Cards Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Demo Classes</h2>
          <p className="text-gray-600">
            Click on any class to explore its interactive content and learning experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(classData).map(([classId, classInfo]) => {
            const progress = calculateClassProgress(parseInt(classId));
            const subjectCount = classInfo.subjects.length;
            const chapterCount = classInfo.subjects.reduce((acc, s) => acc + s.chapters.length, 0);

            return (
              <Card 
                key={classId}
                className="group relative overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer bg-white/80 backdrop-blur-sm"
                onClick={() => handleClassClick(parseInt(classId))}
              >
                {/* Demo Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Demo
                  </div>
                </div>

                <CardHeader className="relative z-1 pb-4">
                  {/* Icon Section */}
                  <div className="relative mb-6">
                    <div className="w-full h-32 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500 shadow-lg">
                      <BookOpen className="h-12 w-12 text-white drop-shadow-lg z-10" />
                      
                      {/* Animated background elements */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                      <div className="absolute top-2 right-2 w-3 h-3 bg-white/20 rounded-full animate-pulse" />
                      <div className="absolute bottom-3 left-3 w-2 h-2 bg-white/30 rounded-full animate-pulse delay-300" />
                      <div className="absolute top-1/2 left-2 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse delay-700" />

                      {/* Progress indicator */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white/60 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Title and Description */}
                  <div className="space-y-2">
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                      {classInfo.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 group-hover:text-gray-700 transition-colors">
                      {classInfo.description}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg border border-gray-100 group-hover:bg-white/80 transition-colors">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Users className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-medium">Subjects</div>
                        <div className="text-sm font-bold text-gray-900">{subjectCount}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg border border-gray-100 group-hover:bg-white/80 transition-colors">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <Clock className="h-3.5 w-3.5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-medium">Chapters</div>
                        <div className="text-sm font-bold text-gray-900">{chapterCount}</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-600">Demo Progress</span>
                      <span className="text-xs font-bold text-gray-900">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-sm"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between p-4 rounded-xl border transition-all bg-gradient-to-r from-amber-50 to-orange-50 border-orange-200 group-hover:from-orange-50 group-hover:to-amber-50 group-hover:border-orange-300">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg transition-colors bg-orange-100 group-hover:bg-orange-200">
                          <Play className="h-3.5 w-3.5 text-orange-600" />
                        </div>
                        <span className="text-sm font-semibold transition-colors text-orange-700 group-hover:text-orange-800">
                          Explore Demo
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 transition-all group-hover:translate-x-1 text-orange-400 group-hover:text-orange-600" />
                    </div>
                  </div>
                </CardContent>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}