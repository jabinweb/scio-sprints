'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, AlertCircle, UserCheck } from 'lucide-react';

interface Subscription {
  id: string;
  status: string;
  amount?: number;
  planType: string;
  startDate: string;
  endDate?: string;
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
  totalPayments: number;
  totalAmountPaid: number;
}

export default function UsersPage() {
  const { user, userRole, loading } = useAuth();
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);

  // Enhanced admin check
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
          const usersResponse = await fetch('/api/admin/users');
          const usersData = await usersResponse.json();

          // Ensure array is returned
          setRegisteredUsers(Array.isArray(usersData) ? usersData : []);
          setDataFetched(true);
        } catch (error) {
          console.error('Error fetching users data:', error);
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

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setRegisteredUsers(registeredUsers.filter(user => user.uid !== userId));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, is_active: !isActive }),
      });
      
      if (response.ok) {
        // Update local state - note: this would require adding isActive to the RegisteredUser interface
        // For now, just refresh the data
        refreshData();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const refreshData = async () => {
    setDataLoading(true);
    try {
      const usersResponse = await fetch('/api/admin/users');
      const usersData = await usersResponse.json();
      
      setRegisteredUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setRegisteredUsers([]);
    } finally {
      setDataLoading(false);
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

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 pt-16 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-muted-foreground">Manage registered users and their subscriptions</p>
          </div>
          <Button onClick={refreshData} disabled={dataLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registeredUsers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {registeredUsers.filter(u => u.hasActiveSubscription).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {registeredUsers.reduce((sum, u) => sum + u.totalPayments, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{Math.round(registeredUsers.reduce((sum, u) => sum + u.totalAmountPaid, 0) / 100).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {registeredUsers.map((registeredUser) => (
                <div key={registeredUser.uid} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {registeredUser.displayName?.[0] || registeredUser.email[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold">{registeredUser.displayName || 'Anonymous'}</h3>
                      <p className="text-sm text-muted-foreground">{registeredUser.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={registeredUser.hasActiveSubscription ? 'default' : 'secondary'}>
                          {registeredUser.hasActiveSubscription ? 'Active Subscriber' : 'Free User'}
                        </Badge>
                        {registeredUser.subscription && (
                          <Badge variant="outline">
                            {registeredUser.subscription.planType}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">₹{Math.round(registeredUser.totalAmountPaid / 100)}</p>
                      <p className="text-xs text-muted-foreground">{registeredUser.totalPayments} payments</p>
                      <p className="text-xs text-muted-foreground">
                        Joined: {new Date(registeredUser.creationTime).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserStatus(registeredUser.uid, true)}
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteUser(registeredUser.uid)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {registeredUsers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No users found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
