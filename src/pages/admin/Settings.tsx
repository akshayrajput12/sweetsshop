import { useState } from 'react';
import { Save, Bell, Shield, Palette, Globe, CreditCard, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    // Store Settings
    storeName: 'FreshMeat Store',
    storeDescription: 'Premium quality meat and seafood delivered fresh to your door',
    storeEmail: 'contact@freshmeat.com',
    storePhone: '+91 98765 43210',
    storeAddress: 'Mumbai, Maharashtra, India',
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    lowStockAlerts: true,
    customerNotifications: true,
    
    // Business Settings
    currency: 'INR',
    taxRate: 18,
    deliveryCharge: 50,
    freeDeliveryThreshold: 1000,
    maxDeliveryDistance: 25,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordPolicy: 'medium',
    
    // Display
    productsPerPage: 12,
    darkMode: false,
    language: 'english'
  });

  const handleSave = () => {
    // Save settings logic here
    console.log('Settings saved:', settings);
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Store Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={settings.storeName}
                    onChange={(e) => updateSetting('storeName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Store Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={settings.storeEmail}
                    onChange={(e) => updateSetting('storeEmail', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  value={settings.storeDescription}
                  onChange={(e) => updateSetting('storeDescription', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Phone Number</Label>
                  <Input
                    id="storePhone"
                    value={settings.storePhone}
                    onChange={(e) => updateSetting('storePhone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeAddress">Address</Label>
                  <Input
                    id="storeAddress"
                    value={settings.storeAddress}
                    onChange={(e) => updateSetting('storeAddress', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Order Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified about new orders</p>
                </div>
                <Switch
                  checked={settings.orderNotifications}
                  onCheckedChange={(checked) => updateSetting('orderNotifications', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">Alert when products are running low</p>
                </div>
                <Switch
                  checked={settings.lowStockAlerts}
                  onCheckedChange={(checked) => updateSetting('lowStockAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Business Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => updateSetting('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => updateSetting('taxRate', parseFloat(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryCharge">Delivery Charge (₹)</Label>
                  <Input
                    id="deliveryCharge"
                    type="number"
                    value={settings.deliveryCharge}
                    onChange={(e) => updateSetting('deliveryCharge', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freeDeliveryThreshold">Free Delivery Threshold (₹)</Label>
                  <Input
                    id="freeDeliveryThreshold"
                    type="number"
                    value={settings.freeDeliveryThreshold}
                    onChange={(e) => updateSetting('freeDeliveryThreshold', parseFloat(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxDeliveryDistance">Maximum Delivery Distance (km)</Label>
                <Input
                  id="maxDeliveryDistance"
                  type="number"
                  value={settings.maxDeliveryDistance}
                  onChange={(e) => updateSetting('maxDeliveryDistance', parseFloat(e.target.value))}
                  className="w-full md:w-1/2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                  className="w-full md:w-1/2"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="passwordPolicy">Password Policy</Label>
                <select
                  id="passwordPolicy"
                  value={settings.passwordPolicy}
                  onChange={(e) => updateSetting('passwordPolicy', e.target.value)}
                  className="w-full md:w-1/2 px-3 py-2 border border-input rounded-md text-sm"
                >
                  <option value="low">Low Security</option>
                  <option value="medium">Medium Security</option>
                  <option value="high">High Security</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Display Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="productsPerPage">Products Per Page</Label>
                <Input
                  id="productsPerPage"
                  type="number"
                  value={settings.productsPerPage}
                  onChange={(e) => updateSetting('productsPerPage', parseInt(e.target.value))}
                  className="w-full md:w-1/2"
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme for admin panel</p>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  value={settings.language}
                  onChange={(e) => updateSetting('language', e.target.value)}
                  className="w-full md:w-1/2 px-3 py-2 border border-input rounded-md text-sm"
                >
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="marathi">Marathi</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Third-party Integrations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Google Maps API</h3>
                <p className="text-sm text-muted-foreground mb-3">For location services and delivery tracking</p>
                <Input placeholder="Enter Google Maps API Key" className="mb-2" />
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Razorpay Payment Gateway</h3>
                <p className="text-sm text-muted-foreground mb-3">For processing payments</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  <Input placeholder="Razorpay Key ID" />
                  <Input placeholder="Razorpay Secret Key" type="password" />
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">SMS Gateway</h3>
                <p className="text-sm text-muted-foreground mb-3">For sending order notifications</p>
                <Input placeholder="SMS API Key" className="mb-2" />
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Email Service (SMTP)</h3>
                <p className="text-sm text-muted-foreground mb-3">For sending email notifications</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  <Input placeholder="SMTP Host" />
                  <Input placeholder="SMTP Port" />
                  <Input placeholder="SMTP Username" />
                  <Input placeholder="SMTP Password" type="password" />
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;