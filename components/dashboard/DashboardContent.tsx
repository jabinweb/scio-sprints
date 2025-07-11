'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, BookOpen, Users, Clock, ChevronRight, Star, Play, GraduationCap } from "lucide-react";
import { useClassData } from '@/hooks/useClassData';
import { supabase } from '@/lib/supabase';
import { PaymentDialog } from '@/components/dashboard/PaymentDialog';
import type { DbClass } from '@/hooks/useClassData';

interface ClassWithSubjects {
  id: number;
  name: string;
  description: string;
  price?: number; // Keep as number
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
  const [selectedClass, setSelectedClass] = useState<ClassWithSubjects | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [classSubscriptions, setClassSubscriptions] = useState<Map<number, boolean>>(new Map());
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);

  // Check user's subscriptions for all classes
  useEffect(() => {
    const checkAllSubscriptions = async () => {
      if (!user?.id || !classes?.length) {
        setSubscriptionsLoading(false);
        return;
      }

      try {
        const subscriptionChecks = await Promise.all(
          classes.map(async (cls) => {
            const { data: subscription } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('userId', user.id)
              .eq('classId', cls.id)
              .eq('status', 'ACTIVE')
              .gte('endDate', new Date().toISOString())
              .maybeSingle();

            return { classId: cls.id, hasSubscription: !!subscription };
          })
        );

        const subscriptionMap = new Map();
        subscriptionChecks.forEach(({ classId, hasSubscription }) => {
          subscriptionMap.set(classId, hasSubscription);
        });

        setClassSubscriptions(subscriptionMap);
      } catch (error) {
        console.error('Error checking subscriptions:', error);
      } finally {
        setSubscriptionsLoading(false);
      }
    };

    checkAllSubscriptions();
  }, [user?.id, classes]);

  const handleClassClick = (classData: ClassWithSubjects) => {
    const hasSubscription = classSubscriptions.get(classData.id);
    
    if (hasSubscription) {
      // User has subscription, navigate directly to class
      router.push(`/dashboard/class/${classData.id}`);
    } else {
      // Show payment dialog for this class
      setSelectedClass(classData);
      setShowPaymentDialog(true);
    }
  };

  const handlePaymentDialogClose = () => {
    setShowPaymentDialog(false);
    setSelectedClass(null);
  };

  if (loading || subscriptionsLoading) {
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

  // Helper to convert DbClass to ClassWithSubjects (price is already number)
  const toClassWithSubjects = (cls: DbClass): ClassWithSubjects => ({
    ...cls,
    price: cls.price, // No conversion needed, already a number
  });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-white border-b border-gray-200">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5" />
          <div className="relative max-w-7xl mx-auto px-6 py-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'}!
                  </h1>
                  <p className="text-gray-600 mt-1">Continue your learning journey</p>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={() => logout()}
                className="gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Available Classes</p>
                    <p className="text-3xl font-bold">{classes.length}</p>
                  </div>
                  <BookOpen className="w-10 h-10 text-blue-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Subjects</p>
                    <p className="text-3xl font-bold">{classes.reduce((acc, cls) => acc + (cls.subjects?.length || 0), 0)}</p>
                  </div>
                  <Users className="w-10 h-10 text-green-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Avg Progress</p>
                    <p className="text-3xl font-bold">
                      {classes.length > 0 
                        ? Math.round(classes.reduce((acc, cls) => acc + calculateClassProgress(toClassWithSubjects(cls)), 0) / classes.length)
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Classes</h2>
            <p className="text-gray-600">Select a class to start or continue learning</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {classes.map((cls) => {
              const safeCls = toClassWithSubjects(cls);
              const priceNum = safeCls.price || 0;
              const progress = calculateClassProgress(safeCls);
              const subjectCount = safeCls.subjects?.length || 0;
              const chapterCount = safeCls.subjects?.reduce((acc, s) => acc + (s.chapters?.length || 0), 0) || 0;
              const hasSubscription = classSubscriptions.get(safeCls.id) || false;

              return (
                <Card 
                  key={safeCls.id}
                  className="group relative overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer bg-white/80 backdrop-blur-sm"
                  onClick={() => handleClassClick(safeCls)}
                >
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-60 group-hover:opacity-80 transition-opacity" />
                  
                  {/* Subscription Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    {hasSubscription ? (
                      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Subscribed
                      </div>
                    ) : priceNum > 0 ? (
                      ''
                    ) : (
                      <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                        Free
                      </div>
                    )}
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
                        {cls.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 group-hover:text-gray-700 transition-colors">
                        {cls.description}
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
                        <span className="text-xs font-medium text-gray-600">Learning Progress</span>
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
                      <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        hasSubscription 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 group-hover:from-green-100 group-hover:to-emerald-100'
                          : 'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-100 group-hover:from-blue-50 group-hover:to-indigo-50 group-hover:border-blue-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg transition-colors ${
                            hasSubscription 
                              ? 'bg-green-100 group-hover:bg-green-200'
                              : 'bg-blue-100 group-hover:bg-blue-200'
                          }`}>
                            {hasSubscription ? (
                              <Play className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <Play className="h-3.5 w-3.5 text-blue-600" />
                            )}
                          </div>
                          <span className={`text-sm font-semibold transition-colors ${
                            hasSubscription 
                              ? 'text-green-700 group-hover:text-green-800'
                              : 'text-gray-700 group-hover:text-blue-700'
                          }`}>
                            {hasSubscription 
                              ? 'Continue Learning'
                              : priceNum > 0 
                                ? `Subscribe for ₹${Math.round(priceNum / 100)}`
                                : 'Start Learning'
                            }
                          </span>
                        </div>
                        <ChevronRight className={`h-4 w-4 transition-all group-hover:translate-x-1 ${
                          hasSubscription 
                            ? 'text-green-400 group-hover:text-green-600'
                            : 'text-gray-400 group-hover:text-blue-600'
                        }`} />
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Classes Available</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Classes will appear here once they&apos;re added to the platform. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Dialog - only show if user doesn't have subscription */}
      {selectedClass && !classSubscriptions.get(selectedClass.id) && (
        <PaymentDialog
          defaultOpen={showPaymentDialog}
          onClose={handlePaymentDialogClose}
          classId={selectedClass.id}
          className={selectedClass.name}
          price={selectedClass.price || 29900}
        />
      )}
    </>
  );
}

