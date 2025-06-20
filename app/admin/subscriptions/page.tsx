'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, AlertCircle } from 'lucide-react';

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

export default function SubscriptionsPage() {
  const { user, userRole, loading } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);

  // Enhanced admin check - wait for userRole to be loaded
  const isAdmin = user && userRole === 'ADMIN';
  const isLoadingAuth = loading || (user && userRole === null);

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
          const [subscriptionsResponse, usersResponse] = await Promise.all([
            fetch('/api/admin/subscriptions'),
            fetch('/api/admin/users')
          ]);
          
          const subscriptionsData = await subscriptionsResponse.json();
          const usersData = await usersResponse.json();

          // Ensure arrays are returned
          setSubscriptions(Array.isArray(subscriptionsData) ? subscriptionsData : []);
          setRegisteredUsers(Array.isArray(usersData) ? usersData : []);
          setDataFetched(true);
        } catch (error) {
          console.error('Error fetching subscription data:', error);
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

  const updateSubscriptionStatus = async (subscriptionId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId, status: newStatus }),
      });
      
      if (response.ok) {
        setSubscriptions(subscriptions.map(sub => 
          sub.id === subscriptionId ? { ...sub, status: newStatus } : sub
        ));
        // Also update the users list
        setRegisteredUsers(registeredUsers.map(user => 
          user.subscription?.id === subscriptionId 
            ? { ...user, subscription: { ...user.subscription, status: newStatus }, hasActiveSubscription: newStatus === 'active' }
            : user
        ));
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const deleteSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    
    try {
      const response = await fetch(`/api/admin/subscriptions?id=${subscriptionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSubscriptions(subscriptions.filter(sub => sub.id !== subscriptionId));
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
    }
  };

  const refreshData = async () => {
    setDataLoading(true);
    try {
      const [subscriptionsResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/subscriptions'),
        fetch('/api/admin/users')
      ]);
      
      const subscriptionsData = await subscriptionsResponse.json();
      const usersData = await usersResponse.json();
      
      setSubscriptions(Array.isArray(subscriptionsData) ? subscriptionsData : []);
      setRegisteredUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setSubscriptions([]);
      setRegisteredUsers([]);
    } finally {
      setDataLoading(false);
    }
  };

  const getUserBySubscription = (subscription: Subscription) => {
    return registeredUsers.find(user => user.uid === subscription.userId);
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

  if (!isAdmin) {
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
            <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
            <p className="text-muted-foreground">Manage user subscriptions and payments</p>
          </div>
          <Button onClick={refreshData} disabled={dataLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriptions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{Math.round(totalRevenue / 100).toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions List */}
        <Card>
          <CardHeader>
            <CardTitle>All Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptions.map((subscription) => {
                const subscriptionUser = getUserBySubscription(subscription);
                return (
                  <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Payment ID: {subscription.paymentId}</h3>
                      <p className="text-sm text-muted-foreground">
                        User: {subscriptionUser?.email || subscription.userId}
                      </p>
                      <p className="text-sm text-muted-foreground">Amount: ₹{subscription.amount}</p>
                      <p className="text-sm text-muted-foreground">
                        Date: {new Date(subscription.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right space-y-2">
                        <div className="flex gap-2">
                          <Button
                            variant={subscription.status === 'active' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateSubscriptionStatus(subscription.id, 'active')}
                          >
                            Active
                          </Button>
                          <Button
                            variant={subscription.status === 'inactive' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateSubscriptionStatus(subscription.id, 'inactive')}
                          >
                            Inactive
                          </Button>
                        </div>
                        <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                          {subscription.status}
                        </Badge>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteSubscription(subscription.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {subscriptions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No subscriptions found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
