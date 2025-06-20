'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, UserCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';
import { UniversalTopicForm } from '@/components/admin/UniversalTopicForm';

interface Signup {
  id: string;
  name: string;
  email: string;
  school: string;
  role: string;
  timestamp: string;
}

interface Subscription {
  id: string;
  userId: string;
  paymentId: string;
  amount: number;
  status: string;
  created_at: string;
}

interface RegisteredUser {
  uid: string;
  email: string;
  displayName: string | null;
  creationTime: string;
  lastSignInTime: string | null;
  subscription: Subscription | null;
  hasActiveSubscription: boolean;
}

interface TopicFormData {
  name: string;
  type: string;
  duration: string;
  orderIndex: number;
  chapterId: string;
  content?: {
    contentType: string;
    url?: string;
    videoUrl?: string;
    pdfUrl?: string;
    textContent?: string;
    widgetConfig?: Record<string, unknown>;
  };
}

export default function AdminPage() {
  const { user, userRole, loading } = useAuth();
  const [signups, setSignups] = useState<Signup[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [topicFormOpen, setTopicFormOpen] = useState(false);

  // Enhanced admin check - wait for userRole to be loaded
  const isAdmin = user && userRole === 'ADMIN';
  const isLoadingAuth = loading || (user && userRole === null);

  console.log('User:', user);
  console.log('User Role:', userRole);
  console.log('Loading:', loading);
  console.log('Is Loading Auth:', isLoadingAuth);
  console.log('Data Fetched:', dataFetched);

  useEffect(() => {
    // Only redirect if we're sure the user is not an admin and auth is fully loaded
    if (!isLoadingAuth && user && userRole !== 'ADMIN') {
      console.log('Redirecting non-admin user to home');
      window.location.href = '/';
      return;
    }

    // Only fetch data once when user is confirmed admin and data hasn't been fetched yet
    if (isAdmin && !dataFetched) {
      const fetchData = async () => {
        setDataLoading(true);
        try {
          const [responsesResponse, subscriptionsResponse, usersResponse] = await Promise.all([
            fetch('/api/admin/responses'),
            fetch('/api/admin/subscriptions'),
            fetch('/api/admin/users')
          ]);
          
          const responsesData = await responsesResponse.json();
          const subscriptionsData = await subscriptionsResponse.json();
          const usersData = await usersResponse.json();

          // Ensure arrays are returned, fallback to empty arrays if API returns errors
          setSignups(Array.isArray(responsesData) ? responsesData : []);
          setSubscriptions(Array.isArray(subscriptionsData) ? subscriptionsData : []);
          setRegisteredUsers(Array.isArray(usersData) ? usersData : []);
          setDataFetched(true);
        } catch (error) {
          console.error('Error fetching admin data:', error);
          // Set empty arrays on error
          setSignups([]);
          setSubscriptions([]);
          setRegisteredUsers([]);
          setDataFetched(true);
        } finally {
          setDataLoading(false);
        }
      };

      fetchData();
    } else if (!isLoadingAuth && !user) {
      setDataLoading(false);
    } else if (!isLoadingAuth && userRole !== 'ADMIN') {
      setDataLoading(false);
    }
  }, [isAdmin, isLoadingAuth, dataFetched, user, userRole]);

  const refreshData = async () => {
    setDataLoading(true);
    try {
      const [responsesResponse, subscriptionsResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/responses'),
        fetch('/api/admin/subscriptions'),
        fetch('/api/admin/users')
      ]);
      
      const responsesData = await responsesResponse.json();
      const subscriptionsData = await subscriptionsResponse.json();
      const usersData = await usersResponse.json();
      
      // Ensure arrays are returned
      setSignups(Array.isArray(responsesData) ? responsesData : []);
      setSubscriptions(Array.isArray(subscriptionsData) ? subscriptionsData : []);
      setRegisteredUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error refreshing data:', error);
      // Set empty arrays on error
      setSignups([]);
      setSubscriptions([]);
      setRegisteredUsers([]);
    } finally {
      setDataLoading(false);
    }
  };

  const handleUniversalTopicSubmit = async (formData: TopicFormData) => {
    const response = await fetch('/api/admin/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
      throw new Error('Failed to add topic');
    }
  };

  // Show loading while checking auth and role
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-muted-foreground">Please sign in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeSubscriptions = Array.isArray(subscriptions) ? subscriptions.filter(s => s.status === 'ACTIVE') : [];
  const totalRevenue = Array.isArray(subscriptions) ? subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0) : 0;

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 pt-16 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
            <p className="text-muted-foreground">Quick stats and recent activity</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={refreshData} disabled={dataLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setTopicFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Topic
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registeredUsers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Activities</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{signups.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{Math.round(totalRevenue / 100).toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {registeredUsers.slice(0, 5).map((user) => (
                  <div key={user.uid} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.displayName || 'Anonymous'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(user.creationTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {registeredUsers.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No users found</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subscriptions.slice(0, 5).map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">₹{Math.round((subscription.amount || 0) / 100)}</p>
                      <p className="text-sm text-muted-foreground">{subscription.userId.slice(0, 8)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(subscription.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {subscriptions.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No subscriptions found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <UniversalTopicForm
          isOpen={topicFormOpen}
          onClose={() => setTopicFormOpen(false)}
          onSubmit={handleUniversalTopicSubmit}
        />
      </div>
    </div>
  );
}
