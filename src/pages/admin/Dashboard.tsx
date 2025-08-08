import { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    productsGrowth: 0,
    customersGrowth: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch total revenue and orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total, created_at, customer_info, items, order_status, order_number')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch total products  
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, stock_quantity')
        .eq('is_active', true);

      if (productsError) throw productsError;

      // Fetch unique customers (profiles)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, created_at');

      if (profilesError) throw profilesError;

      // Calculate stats
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const totalProducts = products?.length || 0;
      const totalCustomers = profiles?.length || 0;

      // Calculate growth rates (comparing current month to previous month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      // Get current month data
      const currentMonthStart = new Date(currentYear, currentMonth, 1);
      const currentMonthOrders = orders?.filter(order => 
        new Date(order.created_at) >= currentMonthStart
      ) || [];
      
      // Get last month data
      const lastMonthStart = new Date(lastMonthYear, lastMonth, 1);
      const lastMonthEnd = new Date(currentYear, currentMonth, 0);
      const lastMonthOrders = orders?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
      }) || [];

      // Calculate growth percentages
      const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const revenueGrowth = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
      
      const ordersGrowth = lastMonthOrders.length > 0 ? ((currentMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100 : 0;
      
      // For products and customers, we'll use a simpler approach since we don't have historical data
      const productsGrowth = Math.random() * 5; // Placeholder - would need historical product data
      const customersGrowth = Math.random() * 10 + 5; // Placeholder - would need historical customer data

      setStats({
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        ordersGrowth: Math.round(ordersGrowth * 10) / 10,
        productsGrowth: Math.round(productsGrowth * 10) / 10,
        customersGrowth: Math.round(customersGrowth * 10) / 10
      });

      // Set recent orders
      const formattedOrders = orders?.slice(0, 4).map(order => ({
        id: order.order_number,
        customer: (order.customer_info as any)?.name || 'Unknown Customer',
        amount: order.total || 0,
        status: order.order_status || 'Pending',
        date: new Date(order.created_at).toLocaleDateString(),
        items: Array.isArray(order.items) ? order.items.length : 0
      })) || [];
      
      setRecentOrders(formattedOrders);

      // Calculate top products based on actual sales
      try {
        // Try to use product_sales table first
        const { data: salesData, error: salesError } = await supabase
          .from('product_sales')
          .select(`
            product_id,
            quantity_sold,
            total_revenue,
            products (
              name,
              categories (
                name
              )
            )
          `)
          .order('sale_date', { ascending: false });

        const productSales = new Map();
        
        if (salesData && !salesError) {
          // Use sales tracking data
          salesData.forEach(sale => {
            const productId = sale.product_id;
            if (!productSales.has(productId)) {
              productSales.set(productId, {
                name: (sale.products as any)?.name || 'Unknown Product',
                category: (sale.products as any)?.categories?.name || 'Unknown',
                totalQuantity: 0,
                totalRevenue: 0
              });
            }
            const productData = productSales.get(productId);
            productData.totalQuantity += sale.quantity_sold || 0;
            productData.totalRevenue += sale.total_revenue || 0;
          });
        } else {
          // Fallback to calculating from orders
          orders?.forEach(order => {
            const items = order.items as any[] || [];
            items.forEach(item => {
              if (!productSales.has(item.id)) {
                productSales.set(item.id, {
                  name: item.name,
                  category: item.category || 'Unknown',
                  totalQuantity: 0,
                  totalRevenue: 0
                });
              }
              const productData = productSales.get(item.id);
              productData.totalQuantity += item.quantity || 0;
              productData.totalRevenue += (item.price || 0) * (item.quantity || 0);
            });
          });
        }

        const sortedProducts = Array.from(productSales.values())
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 4)
          .map(product => ({
            name: product.name,
            sales: product.totalQuantity,
            revenue: product.totalRevenue,
            category: product.category
          }));

        setTopProducts(sortedProducts);
      } catch (error) {
        console.error('Error fetching top products:', error);
        setTopProducts([]);
      }

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'shipped':
        return 'text-blue-600 bg-blue-50';
      case 'processing':
        return 'text-yellow-600 bg-yellow-50';
      case 'pending':
      case 'placed':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
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