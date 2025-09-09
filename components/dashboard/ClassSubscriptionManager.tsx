'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Lock, Star, ArrowRight, Zap, Gift } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SubjectAccess {
  id: string;
  name: string;
  hasAccess: boolean;
  accessType: 'school' | 'class_subscription' | 'subject_subscription' | 'none';
  canUpgrade?: boolean;
}

interface ClassAccessData {
  classId: number;
  className: string;
  classPrice: number;
  hasFullAccess: boolean;
  accessType: string;
  subjectAccess: SubjectAccess[];
  canUpgradeToClass: boolean;
  upgradeOptions?: {
    currentSubjects: string[];
    classPrice: number;
    potentialSavings: number;
  };
}

interface SubscribeOptions {
  subjectId?: string;
  classId?: number;
  fromSubjects?: string[];
  toClassId?: number;
  savings?: number;
}

interface ClassSubscriptionManagerProps {
  classId: number;
  onSubscribe?: (type: 'subject' | 'class' | 'upgrade', options?: SubscribeOptions) => void;
}

export const ClassSubscriptionManager: React.FC<ClassSubscriptionManagerProps> = ({
  classId,
  onSubscribe
}) => {
  const { user } = useAuth();
  const [accessData, setAccessData] = useState<ClassAccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccessData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/classes/${classId}/access?userId=${user.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch access data');
        }

        setAccessData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAccessData();
  }, [user?.id, classId]);

  const handleSubjectSubscribe = (subjectId: string) => {
    onSubscribe?.('subject', { subjectId, classId });
  };

  const handleClassSubscribe = () => {
    onSubscribe?.('class', { classId });
  };

  const handleUpgradeToClass = () => {
    if (accessData?.upgradeOptions) {
      onSubscribe?.('upgrade', {
        fromSubjects: accessData.upgradeOptions.currentSubjects,
        toClassId: classId,
        savings: accessData.upgradeOptions.potentialSavings
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (error || !accessData) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-600 mb-4">{error || 'Failed to load access information'}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Card>
    );
  }

  // If user has full access, show management interface
  if (accessData.hasFullAccess) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Full Access Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700">
            You have {accessData.accessType === 'school' ? 'school-based' : 'subscription-based'} access to all subjects in this class.
          </p>
        </CardContent>
      </Card>
    );
  }

  const subjectsWithAccess = accessData.subjectAccess.filter(s => s.hasAccess);
  const subjectsWithoutAccess = accessData.subjectAccess.filter(s => !s.hasAccess);
  const subjectPrice = Math.ceil(accessData.classPrice / accessData.subjectAccess.length / 100);

  return (
    <div className="space-y-6">
      {/* Upgrade to Full Class Option */}
      {accessData.canUpgradeToClass && accessData.upgradeOptions && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Zap className="h-5 w-5" />
              Upgrade to Full Class Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-700 font-medium">
                  Get access to ALL subjects in {accessData.className}
                </p>
                <p className="text-sm text-purple-600">
                  You currently have {accessData.upgradeOptions.currentSubjects.length} subject subscriptions
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-purple-600" />
                  <span className="text-lg font-bold text-purple-800">
                    Save ₹{Math.abs(accessData.upgradeOptions.potentialSavings / 100)}
                  </span>
                </div>
                <p className="text-sm text-purple-600">vs individual subjects</p>
              </div>
            </div>
            <Button 
              onClick={handleUpgradeToClass}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Upgrade to Full Access - ₹{accessData.classPrice / 100}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Full Class Subscription Option */}
      {!accessData.canUpgradeToClass && subjectsWithoutAccess.length > 1 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Star className="h-5 w-5" />
              Full Class Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 font-medium">
                  Access all {accessData.subjectAccess.length} subjects
                </p>
                <p className="text-sm text-blue-600">
                  Best value for complete learning
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-800">
                  ₹{accessData.classPrice / 100}
                </span>
                <p className="text-sm text-blue-600">
                  vs ₹{subjectPrice * accessData.subjectAccess.length} individual
                </p>
              </div>
            </div>
            <Button 
              onClick={handleClassSubscribe}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Subscribe to Full Class
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Current Access Status */}
      {subjectsWithAccess.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-800">Your Current Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subjectsWithAccess.map(subject => (
                <div key={subject.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">{subject.name}</span>
                  <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                    {subject.accessType.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Subject Subscriptions */}
      {subjectsWithoutAccess.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Subscribe to Individual Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjectsWithoutAccess.map(subject => (
                <Card key={subject.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{subject.name}</h4>
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">₹{subjectPrice}</span>
                      <Button 
                        size="sm"
                        onClick={() => handleSubjectSubscribe(subject.id)}
                        variant="outline"
                      >
                        Subscribe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClassSubscriptionManager;
