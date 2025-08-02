import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Link, Unlink, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CouponAssignment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [coupons, setCoupons] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCoupons(), fetchProducts(), fetchAssignments()]);
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, images, stock_quantity')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('product_coupons')
        .select(`
          *,
          products(id, name, images),
          coupons(id, code, description)
        `);

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignCoupon = async (productId: string) => {
    if (!selectedCoupon) {
      toast({
        title: "No coupon selected",
        description: "Please select a coupon first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('product_coupons')
        .insert([{ product_id: productId, coupon_id: selectedCoupon }]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already assigned",
            description: "This coupon is already assigned to this product.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }
      
      toast({
        title: "Coupon assigned!",
        description: "Coupon has been assigned to the product successfully.",
      });
      
      fetchAssignments();
    } catch (error) {
      console.error('Error assigning coupon:', error);
      toast({
        title: "Error",
        description: "Failed to assign coupon.",
        variant: "destructive",
      });
    }
  };

  const unassignCoupon = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('product_coupons')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      
      toast({
        title: "Coupon unassigned",
        description: "Coupon has been removed from the product.",
      });
      
      fetchAssignments();
    } catch (error) {
      console.error('Error unassigning coupon:', error);
      toast({
        title: "Error",
        description: "Failed to unassign coupon.",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProductAssignments = (productId: string) => {
    return assignments.filter(assignment => assignment.product_id === productId);
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
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/admin/coupons')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Coupons
        </Button>
        <h1 className="text-3xl font-bold">Coupon Assignment</h1>
      </div>

      {/* Coupon Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Coupon to Assign</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coupon">Choose Coupon</Label>
              <Select value={selectedCoupon} onValueChange={setSelectedCoupon}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a coupon to assign" />
                </SelectTrigger>
                <SelectContent>
                  {coupons.map((coupon) => (
                    <SelectItem key={coupon.id} value={coupon.id}>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{coupon.code}</span>
                        <span className="text-sm text-muted-foreground">
                          ({coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`} off)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCoupon && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                {(() => {
                  const coupon = coupons.find(c => c.id === selectedCoupon);
                  return coupon ? (
                    <div>
                      <h3 className="font-semibold text-blue-900">{coupon.code}</h3>
                      <p className="text-sm text-blue-700">{coupon.description}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% discount` : `₹${coupon.discount_value} off`}
                        {coupon.min_order_amount && ` (Min order: ₹${coupon.min_order_amount})`}
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Search and Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Assign to Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Products List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => {
                const productAssignments = getProductAssignments(product.id);
                const isAssigned = productAssignments.some(a => a.coupon_id === selectedCoupon);
                
                return (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={product.images?.[0] || '/placeholder.svg'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">₹{product.price}</p>
                        <p className="text-xs text-muted-foreground">Stock: {product.stock_quantity}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Show assigned coupons */}
                      {productAssignments.length > 0 && (
                        <div className="flex flex-wrap gap-1 mr-2">
                          {productAssignments.map((assignment) => (
                            <div key={assignment.id} className="flex items-center">
                              <Badge 
                                variant="secondary" 
                                className="text-xs flex items-center space-x-1"
                              >
                                <span>{assignment.coupons?.code}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => unassignCoupon(assignment.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Assign/Unassign button */}
                      {selectedCoupon && (
                        <Button
                          size="sm"
                          variant={isAssigned ? "destructive" : "default"}
                          onClick={() => {
                            if (isAssigned) {
                              const assignment = productAssignments.find(a => a.coupon_id === selectedCoupon);
                              if (assignment) {
                                unassignCoupon(assignment.id);
                              }
                            } else {
                              assignCoupon(product.id);
                            }
                          }}
                          disabled={!selectedCoupon}
                        >
                          {isAssigned ? (
                            <>
                              <Unlink className="h-4 w-4 mr-2" />
                              Remove
                            </>
                          ) : (
                            <>
                              <Link className="h-4 w-4 mr-2" />
                              Assign
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No products found matching your search.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Assignments ({assignments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img
                    src={assignment.products?.images?.[0] || '/placeholder.svg'}
                    alt={assignment.products?.name}
                    className="w-10 h-10 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-medium text-sm">{assignment.products?.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {assignment.coupons?.code}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => unassignCoupon(assignment.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {assignments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No coupon assignments yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CouponAssignment;