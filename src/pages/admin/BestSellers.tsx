import { useState } from 'react';
import { Star, TrendingUp, Package, IndianRupee, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface BestSellerProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  unitsSold: number;
  revenue: number;
  rating: number;
  image: string;
  rank: number;
  growthRate: number;
  profitMargin: number;
}

const AdminBestSellers = () => {
  const [dateRange, setDateRange] = useState('30d');

  // Sample best sellers data
  const bestSellers: BestSellerProduct[] = [
    {
      id: '1',
      name: 'Premium Chicken Thigh Boneless',
      category: 'Chicken',
      price: 285,
      unitsSold: 245,
      revenue: 69825,
      rating: 4.8,
      image: '/src/assets/product-chicken.jpg',
      rank: 1,
      growthRate: 23.5,
      profitMargin: 35.2
    },
    {
      id: '4',
      name: 'Free-Range Chicken Breast',
      category: 'Chicken',
      price: 399,
      unitsSold: 198,
      revenue: 79002,
      rating: 4.7,
      image: '/src/assets/product-chicken.jpg',
      rank: 2,
      growthRate: 18.7,
      profitMargin: 42.1
    },
    {
      id: '2',
      name: 'Premium Ribeye Steak',
      category: 'Beef',
      price: 3799,
      unitsSold: 67,
      revenue: 254533,
      rating: 4.9,
      image: '/src/assets/product-steak.jpg',
      rank: 3,
      growthRate: 15.2,
      profitMargin: 28.5
    },
    {
      id: '3',
      name: 'Atlantic Salmon Fillet',
      category: 'Seafood',
      price: 2699,
      unitsSold: 89,
      revenue: 240211,
      rating: 4.6,
      image: '/src/assets/product-seafood.jpg',
      rank: 4,
      growthRate: 31.8,
      profitMargin: 38.7
    },
    {
      id: '5',
      name: 'Mutton Leg Curry Cut',
      category: 'Mutton',
      price: 899,
      unitsSold: 134,
      revenue: 120466,
      rating: 4.5,
      image: '/src/assets/product-steak.jpg',
      rank: 5,
      growthRate: 12.3,
      profitMargin: 33.4
    }
  ];

  const stats = {
    totalRevenue: bestSellers.reduce((sum, product) => sum + product.revenue, 0),
    totalUnitsSold: bestSellers.reduce((sum, product) => sum + product.unitsSold, 0),
    averageRating: bestSellers.reduce((sum, product) => sum + product.rating, 0) / bestSellers.length,
    averageGrowth: bestSellers.reduce((sum, product) => sum + product.growthRate, 0) / bestSellers.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Best Sellers</h1>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">From top 5 products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Units Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUnitsSold}</div>
            <p className="text-xs text-muted-foreground">Total units sold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Customer satisfaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.averageGrowth.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Growth rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Best Sellers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span>Top Performing Products</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Units Sold</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Growth</TableHead>
                <TableHead>Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bestSellers.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        {product.rank}
                      </div>
                      {product.rank <= 3 && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="flex items-center space-x-3">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category}</Badge>
                  </TableCell>
                  <TableCell>₹{product.price}</TableCell>
                  <TableCell className="font-medium">{product.unitsSold}</TableCell>
                  <TableCell className="font-medium">₹{product.revenue.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{product.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">+{product.growthRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-green-600">{product.profitMargin}%</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Chicken', 'Beef', 'Seafood'].map((category) => {
              const categoryProducts = bestSellers.filter(p => p.category === category);
              const categoryRevenue = categoryProducts.reduce((sum, p) => sum + p.revenue, 0);
              const categoryUnits = categoryProducts.reduce((sum, p) => sum + p.unitsSold, 0);
              
              return (
                <div key={category} className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">{category}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Revenue:</span>
                      <span className="font-medium">₹{categoryRevenue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Units Sold:</span>
                      <span className="font-medium">{categoryUnits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Products:</span>
                      <span className="font-medium">{categoryProducts.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBestSellers;