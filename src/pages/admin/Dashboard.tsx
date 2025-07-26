import { useState } from 'react';
import { 
  BarChart3, 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Calendar,
  IndianRupee
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState('7d');

  // Mock data - in real app, this would come from API
  const stats = {
    totalRevenue: 125000,
    totalOrders: 356,
    totalProducts: 45,
    totalCustomers: 1234,
    revenueGrowth: 12.5,
    ordersGrowth: 8.3,
    productsGrowth: 2.1,
    customersGrowth: 15.2
  };

  const recentOrders = [
    {
      id: 'ORD001',
      customer: 'Rajesh Kumar',
      amount: 1250,
      status: 'Delivered',
      date: '2024-01-26',
      items: 3
    },
    {
      id: 'ORD002', 
      customer: 'Priya Sharma',
      amount: 890,
      status: 'Processing',
      date: '2024-01-26',
      items: 2
    },
    {
      id: 'ORD003',
      customer: 'Amit Singh',
      amount: 2100,
      status: 'Shipped',
      date: '2024-01-25', 
      items: 5
    },
    {
      id: 'ORD004',
      customer: 'Sneha Patel',
      amount: 750,
      status: 'Pending',
      date: '2024-01-25',
      items: 1
    }
  ];

  const topProducts = [
    {
      name: 'Premium Chicken Thigh Boneless',
      sales: 145,
      revenue: 38570,
      category: 'Chicken'
    },
    {
      name: 'Premium Ribeye Steak',
      sales: 89,
      revenue: 338211,
      category: 'Beef'
    },
    {
      name: 'Atlantic Salmon Fillet',
      sales: 67,
      revenue: 180833,
      category: 'Seafood'
    },
    {
      name: 'Free-Range Chicken Breast',
      sales: 156,
      revenue: 249444,
      category: 'Chicken'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'text-green-600 bg-green-50';
      case 'Shipped':
        return 'text-blue-600 bg-blue-50';
      case 'Processing':
        return 'text-yellow-600 bg-yellow-50';
      case 'Pending':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.revenueGrowth}%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.ordersGrowth}%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.productsGrowth}%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.customersGrowth}%</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">₹{order.amount.toLocaleString('en-IN')}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="text-xs text-muted-foreground">{order.items} items</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">₹{product.revenue.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-muted-foreground">{product.sales} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Analytics Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="revenue" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>
            
            <TabsContent value="revenue" className="space-y-4">
              <div className="h-80 flex items-center justify-center border rounded-lg bg-muted/20">
                <div className="text-center space-y-2">
                  <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Revenue analytics chart would go here</p>
                  <p className="text-sm text-muted-foreground">Connect to analytics service to view detailed charts</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="orders" className="space-y-4">
              <div className="h-80 flex items-center justify-center border rounded-lg bg-muted/20">
                <div className="text-center space-y-2">
                  <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Orders analytics chart would go here</p>
                  <p className="text-sm text-muted-foreground">Connect to analytics service to view detailed charts</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="customers" className="space-y-4">
              <div className="h-80 flex items-center justify-center border rounded-lg bg-muted/20">
                <div className="text-center space-y-2">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Customer analytics chart would go here</p>
                  <p className="text-sm text-muted-foreground">Connect to analytics service to view detailed charts</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="products" className="space-y-4">
              <div className="h-80 flex items-center justify-center border rounded-lg bg-muted/20">
                <div className="text-center space-y-2">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Product analytics chart would go here</p>
                  <p className="text-sm text-muted-foreground">Connect to analytics service to view detailed charts</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;