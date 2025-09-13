'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { 
  Calendar,
  Mail,
  Phone,
  User,
  School,
  Users,
  Hash,
  GraduationCap
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  displayName: string | null;
  grade: string | null;
  section: string | null;
  rollNumber: string | null;
  phone: string | null;
  parentName: string | null;
  parentEmail: string | null;
  joinDate: string;
  school: {
    id: string;
    name: string;
  } | null;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const loading = status === 'loading';
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    grade: '',
    section: '',
    rollNumber: '',
    phone: '',
    parentName: '',
    parentEmail: ''
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const profile = await response.json();
          setUserProfile(profile);
          setFormData({
            name: profile.name || '',
            displayName: profile.displayName || '',
            grade: profile.grade || '',
            section: profile.section || '',
            rollNumber: profile.rollNumber || '',
            phone: profile.phone || '',
            parentName: profile.parentName || '',
            parentEmail: profile.parentEmail || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  const displayName = userProfile?.displayName || userProfile?.name || user.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const joinDate = userProfile?.joinDate ? new Date(userProfile.joinDate).toLocaleDateString() : 'Not available';

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setUserProfile(updatedProfile);
        setIsEditing(false);
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original profile data
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        displayName: userProfile.displayName || '',
        grade: userProfile.grade || '',
        section: userProfile.section || '',
        rollNumber: userProfile.rollNumber || '',
        phone: userProfile.phone || '',
        parentName: userProfile.parentName || '',
        parentEmail: userProfile.parentEmail || ''
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-4 border-white/20">
                  <AvatarImage src={user.image || ''} alt={displayName} />
                  <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
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
                  {/* Display user role from NextAuth session */}
                  {user?.role && (
                    <Badge variant="outline" className="mb-2">
                      {user.role}
                    </Badge>
                  )}
                  <Button 
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={isLoading}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-gray-700 font-medium">Display Name</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grade" className="text-gray-700 font-medium">Grade</Label>
                      <Input
                        id="grade"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., 10th Grade"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="section" className="text-gray-700 font-medium">Section</Label>
                      <Input
                        id="section"
                        value={formData.section}
                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., A, B, C"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rollNumber" className="text-gray-700 font-medium">Roll Number</Label>
                      <Input
                        id="rollNumber"
                        value={formData.rollNumber}
                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Student roll number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Contact number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentName" className="text-gray-700 font-medium">Parent/Guardian Name</Label>
                      <Input
                        id="parentName"
                        value={formData.parentName}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Parent or guardian name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentEmail" className="text-gray-700 font-medium">Parent/Guardian Email</Label>
                      <Input
                        id="parentEmail"
                        type="email"
                        value={formData.parentEmail}
                        onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Parent or guardian email"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSave} disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{userProfile?.name || 'Not set'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="font-medium">{userProfile?.email || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Grade</p>
                        <p className="font-medium">{userProfile?.grade || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Users className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Section</p>
                        <p className="font-medium">{userProfile?.section || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Hash className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Roll Number</p>
                        <p className="font-medium">{userProfile?.rollNumber || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-medium">{userProfile?.phone || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Parent/Guardian</p>
                        <p className="font-medium">{userProfile?.parentName || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Parent/Guardian Email</p>
                        <p className="font-medium">{userProfile?.parentEmail || 'Not set'}</p>
                      </div>
                    </div>

                    {userProfile?.school && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <School className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">School</p>
                          <p className="font-medium">{userProfile.school.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}