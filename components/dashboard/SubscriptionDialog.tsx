'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Star, Zap, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [subscriptionType, setSubscriptionType] = useState<'class' | 'subjects'>('class');
  const [isProcessing, setIsProcessing] = useState(false);

  const classPrice = classData.price / 100; // Convert from paisa to rupees
  
  // Calculate total price for selected subjects using their individual prices
  const selectedSubjectsPrice = Array.from(selectedSubjects).reduce((total, subjectId) => {
    const subject = classData.subjects.find(s => s.id === subjectId);
    const subjectPriceInRupees = (subject?.price || 7500) / 100; // Default to ₹75 if not set
    return total + subjectPriceInRupees;
  }, 0);

  const handleSubjectToggle = (subjectId: string) => {
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
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          email: user.email || ''
        },
        theme: { color: '#3B82F6' }
      });
      
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
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
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
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

  const selectedTopics = Array.from(selectedSubjects).reduce((acc, subjectId) => {
    const subject = classData.subjects.find(s => s.id === subjectId);
    return acc + (subject?.chapters.reduce((chAcc, chapter) => chAcc + chapter.topics.length, 0) || 0);
  }, 0);

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
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-blue-600" />
                    Complete Class Access
                  </span>
                  <Badge className="bg-blue-600 text-white">Best Value</Badge>
                </CardTitle>
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
                  {isProcessing ? 'Processing...' : `Subscribe for ₹${classPrice}`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Choose Individual Subjects
                </CardTitle>
                <div className="text-sm text-gray-600">
                  Select the subjects you want to access. Prices vary by subject.
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {classData.subjects.map((subject) => {
                    const isSelected = selectedSubjects.has(subject.id);
                    const topicCount = subject.chapters.reduce((acc, ch) => acc + ch.topics.length, 0);
                    
                    return (
                      <Card 
                        key={subject.id}
                        className={`cursor-pointer transition-all border-2 ${
                          isSelected 
                            ? 'border-purple-300 bg-purple-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleSubjectToggle(subject.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{subject.icon}</span>
                              <span className="font-medium">{subject.name}</span>
                            </div>
                            {isSelected && (
                              <CheckCircle className="h-5 w-5 text-purple-600" />
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {subject.chapters.length} chapters • {topicCount} topics
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-600">₹{(subject.price || 7500) / 100}</span>
                            <Badge variant={isSelected ? "default" : "outline"} className="text-xs">
                              {isSelected ? "Selected" : "Select"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {selectedSubjects.size > 0 && (
                  <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Selected: {selectedSubjects.size} subjects</span>
                        <span className="text-lg font-bold text-purple-700">₹{selectedSubjectsPrice}</span>
                      </div>
                      <div className="text-sm text-purple-600 mb-3">
                        Access to {selectedTopics} topics across {selectedSubjects.size} subjects
                      </div>
                      <Button 
                        onClick={handleSubjectSubscribe}
                        disabled={selectedSubjects.size === 0 || isProcessing}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        {isProcessing ? 'Processing...' : 'Subscribe to Selected Subjects'}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {selectedSubjects.size === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Select one or more subjects to continue
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
