'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Play, Clock, Star, Users, GraduationCap, ChevronRight } from 'lucide-react';

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

  const formatPrice = (price: number, currency: string = 'INR') => {
    const amount = price / 100; // Convert from paise/cents to main currency
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${amount.toLocaleString()}`;
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
                <h3 className="font-semibold text-gray-100">Interactive Demo - ScioSprints Learning Platform</h3>
                <p className="text-sm text-blue-100">Experience our learning platform with sample content across all classes</p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => router.push('/')}
              className="gap-2 w-fit"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Demo Classes...</h2>
            <p className="text-gray-500">Fetching real content from our database</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Demo Unavailable</h2>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Available Classes</p>
                      <p className="text-3xl text-gray-200 font-bold">{classes.length}</p>
                    </div>
                    <BookOpen className="w-10 h-10 text-blue-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Total Subjects</p>
                      <p className="text-3xl text-gray-200 font-bold">
                        {classes.reduce((acc, cls) => acc + cls.subjectCount, 0)}
                      </p>
                    </div>
                    <Users className="w-10 h-10 text-green-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Average Progress</p>
                      <p className="text-3xl text-gray-200 font-bold">
                        {classes.length > 0 
                          ? Math.round(classes.reduce((acc, cls) => acc + calculateClassProgress(cls), 0) / classes.length)
                          : 0}%
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
                Explore our interactive learning platform with real content from different grade levels
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {classes.map((classInfo) => {
                const progress = calculateClassProgress(classInfo);
                const subjectCount = classInfo.subjectCount;
                const chapterCount = classInfo.chapterCount;

                return (
                  <Card 
                    key={classInfo.id}
                    className="group relative overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer bg-white"
                    onClick={() => handleClassClick(classInfo.id)}
                  >
                    <CardHeader className="relative z-1 pb-4">
                      {/* Icon Section */}
                      <div className="relative mb-6">
                        <div className="w-full h-32 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500 shadow-lg">
                          <GraduationCap className="h-12 w-12 text-white drop-shadow-lg z-10" />
                          
                          {/* Animated background elements */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                          <div className="absolute top-2 right-2 w-3 h-3 bg-white/20 rounded-full animate-pulse" />
                          <div className="absolute bottom-3 left-3 w-2 h-2 bg-white/30 rounded-full animate-pulse delay-300" />
                          
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
                      {/* Price Display */}
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-green-100 rounded-lg">
                            <Star className="h-3.5 w-3.5 text-green-600" />
                          </div>
                          <div>
                            <div className="text-xs text-green-600 font-medium">Demo Price</div>
                            <div className="text-sm font-bold text-green-800">
                              {formatPrice(classInfo.price, classInfo.currency)}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                          Live Data
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 group-hover:bg-gray-100 transition-colors">
                          <div className="p-1.5 bg-blue-100 rounded-lg">
                            <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">Subjects</div>
                            <div className="text-sm font-bold text-gray-900">{subjectCount}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 group-hover:bg-gray-100 transition-colors">
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
                        <div className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-gray-50 to-blue-50 border-gray-100 group-hover:from-blue-50 group-hover:to-indigo-50 group-hover:border-blue-200 transition-all">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-100 group-hover:bg-blue-200 rounded-lg transition-colors">
                              <Play className="h-3.5 w-3.5 text-blue-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
                              Try Demo
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
                        </div>
                      </div>
                    </CardContent>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
                  </Card>
                );
              })}
            </div>

            {/* Empty State */}
            {classes.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Demo Classes Available</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Demo classes will appear here once they&apos;re added to the database.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}