'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, AlertCircle } from 'lucide-react';

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
  createdAt: string;
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

export default function UsersPage() {
  const { user } = useAuth();
  const [signups, setSignups] = useState<Signup[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  const isAdmin = user?.email === 'admin@sciolabs.com' || user?.email === 'jabincreators@gmail.com';

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [signupsResponse, usersResponse] = await Promise.all([
          fetch('/api/admin/signups'),
          fetch('/api/admin/users')
        ]);
        
        const signupsData = await signupsResponse.json();
        const usersData = await usersResponse.json();

        setSignups(signupsData);
        setRegisteredUsers(usersData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  const deleteSignup = async (signupId: string) => {
    if (!confirm('Are you sure you want to delete this signup?')) return;
    
    try {
      const response = await fetch(`/api/admin/signups?id=${signupId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSignups(signups.filter(signup => signup.id !== signupId));
      }
    } catch (error) {
      console.error('Error deleting signup:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
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

  const refreshData = async () => {
    setLoading(true);
    try {
      const [signupsResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/signups'),
        fetch('/api/admin/users')
      ]);
      
      const signupsData = await signupsResponse.json();
      const usersData = await usersResponse.json();
      
      setSignups(signupsData);
      setRegisteredUsers(usersData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
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
            <p className="text-muted-foreground">Manage registered users and demo signups</p>
          </div>
          <Button onClick={refreshData} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="registered" className="space-y-4">
          <TabsList>
            <TabsTrigger value="registered">Registered Users ({registeredUsers.length})</TabsTrigger>
            <TabsTrigger value="signups">Demo Signups ({signups.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="registered">
            <Card>
              <CardHeader>
                <CardTitle>Registered Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {registeredUsers.map((user) => (
                    <div key={user.uid} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{user.displayName || 'Anonymous'}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">
                            Joined: {new Date(user.creationTime).toLocaleDateString()}
                          </p>
                          {user.lastSignInTime && (
                            <p className="text-sm text-muted-foreground">
                              • Last login: {new Date(user.lastSignInTime).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {user.subscription && (
                          <div className="mt-2">
                            <Badge variant={user.hasActiveSubscription ? 'default' : 'secondary'}>
                              {user.subscription.status} - ₹{user.subscription.amount}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant={user.hasActiveSubscription ? 'default' : 'outline'}>
                            {user.hasActiveSubscription ? 'Premium' : 'Free'}
                          </Badge>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteUser(user.uid)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {registeredUsers.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No registered users found.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signups">
            <Card>
              <CardHeader>
                <CardTitle>Demo Signups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {signups.map((signup) => (
                    <div key={signup.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{signup.name}</h3>
                        <p className="text-sm text-muted-foreground">{signup.email}</p>
                        <p className="text-sm text-muted-foreground">{signup.school} • {signup.role}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {new Date(signup.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteSignup(signup.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {signups.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No demo signups found.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
