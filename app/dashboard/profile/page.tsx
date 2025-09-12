'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, School, GraduationCap, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    grade: '',
    school: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.user_metadata?.full_name || '',
        email: user.email || '',
        grade: user.user_metadata?.grade || '',
        school: user.user_metadata?.school || ''
      });
    }
  }, [user]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Unknown';

  const handleSave = async () => {
    // TODO: Implement profile update logic
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      fullName: user.user_metadata?.full_name || '',
      email: user.email || '',
      grade: user.user_metadata?.grade || '',
      school: user.user_metadata?.school || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={user.user_metadata?.avatar_url} 
                    alt={displayName}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xl font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Joined {joinDate}</span>
                  </div>
                </div>

                <div className="text-right">
                  {user.user_metadata?.role && (
                    <Badge variant="outline" className="mb-2">
                      {user.user_metadata.role}
                    </Badge>
                  )}
                  <Button 
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="mt-1 p-2 text-gray-900">{formData.fullName || 'Not provided'}</div>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="mt-1 p-2 text-gray-900 bg-gray-50 rounded-md">
                    {formData.email}
                    <span className="text-xs text-gray-500 block">Email cannot be changed</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="grade">Grade/Class</Label>
                  {isEditing ? (
                    <Input
                      id="grade"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      placeholder="e.g., 10, 12, etc."
                    />
                  ) : (
                    <div className="mt-1 p-2 text-gray-900 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      {formData.grade || 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="school">School/Institution</Label>
                  {isEditing ? (
                    <Input
                      id="school"
                      value={formData.school}
                      onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                      placeholder="Enter your school name"
                    />
                  ) : (
                    <div className="mt-1 p-2 text-gray-900 flex items-center gap-2">
                      <School className="h-4 w-4 text-gray-500" />
                      {formData.school || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={handleSave} className="flex-1">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="flex-1">
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Account ID:</span>
                  <p className="text-gray-600 font-mono text-xs mt-1">{user.id}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email Verified:</span>
                  <div className="text-gray-600 mt-1">
                    {user.email_confirmed_at ? (
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Last Sign In:</span>
                  <p className="text-gray-600 mt-1">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Account Status:</span>
                  <p className="text-gray-600 mt-1">
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}