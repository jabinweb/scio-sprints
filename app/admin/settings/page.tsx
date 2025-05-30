'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, AlertCircle, RefreshCw, Key, Mail, Database } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface AppSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  subscriptionPrice: number;
  emailNotifications: boolean;
  maintenanceMode: boolean;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayTestKeyId: string;
  razorpayTestKeySecret: string;
  paymentMode: 'test' | 'live';
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>({
    siteName: 'ScioLabs',
    siteDescription: 'Interactive Learning Platform',
    contactEmail: 'contact@sciolabs.com',
    supportEmail: 'support@sciolabs.com',
    subscriptionPrice: 896,
    emailNotifications: true,
    maintenanceMode: false,
    razorpayKeyId: '',
    razorpayKeySecret: '',
    razorpayTestKeyId: '',
    razorpayTestKeySecret: '',
    paymentMode: 'test',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
  });
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Check if user is admin
  const isAdmin = user?.email === 'admin@sciolabs.com' || user?.email === 'jabincreators@gmail.com';

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    fetchSettings();
  }, [isAdmin]);

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus('');
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveStatus('Settings saved successfully!');
      } else {
        setSaveStatus('Error saving settings');
      }
      
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('Error saving settings');
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AppSettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
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

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 pt-16 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Configure application settings and preferences</p>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        {saveStatus && (
          <div className={`mb-4 p-3 rounded-lg ${
            saveStatus.includes('Error') 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {saveStatus}
          </div>
        )}

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => handleInputChange('siteName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subscriptionPrice">Subscription Price (₹)</Label>
                    <Input
                      id="subscriptionPrice"
                      type="number"
                      value={settings.subscriptionPrice}
                      onChange={(e) => handleInputChange('subscriptionPrice', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Payment Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Payment Mode</Label>
                  <RadioGroup
                    value={settings.paymentMode}
                    onValueChange={(value) => handleInputChange('paymentMode', value as 'test' | 'live')}
                    className="flex gap-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="test" id="test" />
                      <Label htmlFor="test">Test Mode</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="live" id="live" />
                      <Label htmlFor="live">Live Mode</Label>
                    </div>
                  </RadioGroup>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select test mode for development or live mode for production
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Test Environment Keys</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="razorpayTestKeyId">Test Key ID</Label>
                      <Input
                        id="razorpayTestKeyId"
                        type="password"
                        value={settings.razorpayTestKeyId}
                        onChange={(e) => handleInputChange('razorpayTestKeyId', e.target.value)}
                        placeholder="rzp_test_..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="razorpayTestKeySecret">Test Key Secret</Label>
                      <Input
                        id="razorpayTestKeySecret"
                        type="password"
                        value={settings.razorpayTestKeySecret}
                        onChange={(e) => handleInputChange('razorpayTestKeySecret', e.target.value)}
                        placeholder="Enter your test secret key"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Live Environment Keys</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="razorpayKeyId">Live Key ID</Label>
                      <Input
                        id="razorpayKeyId"
                        type="password"
                        value={settings.razorpayKeyId}
                        onChange={(e) => handleInputChange('razorpayKeyId', e.target.value)}
                        placeholder="rzp_live_..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="razorpayKeySecret">Live Key Secret</Label>
                      <Input
                        id="razorpayKeySecret"
                        type="password"
                        value={settings.razorpayKeySecret}
                        onChange={(e) => handleInputChange('razorpayKeySecret', e.target.value)}
                        placeholder="Enter your live secret key"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">🔒 Security Note</h4>
                  <p className="text-sm text-blue-700">
                    All keys are encrypted and stored securely. Use test keys during development and switch to live keys only when ready for production.
                  </p>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-medium text-amber-800 mb-2">⚡ Current Mode: {settings.paymentMode.toUpperCase()}</h4>
                  <p className="text-sm text-amber-700">
                    {settings.paymentMode === 'test' 
                      ? 'Test mode is active - no real payments will be processed' 
                      : 'Live mode is active - real payments will be processed'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send automated emails for form submissions and updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={settings.smtpHost}
                      onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      value={settings.smtpPort}
                      onChange={(e) => handleInputChange('smtpPort', e.target.value)}
                      placeholder="587"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    value={settings.smtpUser}
                    onChange={(e) => handleInputChange('smtpUser', e.target.value)}
                    placeholder="your-email@gmail.com"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable public access to the application
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                  />
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">⚠️ Warning</h4>
                  <p className="text-sm text-yellow-700">
                    Enabling maintenance mode will show a maintenance page to all non-admin users.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
