import { useState, useEffect } from 'react';
import { Save, Bell, Shield, Palette, Globe, CreditCard, Package, Truck, Clock, DollarSign, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('key, value, description, category')
        .order('category', { ascending: true });

      if (error) throw error;

      // Convert array to object for easier access
      const settingsObj: Record<string, any> = {};
      data?.forEach(setting => {
        try {
          // Parse JSON values, fallback to string if parsing fails
          settingsObj[setting.key] = typeof setting.value === 'string'
            ? JSON.parse(setting.value)
            : setting.value;
        } catch {
          settingsObj[setting.key] = setting.value;
        }
      });

      setSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Prepare updates for each setting
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: JSON.stringify(value),
        updated_at: new Date().toISOString()
      }));

      // Update settings in database
      for (const update of updates) {
        const { error } = await supabase
          .from('settings')
          .update({ value: update.value, updated_at: update.updated_at })
          .eq('key', update.key);

        if (error) throw error;
      }

      toast({
        title: "Settings saved!",
        description: "All settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
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
                  <Label htmlFor="store_name">Store Name</Label>
                  <Input
                    id="store_name"
                    value={settings.store_name || ''}
                    onChange={(e) => updateSetting('store_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store_email">Store Email</Label>
                  <Input
                    id="store_email"
                    type="email"
                    value={settings.store_email || ''}
                    onChange={(e) => updateSetting('store_email', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store_description">Store Description</Label>
                <Textarea
                  id="store_description"
                  value={settings.store_description || ''}
                  onChange={(e) => updateSetting('store_description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store_phone">Phone Number</Label>
                  <Input
                    id="store_phone"
                    value={settings.store_phone || ''}
                    onChange={(e) => updateSetting('store_phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store_address">Address</Label>
                  <Input
                    id="store_address"
                    value={settings.store_address || ''}
                    onChange={(e) => updateSetting('store_address', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store_logo">Store Logo URL</Label>
                <Input
                  id="store_logo"
                  value={settings.store_logo || ''}
                  onChange={(e) => updateSetting('store_logo', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site_title">Site Title</Label>
                <Input
                  id="site_title"
                  value={settings.site_title || ''}
                  onChange={(e) => updateSetting('site_title', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_description">Site Description</Label>
                <Textarea
                  id="site_description"
                  value={settings.site_description || ''}
                  onChange={(e) => updateSetting('site_description', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_keywords">Site Keywords</Label>
                <Input
                  id="site_keywords"
                  value={settings.site_keywords || ''}
                  onChange={(e) => updateSetting('site_keywords', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Business Hours & Operations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_hours_start">Business Hours Start</Label>
                  <Input
                    id="business_hours_start"
                    type="time"
                    value={settings.business_hours_start || ''}
                    onChange={(e) => updateSetting('business_hours_start', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_hours_end">Business Hours End</Label>
                  <Input
                    id="business_hours_end"
                    type="time"
                    value={settings.business_hours_end || ''}
                    onChange={(e) => updateSetting('business_hours_end', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order_processing_time">Order Processing Time (hours)</Label>
                  <Input
                    id="order_processing_time"
                    type="number"
                    value={settings.order_processing_time || 0}
                    onChange={(e) => updateSetting('order_processing_time', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_time_estimate">Delivery Time Estimate (hours)</Label>
                  <Input
                    id="delivery_time_estimate"
                    type="number"
                    value={settings.delivery_time_estimate || 0}
                    onChange={(e) => updateSetting('delivery_time_estimate', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="low_stock_threshold">Low Stock Alert Threshold</Label>
                <Input
                  id="low_stock_threshold"
                  type="number"
                  value={settings.low_stock_threshold || 0}
                  onChange={(e) => updateSetting('low_stock_threshold', parseInt(e.target.value))}
                  className="w-full md:w-1/2"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Approve Orders</Label>
                  <p className="text-sm text-muted-foreground">Automatically approve new orders</p>
                </div>
                <Switch
                  checked={settings.auto_approve_orders || false}
                  onCheckedChange={(checked) => updateSetting('auto_approve_orders', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Payment Methods</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Razorpay Payments</Label>
                  <p className="text-sm text-muted-foreground">Enable online payments via Razorpay</p>
                </div>
                <Switch
                  checked={settings.razorpay_enabled || false}
                  onCheckedChange={(checked) => updateSetting('razorpay_enabled', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cash on Delivery</Label>
                  <p className="text-sm text-muted-foreground">Enable COD payments</p>
                </div>
                <Switch
                  checked={settings.cod_enabled || false}
                  onCheckedChange={(checked) => updateSetting('cod_enabled', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>UPI Payments</Label>
                  <p className="text-sm text-muted-foreground">Enable UPI payments</p>
                </div>
                <Switch
                  checked={settings.upi_enabled || false}
                  onCheckedChange={(checked) => updateSetting('upi_enabled', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Card Payments</Label>
                  <p className="text-sm text-muted-foreground">Enable credit/debit card payments</p>
                </div>
                <Switch
                  checked={settings.card_enabled || false}
                  onCheckedChange={(checked) => updateSetting('card_enabled', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Net Banking</Label>
                  <p className="text-sm text-muted-foreground">Enable net banking payments</p>
                </div>
                <Switch
                  checked={settings.netbanking_enabled || false}
                  onCheckedChange={(checked) => updateSetting('netbanking_enabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Admin Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive admin notifications via email</p>
                </div>
                <Switch
                  checked={settings.email_notifications || false}
                  onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive admin notifications via SMS</p>
                </div>
                <Switch
                  checked={settings.sms_notifications || false}
                  onCheckedChange={(checked) => updateSetting('sms_notifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Order Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified about new orders</p>
                </div>
                <Switch
                  checked={settings.order_notifications || false}
                  onCheckedChange={(checked) => updateSetting('order_notifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">Alert when products are running low</p>
                </div>
                <Switch
                  checked={settings.low_stock_alerts || false}
                  onCheckedChange={(checked) => updateSetting('low_stock_alerts', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified about payment updates</p>
                </div>
                <Switch
                  checked={settings.payment_notifications || false}
                  onCheckedChange={(checked) => updateSetting('payment_notifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Customer Notifications</Label>
                  <p className="text-sm text-muted-foreground">Enable notifications to customers</p>
                </div>
                <Switch
                  checked={settings.customer_notifications || false}
                  onCheckedChange={(checked) => updateSetting('customer_notifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Currency & Tax Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={settings.currency || 'INR'}
                    onChange={(e) => updateSetting('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency_symbol">Currency Symbol</Label>
                  <Input
                    id="currency_symbol"
                    value={settings.currency_symbol || ''}
                    onChange={(e) => updateSetting('currency_symbol', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    value={settings.tax_rate || 0}
                    onChange={(e) => updateSetting('tax_rate', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="w-5 h-5" />
                <span>Delivery Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery_charge">Standard Delivery Charge (₹)</Label>
                  <Input
                    id="delivery_charge"
                    type="number"
                    value={settings.delivery_charge || 0}
                    onChange={(e) => updateSetting('delivery_charge', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="free_delivery_threshold">Free Delivery Above (₹)</Label>
                  <Input
                    id="free_delivery_threshold"
                    type="number"
                    value={settings.free_delivery_threshold || 0}
                    onChange={(e) => updateSetting('free_delivery_threshold', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cod_charge">Cash on Delivery Charge (₹)</Label>
                  <Input
                    id="cod_charge"
                    type="number"
                    value={settings.cod_charge || 0}
                    onChange={(e) => updateSetting('cod_charge', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cod_threshold">Maximum COD Amount (₹)</Label>
                  <Input
                    id="cod_threshold"
                    type="number"
                    value={settings.cod_threshold || 0}
                    onChange={(e) => updateSetting('cod_threshold', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_delivery_distance">Maximum Delivery Distance (km)</Label>
                <Input
                  id="max_delivery_distance"
                  type="number"
                  value={settings.max_delivery_distance || 0}
                  onChange={(e) => updateSetting('max_delivery_distance', parseFloat(e.target.value))}
                  className="w-full md:w-1/2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Limits & Discounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_order_amount">Minimum Order Amount (₹)</Label>
                  <Input
                    id="min_order_amount"
                    type="number"
                    value={settings.min_order_amount || 0}
                    onChange={(e) => updateSetting('min_order_amount', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_order_amount">Maximum Order Amount (₹)</Label>
                  <Input
                    id="max_order_amount"
                    type="number"
                    value={settings.max_order_amount || 0}
                    onChange={(e) => updateSetting('max_order_amount', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk_discount_threshold">Bulk Discount Above (₹)</Label>
                  <Input
                    id="bulk_discount_threshold"
                    type="number"
                    value={settings.bulk_discount_threshold || 0}
                    onChange={(e) => updateSetting('bulk_discount_threshold', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bulk_discount_percentage">Bulk Discount (%)</Label>
                  <Input
                    id="bulk_discount_percentage"
                    type="number"
                    value={settings.bulk_discount_percentage || 0}
                    onChange={(e) => updateSetting('bulk_discount_percentage', parseFloat(e.target.value))}
                  />
                </div>
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
                  checked={settings.enable_two_factor || false}
                  onCheckedChange={(checked) => updateSetting('enable_two_factor', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session_timeout"
                  type="number"
                  value={settings.session_timeout || 30}
                  onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value))}
                  className="w-full md:w-1/2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_min_length">Minimum Password Length</Label>
                <Input
                  id="password_min_length"
                  type="number"
                  value={settings.password_min_length || 8}
                  onChange={(e) => updateSetting('password_min_length', parseInt(e.target.value))}
                  className="w-full md:w-1/2"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
                </div>
                <Switch
                  checked={settings.require_email_verification || false}
                  onCheckedChange={(checked) => updateSetting('require_email_verification', checked)}
                />
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
                <Label htmlFor="products_per_page">Products Per Page</Label>
                <Input
                  id="products_per_page"
                  type="number"
                  value={settings.products_per_page || 12}
                  onChange={(e) => updateSetting('products_per_page', parseInt(e.target.value))}
                  className="w-full md:w-1/2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="featured_products_count">Featured Products Count</Label>
                <Input
                  id="featured_products_count"
                  type="number"
                  value={settings.featured_products_count || 8}
                  onChange={(e) => updateSetting('featured_products_count', parseInt(e.target.value))}
                  className="w-full md:w-1/2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bestsellers_count">Bestsellers Count</Label>
                <Input
                  id="bestsellers_count"
                  type="number"
                  value={settings.bestsellers_count || 6}
                  onChange={(e) => updateSetting('bestsellers_count', parseInt(e.target.value))}
                  className="w-full md:w-1/2"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Reviews</Label>
                  <p className="text-sm text-muted-foreground">Allow customers to review products</p>
                </div>
                <Switch
                  checked={settings.enable_reviews || false}
                  onCheckedChange={(checked) => updateSetting('enable_reviews', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Ratings</Label>
                  <p className="text-sm text-muted-foreground">Allow customers to rate products</p>
                </div>
                <Switch
                  checked={settings.enable_ratings || false}
                  onCheckedChange={(checked) => updateSetting('enable_ratings', checked)}
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
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-medium mb-2 text-gray-500">Google Maps API - Removed</h3>
                <p className="text-sm text-muted-foreground">Location features have been removed. Users now manually enter addresses.</p>
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