import { useState } from 'react';
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

const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState('7d');

  // Sample analytics data
  const analyticsData = {
    revenue: {
      current: 125000,
      previous: 98000,
      growth: 27.6,
      trend: 'up' as const
    },
    orders: {
      current: 356,
      previous: 298,
      growth: 19.5,
      trend: 'up' as const
    },
    customers: {
      current: 89,
      previous: 76,
      growth: 17.1,
      trend: 'up' as const
    },
    avgOrderValue: {
      current: 1599,
      previous: 1456,
      growth: 9.8,
      trend: 'up' as const
    }
  };

  const topCategories = [
    { name: 'Chicken', revenue: 45600, orders: 123, growth: 15.2 },
    { name: 'Beef', revenue: 38400, orders: 89, growth: 8.7 },
    { name: 'Seafood', revenue: 29800, orders: 67, growth: 22.1 },
    { name: 'Pork', revenue: 11200, orders: 34, growth: -5.3 }
  ];

  const salesData = [
    { date: '2024-01-20', revenue: 8500, orders: 24 },
    { date: '2024-01-21', revenue: 12300, orders: 31 },
    { date: '2024-01-22', revenue: 9800, orders: 28 },
    { date: '2024-01-23', revenue: 15600, orders: 42 },
    { date: '2024-01-24', revenue: 11200, orders: 35 },
    { date: '2024-01-25', revenue: 18900, orders: 48 },
    { date: '2024-01-26', revenue: 22400, orders: 56 }
  ];

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? TrendingUp : TrendingDown;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
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
            <div className="text-2xl font-bold">₹{analyticsData.revenue.current.toLocaleString('en-IN')}</div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingUp className={`w-3 h-3 ${getGrowthColor(analyticsData.revenue.growth)}`} />
              <span className={getGrowthColor(analyticsData.revenue.growth)}>
                +{analyticsData.revenue.growth}%
              </span>
              <span className="text-muted-foreground">from last period</span>
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
            <div className="flex items-center space-x-1 text-xs">
              <TrendingUp className={`w-3 h-3 ${getGrowthColor(analyticsData.orders.growth)}`} />
              <span className={getGrowthColor(analyticsData.orders.growth)}>
                +{analyticsData.orders.growth}%
              </span>
              <span className="text-muted-foreground">from last period</span>
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
            <div className="flex items-center space-x-1 text-xs">
              <TrendingUp className={`w-3 h-3 ${getGrowthColor(analyticsData.customers.growth)}`} />
              <span className={getGrowthColor(analyticsData.customers.growth)}>
                +{analyticsData.customers.growth}%
              </span>
              <span className="text-muted-foreground">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analyticsData.avgOrderValue.current}</div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingUp className={`w-3 h-3 ${getGrowthColor(analyticsData.avgOrderValue.growth)}`} />
              <span className={getGrowthColor(analyticsData.avgOrderValue.growth)}>
                +{analyticsData.avgOrderValue.growth}%
              </span>
              <span className="text-muted-foreground">from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center border rounded-lg bg-muted/20">
              <div className="text-center space-y-2">
                <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Sales trend chart would go here</p>
                <div className="space-y-2 text-sm">
                  {salesData.slice(-3).map((day, index) => (
                    <div key={day.date} className="flex justify-between">
                      <span>{day.date}</span>
                      <span>₹{day.revenue.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">{category.orders} orders</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">₹{category.revenue.toLocaleString('en-IN')}</p>
                    <div className="flex items-center space-x-1 text-xs">
                      {category.growth >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-600" />
                      )}
                      <span className={category.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {category.growth >= 0 ? '+' : ''}{category.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Detailed Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="revenue" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
              <TabsTrigger value="products">Product Performance</TabsTrigger>
              <TabsTrigger value="customers">Customer Insights</TabsTrigger>
              <TabsTrigger value="geographic">Geographic Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="revenue" className="space-y-4">
              <div className="h-80 flex items-center justify-center border rounded-lg bg-muted/20">
                <div className="text-center space-y-2">
                  <IndianRupee className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Revenue analysis charts would go here</p>
                  <p className="text-sm text-muted-foreground">Monthly/quarterly revenue breakdown, profit margins, etc.</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="products" className="space-y-4">
              <div className="h-80 flex items-center justify-center border rounded-lg bg-muted/20">
                <div className="text-center space-y-2">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Product performance charts would go here</p>
                  <p className="text-sm text-muted-foreground">Best sellers, inventory turnover, product ratings</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="customers" className="space-y-4">
              <div className="h-80 flex items-center justify-center border rounded-lg bg-muted/20">
                <div className="text-center space-y-2">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Customer insight charts would go here</p>
                  <p className="text-sm text-muted-foreground">Customer lifetime value, acquisition costs, retention rates</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="geographic" className="space-y-4">
              <div className="h-80 flex items-center justify-center border rounded-lg bg-muted/20">
                <div className="text-center space-y-2">
                  <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Geographic data visualization would go here</p>
                  <p className="text-sm text-muted-foreground">Sales by region, delivery zones, customer distribution</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;