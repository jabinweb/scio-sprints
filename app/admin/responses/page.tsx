'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw, AlertCircle, Download, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface Signup {
  id: string;
  name: string;
  email: string;
  school: string;
  role: string;
  timestamp: string;
  status?: string;
  updatedAt?: string;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-800' },
  { value: 'demo-scheduled', label: 'Demo Scheduled', color: 'bg-purple-100 text-purple-800' },
  { value: 'demo-completed', label: 'Demo Completed', color: 'bg-green-100 text-green-800' },
  { value: 'not-interested', label: 'Not Interested', color: 'bg-red-100 text-red-800' },
  { value: 'follow-up', label: 'Follow-up Required', color: 'bg-orange-100 text-orange-800' },
];

export default function ResponsesPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced admin check
  const isAdmin = user && userRole === 'ADMIN';
  const isLoadingAuth = authLoading || (user && userRole === null);

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
        setLoading(true);
        try {
          const responsesResponse = await fetch('/api/admin/responses');
          const responsesData = await responsesResponse.json();
          
          // Ensure we always set an array
          setSignups(Array.isArray(responsesData) ? responsesData : []);
          setDataFetched(true);
        } catch (error) {
          console.error('Error fetching form responses:', error);
          setSignups([]);
          setDataFetched(true);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else if (!isLoadingAuth && !user) {
      setLoading(false);
    } else if (!isLoadingAuth && userRole !== 'ADMIN') {
      setLoading(false);
    }
  }, [isAdmin, isLoadingAuth, dataFetched, user, userRole]);

  const deleteResponse = async (signupId: string) => {
    if (!confirm('Are you sure you want to delete this form response?')) return;
    
    try {
      const response = await fetch(`/api/admin/responses?id=${signupId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSignups(signups.filter(signup => signup.id !== signupId));
      }
    } catch (error) {
      console.error('Error deleting form response:', error);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'School/Institution', 'Role', 'Date'],
      ...signups.map(signup => [
        signup.name,
        signup.email,
        signup.school,
        signup.role,
        new Date(signup.timestamp).toLocaleDateString()
      ])
    ];

    const csvString = csvContent.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `form-responses-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const responsesResponse = await fetch('/api/admin/responses');
      const responsesData = await responsesResponse.json();
      setSignups(Array.isArray(responsesData) ? responsesData : []);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setSignups([]);
    } finally {
      setLoading(false);
    }
  };

  const updateResponseStatus = async (responseId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/responses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseId, status: newStatus }),
      });
      
      if (response.ok) {
        setSignups(signups.map(signup => 
          signup.id === responseId ? { ...signup, status: newStatus, updatedAt: new Date().toISOString() } : signup
        ));
      }
    } catch (error) {
      console.error('Error updating response status:', error);
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusConfig = statusOptions.find(opt => opt.value === status) || statusOptions[0];
    return (
      <Badge className={statusConfig.color}>
        {statusConfig.label}
      </Badge>
    );
  };

  // Filter responses based on search term
  const filteredSignups = useMemo(() => {
    if (!searchTerm.trim()) return signups;
    
    const searchLower = searchTerm.toLowerCase();
    return signups.filter(signup => 
      signup.name?.toLowerCase().includes(searchLower) ||
      signup.email?.toLowerCase().includes(searchLower) ||
      signup.school?.toLowerCase().includes(searchLower) ||
      signup.role?.toLowerCase().includes(searchLower) ||
      signup.status?.toLowerCase().includes(searchLower)
    );
  }, [signups, searchTerm]);

  // Calculate status stats
  const statusStats = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredSignups.forEach(signup => {
      const status = signup.status || 'pending';
      stats[status] = (stats[status] || 0) + 1;
    });
    return stats;
  }, [filteredSignups]);

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
            <h1 className="text-3xl font-bold mb-2">Form Responses</h1>
            <p className="text-muted-foreground">Manage demo request form submissions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={refreshData} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, school, role, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Array.isArray(signups) ? signups.length : 0}</div>
              {searchTerm && (
                <p className="text-xs text-muted-foreground">
                  {filteredSignups.length} matching
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusStats.pending || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contacted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusStats.contacted || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demo Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusStats['demo-scheduled'] || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusStats['demo-completed'] || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Follow-up</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusStats['follow-up'] || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Form Responses List */}
        <Card>
          <CardHeader>
            <CardTitle>All Form Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(filteredSignups) && filteredSignups.map((signup) => (
                <div key={signup.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{signup.name}</h3>
                      {getStatusBadge(signup.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{signup.email}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">School:</span> {signup.school}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Role:</span> {signup.role}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Submitted:</span> {new Date(signup.timestamp).toLocaleString()}
                      </p>
                      {signup.updatedAt && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Updated:</span> {new Date(signup.updatedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={signup.status || 'pending'}
                      onValueChange={(value) => updateResponseStatus(signup.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteResponse(signup.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredSignups.length === 0 && searchTerm && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No responses found matching &quot;{searchTerm}&quot;</p>
                </div>
              )}
              {(!Array.isArray(signups) || signups.length === 0) && !searchTerm && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No form responses found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
