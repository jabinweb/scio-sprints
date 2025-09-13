'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  AlertCircle, 
  RefreshCw, 
  Mail, 
  Settings as SettingsIcon,
  Globe,
  CreditCard,
  Server,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface AppSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  subscriptionPrice: string; // Changed to string to handle form inputs better
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
  const { data: session, status } = useSession();
  const user = session?.user;
  const userRole = 'ADMIN'; // TODO: Get from session or database
  const authLoading = status === 'loading';
  const [settings, setSettings] = useState<AppSettings>({
    siteName: 'ScioLabs',
    siteDescription: 'Interactive Learning Platform',
    contactEmail: 'contact@sciolabs.com',
    supportEmail: 'support@sciolabs.com',
    subscriptionPrice: '896',
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
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  // Enhanced admin check
  const isAdmin = user && userRole === 'ADMIN';
  const isLoadingAuth = authLoading || (user && userRole === null);

  useEffect(() => {
    if (!isLoadingAuth && user && userRole !== 'ADMIN') {
      window.location.href = '/';
      return;
    }

    if (isAdmin && !dataLoaded) {
      const fetchSettings = async () => {
        try {
          const response = await fetch('/api/admin/settings');
          const data = await response.json();
          
          // Ensure all values are defined and properly typed
          const safeSettings: AppSettings = {
            siteName: data.siteName || 'ScioLabs',
            siteDescription: data.siteDescription || 'Interactive Learning Platform',
            contactEmail: data.contactEmail || 'contact@sciolabs.com',
            supportEmail: data.supportEmail || 'support@sciolabs.com',
            subscriptionPrice: String(data.subscriptionPrice || '299'),
            emailNotifications: Boolean(data.emailNotifications ?? true),
            maintenanceMode: Boolean(data.maintenanceMode ?? false),
            razorpayKeyId: data.razorpayKeyId || '',
            razorpayKeySecret: data.razorpayKeySecret || '',
            razorpayTestKeyId: data.razorpayTestKeyId || '',
            razorpayTestKeySecret: data.razorpayTestKeySecret || '',
            paymentMode: (data.paymentMode === 'live' ? 'live' : 'test') as 'test' | 'live',
            smtpHost: data.smtpHost || '',
            smtpPort: data.smtpPort || '587',
            smtpUser: data.smtpUser || '',
          };
          
          setSettings(safeSettings);
          setDataLoaded(true);
        } catch (error) {
          console.error('Error loading settings:', error);
          setDataLoaded(true);
        }
      };

      fetchSettings();
    }
  }, [isAdmin, isLoadingAuth, dataLoaded, user, userRole]);

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus('');
    
    try {
      // Convert subscriptionPrice back to number for API
      const apiSettings = {
        ...settings,
        subscriptionPrice: parseInt(settings.subscriptionPrice) || 299
      };

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiSettings),
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

  // Don't render form until data is loaded
  if (!dataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg">
                  <SettingsIcon className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  System Settings
                </h1>
              </div>
              <p className="text-lg text-gray-600 ml-11">
                Configure your application settings and preferences
              </p>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 h-auto"
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Save className="h-5 w-5 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Status Alert */}
        {saveStatus && (
          <div className={`mb-6 p-4 rounded-xl border shadow-sm flex items-center gap-3 ${
            saveStatus.includes('Error') 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : 'bg-green-50 border-green-200 text-green-800'
          }`}>
            {saveStatus.includes('Error') ? (
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="font-medium">{saveStatus}</span>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-1">
            <TabsTrigger 
              value="general" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              <Globe className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger 
              value="payment" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              <CreditCard className="h-4 w-4" />
              Payment
            </TabsTrigger>
            <TabsTrigger 
              value="email" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger 
              value="system" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              <Server className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Globe className="h-6 w-6" />
                  General Settings
                  <Badge className="bg-white/20 text-white border-white/20">Core</Badge>
                </CardTitle>
                <p className="text-blue-100 mt-2">Basic application configuration and branding</p>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Site Information */}
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Information</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="siteName" className="text-gray-700 font-medium">Site Name</Label>
                          <Input
                            id="siteName"
                            value={settings.siteName}
                            onChange={(e) => handleInputChange('siteName', e.target.value)}
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm"
                            placeholder="Your site name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="siteDescription" className="text-gray-700 font-medium">Site Description</Label>
                          <Textarea
                            id="siteDescription"
                            value={settings.siteDescription}
                            onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                            rows={4}
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm resize-none"
                            placeholder="Describe your platform..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-6">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="contactEmail" className="text-gray-700 font-medium">Contact Email</Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            value={settings.contactEmail}
                            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                            className="border-gray-200 focus:border-green-500 focus:ring-green-500 bg-white shadow-sm"
                            placeholder="contact@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supportEmail" className="text-gray-700 font-medium">Support Email</Label>
                          <Input
                            id="supportEmail"
                            type="email"
                            value={settings.supportEmail}
                            onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                            className="border-gray-200 focus:border-green-500 focus:ring-green-500 bg-white shadow-sm"
                            placeholder="support@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subscriptionPrice" className="text-gray-700 font-medium">Subscription Price</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                            <Input
                              id="subscriptionPrice"
                              type="number"
                              value={settings.subscriptionPrice}
                              onChange={(e) => handleInputChange('subscriptionPrice', e.target.value)}
                              className="border-gray-200 focus:border-green-500 focus:ring-green-500 bg-white shadow-sm pl-8"
                              placeholder="299"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <CreditCard className="h-6 w-6" />
                  Payment Configuration
                  <Badge className="bg-white/20 text-white border-white/20">Secure</Badge>
                </CardTitle>
                <p className="text-emerald-100 mt-2">Configure Razorpay payment gateway settings</p>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Payment Mode Selection */}
                <div className="border-l-4 border-emerald-500 pl-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Payment Mode</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSecrets(!showSecrets)}
                      className="flex items-center gap-2"
                    >
                      {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showSecrets ? 'Hide' : 'Show'} Secrets
                    </Button>
                  </div>
                  <RadioGroup
                    value={settings.paymentMode}
                    onValueChange={(value) => handleInputChange('paymentMode', value as 'test' | 'live')}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="test" id="test" />
                      <div className="flex-1">
                        <Label htmlFor="test" className="font-medium cursor-pointer">Test Mode</Label>
                        <p className="text-sm text-gray-600">For development and testing</p>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Safe</Badge>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="live" id="live" />
                      <div className="flex-1">
                        <Label htmlFor="live" className="font-medium cursor-pointer">Live Mode</Label>
                        <p className="text-sm text-gray-600">For production payments</p>
                      </div>
                      <Badge variant="default" className="bg-red-100 text-red-800">Live</Badge>
                    </div>
                  </RadioGroup>
                </div>

                {/* API Keys */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Test Keys */}
                  <div className="space-y-4">
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        Test Credentials
                        <Badge className="bg-yellow-100 text-yellow-800">Development</Badge>
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="razorpayTestKeyId" className="text-gray-700 font-medium">Test Key ID</Label>
                          <Input
                            id="razorpayTestKeyId"
                            value={settings.razorpayTestKeyId}
                            onChange={(e) => handleInputChange('razorpayTestKeyId', e.target.value)}
                            className="border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 bg-white shadow-sm font-mono text-sm"
                            placeholder="rzp_test_..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="razorpayTestKeySecret" className="text-gray-700 font-medium">Test Key Secret</Label>
                          <Input
                            id="razorpayTestKeySecret"
                            type={showSecrets ? "text" : "password"}
                            value={settings.razorpayTestKeySecret}
                            onChange={(e) => handleInputChange('razorpayTestKeySecret', e.target.value)}
                            className="border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 bg-white shadow-sm font-mono text-sm"
                            placeholder={showSecrets ? "Your test secret key" : "••••••••••••••••"}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Keys */}
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-500 pl-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        Live Credentials
                        <Badge className="bg-red-100 text-red-800">Production</Badge>
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="razorpayKeyId" className="text-gray-700 font-medium">Live Key ID</Label>
                          <Input
                            id="razorpayKeyId"
                            value={settings.razorpayKeyId}
                            onChange={(e) => handleInputChange('razorpayKeyId', e.target.value)}
                            className="border-gray-200 focus:border-red-500 focus:ring-red-500 bg-white shadow-sm font-mono text-sm"
                            placeholder="rzp_live_..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="razorpayKeySecret" className="text-gray-700 font-medium">Live Key Secret</Label>
                          <Input
                            id="razorpayKeySecret"
                            type={showSecrets ? "text" : "password"}
                            value={settings.razorpayKeySecret}
                            onChange={(e) => handleInputChange('razorpayKeySecret', e.target.value)}
                            className="border-gray-200 focus:border-red-500 focus:ring-red-500 bg-white shadow-sm font-mono text-sm"
                            placeholder={showSecrets ? "Your live secret key" : "••••••••••••••••"}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Mode Status */}
                <div className={`p-6 rounded-xl border-2 ${
                  settings.paymentMode === 'test' 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      settings.paymentMode === 'test' ? 'bg-yellow-200' : 'bg-red-200'
                    }`}>
                      <CreditCard className={`h-5 w-5 ${
                        settings.paymentMode === 'test' ? 'text-yellow-700' : 'text-red-700'
                      }`} />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${
                        settings.paymentMode === 'test' ? 'text-yellow-800' : 'text-red-800'
                      }`}>
                        Current Mode: {settings.paymentMode.toUpperCase()}
                      </h4>
                      <p className={`text-sm ${
                        settings.paymentMode === 'test' ? 'text-yellow-700' : 'text-red-700'
                      }`}>
                        {settings.paymentMode === 'test' 
                          ? 'Test mode is active - no real payments will be processed' 
                          : 'Live mode is active - real payments will be processed'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Security Warning */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 mb-2">Security Notice</h4>
                      <p className="text-sm text-amber-700">
                        Keep your API keys secure. Never share them in client-side code or public repositories.
                        Use test keys for development and live keys only in production.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Mail className="h-6 w-6" />
                  Email Configuration
                  <Badge className="bg-white/20 text-white border-white/20">SMTP</Badge>
                </CardTitle>
                <p className="text-purple-100 mt-2">Configure email notifications and SMTP settings</p>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Email Toggle */}
                <div className="border-l-4 border-purple-500 pl-6">
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Send automated emails for subscriptions, payments, and updates
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                      className="data-[state=checked]:bg-purple-600"
                    />
                  </div>
                </div>

                {/* SMTP Configuration */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-indigo-500 pl-4">
                    SMTP Server Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost" className="text-gray-700 font-medium">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={settings.smtpHost}
                        onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                        className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white shadow-sm"
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort" className="text-gray-700 font-medium">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        value={settings.smtpPort}
                        onChange={(e) => handleInputChange('smtpPort', e.target.value)}
                        className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white shadow-sm"
                        placeholder="587"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser" className="text-gray-700 font-medium">SMTP Username</Label>
                    <Input
                      id="smtpUser"
                      value={settings.smtpUser}
                      onChange={(e) => handleInputChange('smtpUser', e.target.value)}
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white shadow-sm"
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                </div>

                {/* Email Configuration Tips */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Email Setup Tips</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Gmail: Use smtp.gmail.com with port 587 and app password</li>
                        <li>• Outlook: Use smtp-mail.outlook.com with port 587</li>
                        <li>• Enable &quot;Less secure app access&quot; for older email providers</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Server className="h-6 w-6" />
                  System Settings
                  <Badge className="bg-white/20 text-white border-white/20">Advanced</Badge>
                </CardTitle>
                <p className="text-gray-200 mt-2">System-wide configuration and maintenance options</p>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Maintenance Mode */}
                <div className="border-l-4 border-gray-500 pl-6">
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Maintenance Mode</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Temporarily disable public access to show maintenance page
                        </p>
                      </div>
                      <Switch
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                        className="data-[state=checked]:bg-gray-700"
                      />
                    </div>
                    
                    {/* Maintenance Mode Warning */}
                    <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      settings.maintenanceMode 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          settings.maintenanceMode ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                        <div>
                          <h4 className={`font-medium mb-2 ${
                            settings.maintenanceMode ? 'text-red-800' : 'text-yellow-800'
                          }`}>
                            {settings.maintenanceMode ? '🚧 Maintenance Mode Active' : '⚠️ Maintenance Mode Warning'}
                          </h4>
                          <p className={`text-sm ${
                            settings.maintenanceMode ? 'text-red-700' : 'text-yellow-700'
                          }`}>
                            {settings.maintenanceMode 
                              ? 'Your site is currently in maintenance mode. Only admin users can access the application.'
                              : 'Enabling maintenance mode will show a maintenance page to all non-admin users. Use this during updates or system maintenance.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium text-green-800">Database</h4>
                        <p className="text-sm text-green-700">Connected</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-blue-800">API</h4>
                        <p className="text-sm text-blue-700">Operational</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      <div>
                        <h4 className="font-medium text-purple-800">Storage</h4>
                        <p className="text-sm text-purple-700">Available</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
