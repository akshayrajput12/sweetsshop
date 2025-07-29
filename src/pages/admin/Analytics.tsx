import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Package, 
  ShoppingCart, 
  IndianRupee,
  Calendar,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/currency';

const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    revenue: { current: 0, previous: 0, growth: 0, trend: 'up' as 'up' | 'down' },
    orders: { current: 0, previous: 0, growth: 0, trend: 'up' as 'up' | 'down' },
    customers: { current: 0, previous: 0, growth: 0, trend: 'up' as 'up' | 'down' },
    avgOrderValue: { current: 0, previous: 0, growth: 0, trend: 'up' as 'up' | 'down' }
  });
  const [topCategories, setTopCategories] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch orders for revenue and order analytics
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total, created_at, customer_info, items')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch categories with product count
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select(`
          name,
          products(count)
        `)
        .eq('is_active', true);

      if (categoriesError) throw categoriesError;

      // Fetch profiles for customer analytics
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, created_at, full_name');

      if (profilesError) throw profilesError;

      // Calculate analytics
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const totalCustomers = profiles?.length || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Mock previous period data (in real app, calculate based on date range)
      const previousRevenue = totalRevenue * 0.8;
      const previousOrders = Math.floor(totalOrders * 0.85);
      const previousCustomers = Math.floor(totalCustomers * 0.9);
      const previousAvgOrderValue = avgOrderValue * 0.85;

      setAnalyticsData({
        revenue: {
          current: totalRevenue,
          previous: previousRevenue,
          growth: ((totalRevenue - previousRevenue) / previousRevenue) * 100,
          trend: totalRevenue > previousRevenue ? 'up' : 'down'
        },
        orders: {
          current: totalOrders,
          previous: previousOrders,
          growth: ((totalOrders - previousOrders) / previousOrders) * 100,
          trend: totalOrders > previousOrders ? 'up' : 'down'
        },
        customers: {
          current: totalCustomers,
          previous: previousCustomers,
          growth: ((totalCustomers - previousCustomers) / previousCustomers) * 100,
          trend: totalCustomers > previousCustomers ? 'up' : 'down'
        },
        avgOrderValue: {
          current: avgOrderValue,
          previous: previousAvgOrderValue,
          growth: ((avgOrderValue - previousAvgOrderValue) / previousAvgOrderValue) * 100,
          trend: avgOrderValue > previousAvgOrderValue ? 'up' : 'down'
        }
      });

      // Format top categories
      const formattedCategories = categories?.map(category => ({
        name: category.name,
        revenue: Math.random() * 50000, // Mock revenue
        orders: Math.floor(Math.random() * 100), // Mock orders
        growth: Math.random() * 30 // Mock growth
      })) || [];

      setTopCategories(formattedCategories);

      // Format top customers (mock data based on profiles)
      const formattedCustomers = profiles?.slice(0, 5).map(profile => ({
        name: profile.full_name || 'Unknown Customer',
        orders: Math.floor(Math.random() * 20),
        totalSpent: Math.random() * 10000,
        avgOrderValue: Math.random() * 2000
      })) || [];

      setTopCustomers(formattedCustomers);

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="flex items-center space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-input rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(analyticsData.revenue.current)}</div>
            <div className="flex items-center text-xs">
              {analyticsData.revenue.trend === 'up' ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span className={analyticsData.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                {analyticsData.revenue.growth.toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.orders.current}</div>
            <div className="flex items-center text-xs">
              {analyticsData.orders.trend === 'up' ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span className={analyticsData.orders.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                {analyticsData.orders.growth.toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.customers.current}</div>
            <div className="flex items-center text-xs">
              {analyticsData.customers.trend === 'up' ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span className={analyticsData.customers.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                {analyticsData.customers.growth.toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(analyticsData.avgOrderValue.current)}</div>
            <div className="flex items-center text-xs">
              {analyticsData.avgOrderValue.trend === 'up' ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span className={analyticsData.avgOrderValue.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                {analyticsData.avgOrderValue.growth.toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Top Categories</TabsTrigger>
          <TabsTrigger value="customers">Top Customers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCategories.map((category: any, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">{category.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(category.revenue)}</p>
                      <p className="text-sm text-green-600">+{category.growth.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.map((customer: any, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(customer.totalSpent)}</p>
                      <p className="text-sm text-muted-foreground">Avg: {formatPrice(customer.avgOrderValue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;