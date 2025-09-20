'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Star, Zap, BookOpen } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  price?: number; // Price in paisa
  currency?: string; // Currency (INR, USD, etc.)
  isSubscribed?: boolean; // Whether user already has this subject
  subscriptionType?: 'school' | 'class_subscription' | 'subject_subscription'; // How they have access
  chapters: Array<{
    id: string;
    name: string;
    topics: Array<{ id: string; name: string; }>;
  }>;
}

interface ClassData {
  id: number;
  name: string;
  description: string;
  price: number;
  currency?: string; // Currency (INR, USD, etc.)
  subjects: Subject[];
}

interface SubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  classData: ClassData;
  onSubscribe: (type: 'class' | 'subject', options: { classId?: number; subjectId?: string; amount: number }) => void;
}

export const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({
  open,
  onClose,
  classData,
  onSubscribe
}) => {
  const { data: session } = useSession();
  const user = session?.user;
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  
  // Check if user has class subscription (all subjects subscribed via class_subscription)
  const hasClassSubscription = classData.subjects.every(subject => 
    subject.isSubscribed && subject.subscriptionType === 'class_subscription'
  );
  
  // Check if user has any subject subscriptions (for upgrade scenario)
  const hasSubjectSubscriptions = classData.subjects.some(subject => 
    subject.isSubscribed && subject.subscriptionType === 'subject_subscription'
  );
  
  // Check if this is an upgrade scenario (has some subject subscriptions but not full class)
  const isUpgradeScenario = hasSubjectSubscriptions && !hasClassSubscription;
  
  // Get unsubscribed subjects for individual subscription tab
  const unsubscribedSubjects = classData.subjects.filter(subject => !subject.isSubscribed);
  const subscribedSubjects = classData.subjects.filter(subject => subject.isSubscribed);
  
  // Set default tab based on subscription status
  const [subscriptionType, setSubscriptionType] = useState<'class' | 'subjects'>(
    hasClassSubscription || unsubscribedSubjects.length < classData.subjects.length ? 'subjects' : 'class'
  );
  
  const [isProcessing, setIsProcessing] = useState(false);

  const classPrice = classData.price / 100; // Convert from paisa to rupees
  
  // Calculate total price for selected subjects using their individual prices
  const selectedSubjectsPrice = Array.from(selectedSubjects).reduce((total, subjectId) => {
    const subject = classData.subjects.find(s => s.id === subjectId);
    const subjectPriceInRupees = (subject?.price || 7500) / 100; // Default to ₹75 if not set
    return total + subjectPriceInRupees;
  }, 0);

  const handleSubjectToggle = (subjectId: string) => {
    // Only allow toggling unsubscribed subjects
    const subject = classData.subjects.find(s => s.id === subjectId);
    if (subject?.isSubscribed) return;
    
    const newSelected = new Set(selectedSubjects);
    if (newSelected.has(subjectId)) {
      newSelected.delete(subjectId);
    } else {
      newSelected.add(subjectId);
    }
    setSelectedSubjects(newSelected);
  };

  const handleClassSubscribe = async () => {
    if (!user) return;
    setIsProcessing(true);
    
    try {
      // Call the existing class payment API
      const response = await fetch('/api/payment/class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: classData.id,
          userId: user.id
        })
      });
      
      const orderData = await response.json();
      if (!response.ok) throw new Error(orderData.error);
      
      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        throw new Error('Payment system not available. Please refresh the page and try again.');
      }
      
      // Initialize Razorpay payment
      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Scio Labs',
        description: `${classData.name} - Full Access`,
        order_id: orderData.orderId,
        handler: async (paymentResponse: RazorpayResponse) => {
          // Verify payment
          const verifyResponse = await fetch('/api/payment/class/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...paymentResponse,
              userId: user.id,
              classId: classData.id
            })
          });
          
          if (verifyResponse.ok) {
            onSubscribe('class', { classId: classData.id, amount: classData.price });
            onClose();
          }
        },
        prefill: {
          name: user.name || user.email?.split('@')[0] || '',
          email: user.email || ''
        },
        theme: { color: '#3B82F6' }
      });
      
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('Already subscribed')) {
          // Show a more helpful message to the user
          const message = `You already have an active subscription to this class! 
          
If you're still seeing limited access, please:
1. Refresh the page to update your access status
2. Log out and log back in
3. Contact support if the issue persists

Would you like to refresh the page now?`;
          
          if (confirm(message)) {
            window.location.reload();
          }
          onClose();
        } else {
          alert(`Payment error: ${error.message}`);
        }
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubjectSubscribe = async () => {
    if (!user || selectedSubjects.size === 0) return;
    setIsProcessing(true);
    
    try {
      // For now, handle one subject at a time
      const subjectId = Array.from(selectedSubjects)[0];
      const subject = classData.subjects.find(s => s.id === subjectId);
      
      const response = await fetch('/api/payment/subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          userId: user.id,
          amount: subject?.price || 7500 // Use subject's own price in paisa
        })
      });
      
      const orderData = await response.json();
      if (!response.ok) throw new Error(orderData.error);
      
      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        throw new Error('Payment system not available. Please refresh the page and try again.');
      }
      
      // Initialize Razorpay payment
      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Scio Labs',
        description: `${subject?.name} - Individual Subject Access`,
        order_id: orderData.orderId,
        handler: async (paymentResponse: RazorpayResponse) => {
          // Verify payment
          const verifyResponse = await fetch('/api/payment/subject/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...paymentResponse,
              userId: user.id,
              subjectId
            })
          });
          
          if (verifyResponse.ok) {
            onSubscribe('subject', { subjectId, amount: subject?.price || 7500 });
            onClose();
          }
        },
        prefill: {
          name: user.name || user.email?.split('@')[0] || '',
          email: user.email || ''
        },
        theme: { color: '#8B5CF6' }
      });
      
      razorpay.open();
    } catch (error) {
      console.error('Subject payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalTopics = classData.subjects.reduce((acc, subject) => 
    acc + subject.chapters.reduce((chAcc, chapter) => chAcc + chapter.topics.length, 0), 0
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-6 w-6 text-blue-600" />
            Subscribe to {classData.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={subscriptionType} onValueChange={(value) => setSubscriptionType(value as 'class' | 'subjects')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="class" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Full Class Access
            </TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Individual Subjects
            </TabsTrigger>
          </TabsList>

          <TabsContent value="class" className="space-y-4">
            {hasClassSubscription ? (
              // User already has class subscription
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Class Access Active
                    </span>
                    <Badge className="bg-green-600 text-white">Subscribed</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">You have full access!</div>
                    <div className="text-sm text-green-600">Enjoy all subjects in this class</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Access to all {classData.subjects.length} subjects</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{totalTopics} interactive topics and exercises</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Unlimited access and progress tracking</span>
                    </div>
                  </div>

                  <Button 
                    onClick={onClose}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Continue Learning
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // User doesn't have class subscription - show subscription option
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-blue-600" />
                      {isUpgradeScenario ? 'Upgrade to Full Access' : 'Complete Class Access'}
                    </span>
                    <Badge className="bg-blue-600 text-white">
                      {isUpgradeScenario ? 'Upgrade' : 'Best Value'}
                    </Badge>
                  </CardTitle>
                  {isUpgradeScenario && (
                    <div className="text-sm text-blue-600 bg-blue-100 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span>
                          You have {subscribedSubjects.length} of {classData.subjects.length} subjects. 
                          Upgrade to get full access to all subjects!
                        </span>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-700">₹{classPrice}</div>
                    <div className="text-sm text-blue-600">One-time payment</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Access to all {classData.subjects.length} subjects</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{totalTopics} interactive topics and exercises</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Unlimited access and progress tracking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Future content updates included</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="text-sm text-gray-600 mb-2">What you get:</div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">{classData.subjects.length}</div>
                        <div className="text-xs text-gray-500">Subjects</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">{classData.subjects.reduce((acc, s) => acc + s.chapters.length, 0)}</div>
                        <div className="text-xs text-gray-500">Chapters</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">{totalTopics}</div>
                        <div className="text-xs text-gray-500">Topics</div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleClassSubscribe}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
                  >
                    {isProcessing 
                      ? 'Processing...' 
                      : isUpgradeScenario 
                        ? `Upgrade to Full Access - ₹${classPrice}` 
                        : `Subscribe for ₹${classPrice}`
                    }
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="subjects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Individual Subjects
                </CardTitle>
                <div className="text-sm text-gray-600">
                  {unsubscribedSubjects.length > 0 
                    ? `Choose from ${unsubscribedSubjects.length} available subjects.`
                    : 'You have access to all subjects in this class!'
                  }
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Show current subscriptions if any */}
                {subscribedSubjects.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-800 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Your Current Access ({subscribedSubjects.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {subscribedSubjects.map((subject) => {
                        const topicCount = subject.chapters.reduce((acc, ch) => acc + ch.topics.length, 0);
                        
                        return (
                          <Card 
                            key={subject.id}
                            className="border-green-200 bg-green-50 opacity-90"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-lg">
                                    {subject.icon}
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-green-800">{subject.name}</h4>
                                    <div className="text-xs text-green-600 flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3" />
                                      {subject.subscriptionType?.replace('_', ' ') || 'active'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-green-700">
                                <BookOpen className="h-4 w-4" />
                                <span>{topicCount} topics available</span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Show available subjects for subscription */}
                {unsubscribedSubjects.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Available for Subscription ({unsubscribedSubjects.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {unsubscribedSubjects.map((subject) => {
                        const isSelected = selectedSubjects.has(subject.id);
                        const topicCount = subject.chapters.reduce((acc, ch) => acc + ch.topics.length, 0);
                        
                        return (
                          <Card 
                            key={subject.id}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                              isSelected 
                                ? 'ring-2 ring-purple-500 border-purple-500 bg-purple-50' 
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                            onClick={() => handleSubjectToggle(subject.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                                    isSelected ? 'bg-purple-200' : 'bg-gray-100'
                                  }`}>
                                    {subject.icon}
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{subject.name}</h4>
                                    <div className="text-xs text-gray-500">{topicCount} topics</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-purple-600">
                                    ₹{(subject.price || 7500) / 100}
                                  </div>
                                  {isSelected && (
                                    <div className="text-xs text-purple-600">Selected</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <BookOpen className="h-4 w-4" />
                                <span>Interactive learning content</span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {/* Selection summary and subscribe button */}
                    {selectedSubjects.size > 0 && (
                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-sm text-gray-600">
                              {selectedSubjects.size} subject{selectedSubjects.size > 1 ? 's' : ''} selected
                            </div>
                            <div className="text-2xl font-bold text-purple-600">
                              ₹{selectedSubjectsPrice}
                            </div>
                          </div>
                          <Button 
                            onClick={handleSubjectSubscribe}
                            disabled={isProcessing || selectedSubjects.size === 0}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            {isProcessing ? 'Processing...' : `Subscribe for ₹${selectedSubjectsPrice}`}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Message when all subjects are subscribed */}
                {unsubscribedSubjects.length === 0 && subscribedSubjects.length > 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      You have access to all subjects!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Continue your learning journey with full access to this class.
                    </p>
                    <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
                      Continue Learning
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          <div className="text-sm text-gray-500">
            💳 Test Mode - Use card: 4111 1111 1111 1111
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
