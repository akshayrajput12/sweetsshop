import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Tag, Calendar, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { formatPrice } from '@/utils/currency';
import { format } from 'date-fns';

interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  status: 'active' | 'inactive' | 'expired';
  isFirstTimeUser?: boolean;
}

const AdminCoupons = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Sample coupons data
  const coupons: Coupon[] = [
    {
      id: '1',
      code: 'SAVE10',
      description: 'Get 10% off on all orders above ₹500',
      type: 'percentage',
      value: 10,
      minOrderValue: 500,
      maxDiscountAmount: 100,
      usageLimit: 1000,
      usedCount: 245,
      validFrom: '2024-01-01',
      validUntil: '2024-12-31',
      status: 'active',
      isFirstTimeUser: false
    },
    {
      id: '2',
      code: 'FIRST50',
      description: 'Flat ₹50 off for first-time users',
      type: 'fixed',
      value: 50,
      minOrderValue: 299,
      usageLimit: 500,
      usedCount: 127,
      validFrom: '2024-01-01',
      validUntil: '2024-12-31',
      status: 'active',
      isFirstTimeUser: true
    },
    {
      id: '3',
      code: 'WEEKEND20',
      description: 'Weekend special - 20% off on all items',
      type: 'percentage',
      value: 20,
      minOrderValue: 1000,
      maxDiscountAmount: 200,
      usageLimit: 200,
      usedCount: 89,
      validFrom: '2024-01-01',
      validUntil: '2024-03-31',
      status: 'expired',
      isFirstTimeUser: false
    },
    {
      id: '4',
      code: 'MEGASALE',
      description: 'Mega sale - Up to 25% off',
      type: 'percentage',
      value: 25,
      minOrderValue: 1500,
      maxDiscountAmount: 300,
      usageLimit: 100,
      usedCount: 0,
      validFrom: '2024-03-01',
      validUntil: '2024-03-31',
      status: 'inactive',
      isFirstTimeUser: false
    },
    {
      id: '5',
      code: 'FLAT100',
      description: 'Flat ₹100 off on orders above ₹800',
      type: 'fixed',
      value: 100,
      minOrderValue: 800,
      usageLimit: 300,
      usedCount: 156,
      validFrom: '2024-01-15',
      validUntil: '2024-06-30',
      status: 'active',
      isFirstTimeUser: false
    }
  ];

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string, value: number) => {
    return type === 'percentage' ? `${value}%` : formatPrice(value);
  };

  const totalSavings = coupons.reduce((sum, coupon) => {
    if (coupon.type === 'fixed') {
      return sum + (coupon.value * coupon.usedCount);
    } else {
      // Estimate savings for percentage coupons
      const avgOrderValue = coupon.minOrderValue * 1.5;
      const discount = Math.min(
        (avgOrderValue * coupon.value) / 100,
        coupon.maxDiscountAmount || avgOrderValue
      );
      return sum + (discount * coupon.usedCount);
    }
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Coupons</h1>
        <Button onClick={() => navigate('/admin/coupons/add')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Coupon
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.length}</div>
            <p className="text-xs text-muted-foreground">
              {coupons.filter(c => c.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Times used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalSavings)}</div>
            <p className="text-xs text-muted-foreground">Customer savings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Usage Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coupons.length > 0 
                ? Math.round((coupons.reduce((sum, c) => sum + (c.usedCount / c.usageLimit * 100), 0) / coupons.length))
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Of usage limit</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search coupons by code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Coupons List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{coupon.code}</p>
                      {coupon.isFirstTimeUser && (
                        <Badge variant="secondary" className="text-xs">
                          First-time users
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-muted-foreground truncate">
                      {coupon.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getTypeLabel(coupon.type, coupon.value)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatPrice(coupon.minOrderValue)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{coupon.usedCount} / {coupon.usageLimit}</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-primary h-1.5 rounded-full" 
                          style={{ 
                            width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(coupon.validUntil), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(coupon.status)}>
                      {coupon.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/admin/coupons/edit/${coupon.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCoupons;