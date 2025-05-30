'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";

const classes = [
  { id: 4, name: 'Class 4', url: 'https://sciolabs.notion.site/ebd/1996a57183ea8080818cceee9857421c' },
  { id: 5, name: 'Class 5', url: 'https://sciolabs.notion.site/ebd/2006a57183ea803faf0bd4e66ec740b8' },
  { id: 6, name: 'Class 6', url: 'https://sciolabs.notion.site/ebd/2006a57183ea80b8a28dfea1022a83a9' },
  { id: 7, name: 'Class 7', url: 'https://sciolabs.notion.site/ebd/2006a57183ea802cb67cc4db075ae855' },
  { id: 8, name: 'Class 8', url: 'https://sciolabs.notion.site/ebd/2006a57183ea80bf9cd4e91a075a7691' },
];

export function DashboardContent() {
  const { user, logout } = useAuth();
  const [selectedClass, setSelectedClass] = useState(classes[0]);

  // const menuItems = [
  //   {
  //     title: 'My Learning',
  //     icon: <BookOpen className="w-6 h-6" />,
  //     description: 'Access your courses and track progress',
  //     href: '/dashboard/learning'
  //   },
  //   {
  //     title: 'Profile',
  //     icon: <User className="w-6 h-6" />,
  //     description: 'Manage your account settings',
  //     href: '/dashboard/profile'
  //   },
  //   {
  //     title: 'Settings',
  //     icon: <Settings className="w-6 h-6" />,
  //     description: 'Configure your preferences',
  //     href: '/dashboard/settings'
  //   }
  // ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, {user?.displayName || 'User'}!</h1>
            <p className="text-muted-foreground">Manage your learning journey</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => logout()}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Class Selection */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            {classes.map((cls) => (
              <Button
                key={cls.id}
                variant={selectedClass.id === cls.id ? 'default' : 'outline'}
                onClick={() => setSelectedClass(cls)}
                className="mb-2"
              >
                {cls.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <Card>
          <CardHeader>
            <CardTitle>{selectedClass.name} Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[600px] rounded-lg overflow-hidden border">
              <iframe
                src={selectedClass.url}
                width="100%"
                height="600"
                style={{ border: 'none' }}
                allowFullScreen
                title={`${selectedClass.name} Content`}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
