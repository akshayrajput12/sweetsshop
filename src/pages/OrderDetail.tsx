import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, User, CreditCard, Phone, Mail, Calendar, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  weight: string;
  category: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: {
    completeAddress: string;
    mapAddress?: string;
    plotNumber: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
  };
  orderDate: string;
  deliveryDate?: string;
  trackingNumber?: string;
  notes?: string;
  couponCode?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
}

const UserOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      fetchOrderDetail();
    }
  }, [id, user]);

  const fetchOrderDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Check if user owns this order
      if (data.user_id !== user?.id) {
        // Try fallback by email for old orders
        const customerInfo = data.customer_info as any;
        if (customerInfo?.email !== user?.email) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view this order.",
            variant: "destructive",
          });
          navigate('/profile?tab=orders');
          return;
        }
      }

      if (data) {
        const customerInfo = data.customer_info as any;
        const addressDetails = data.address_details as any;
        const deliveryLocation = data.delivery_location as any;
        const orderItems = data.items as any;
        
        const orderDetail: OrderDetail = {
          id: data.id,
          orderNumber: data.order_number,
          customerName: customerInfo?.name || 'Unknown Customer',
          customerEmail: customerInfo?.email || '',
          customerPhone: customerInfo?.phone || '',
          items: Array.isArray(orderItems) ? orderItems : [],
          subtotal: data.subtotal,
          deliveryFee: data.delivery_fee,
          tax: data.tax,
          discount: data.discount || 0,
          total: data.total,
          status: data.order_status,
          paymentStatus: data.payment_status,
          paymentMethod: data.payment_method,
          shippingAddress: {
            completeAddress: addressDetails?.complete_address || '',
            mapAddress: addressDetails?.map_address || deliveryLocation?.address || '',
            plotNumber: addressDetails?.plotNumber || '',
            street: addressDetails?.street || '',
            city: deliveryLocation?.address?.split(',').slice(-2, -1)[0]?.trim() || 'Unknown',
            state: deliveryLocation?.address?.split(',').slice(-1)[0]?.trim() || 'Unknown',
            pincode: addressDetails?.pincode || '',
            landmark: addressDetails?.landmark || '',
            latitude: addressDetails?.latitude || deliveryLocation?.lat,
            longitude: addressDetails?.longitude || deliveryLocation?.lng
          },
          orderDate: data.created_at,
          deliveryDate: data.actual_delivery,
          trackingNumber: data.tracking_url,
          notes: data.special_instructions,
          couponCode: data.coupon_code,
          razorpayPaymentId: data.razorpay_payment_id,
          razorpayOrderId: data.razorpay_order_id
        };
        setOrder(orderDetail);
      }
    } catch (error: any) {
      console.error('Error fetching order:', error);
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive",
      });
      navigate('/profile?tab=orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'placed':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Order not found</h1>
        <Button onClick={() => navigate('/profile?tab=orders')}>
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/profile?tab=orders')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
              <p className="text-muted-foreground">
                Placed on {formatDate(order.orderDate)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
            <Badge className={getPaymentStatusColor(order.paymentStatus)}>
              {order.paymentStatus}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Items ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <img
                        src={item.image || '/api/placeholder/64/64'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/64/64';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.weight}</p>
                        <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{item.price} × {item.quantity}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{order.deliveryFee === 0 ? 'Free' : `₹${order.deliveryFee}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{order.tax.toLocaleString('en-IN')}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                      <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{order.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">Order Placed</p>
                      <p className="text-sm text-muted-foreground">{formatDate(order.orderDate)}</p>
                    </div>
                  </div>
                  
                  {['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) && (
                    <div className="flex items-center space-x-3">
                      <Package className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Order Confirmed</p>
                        <p className="text-sm text-muted-foreground">Your order is being processed</p>
                      </div>
                    </div>
                  )}

                  {['shipped', 'delivered'].includes(order.status) && (
                    <div className="flex items-center space-x-3">
                      <Truck className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Order Shipped</p>
                        <p className="text-sm text-muted-foreground">
                          {order.trackingNumber ? `Tracking: ${order.trackingNumber}` : 'Your order is on the way'}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.status === 'delivered' && order.deliveryDate && (
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">Order Delivered</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.deliveryDate)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="font-medium">{order.customerName}</p>
                  {order.shippingAddress.completeAddress ? (
                    <p className="text-sm">{order.shippingAddress.completeAddress}</p>
                  ) : (
                    <>
                      <p className="text-sm">{order.shippingAddress.plotNumber}</p>
                      <p className="text-sm">{order.shippingAddress.street}</p>
                      <p className="text-sm">
                        {order.shippingAddress.city}, {order.shippingAddress.state}
                      </p>
                    </>
                  )}
                  <p className="text-sm">{order.shippingAddress.pincode}</p>
                  {order.shippingAddress.landmark && (
                    <p className="text-sm text-muted-foreground">
                      Landmark: {order.shippingAddress.landmark}
                    </p>
                  )}
                </div>
                
                {/* Map Location */}
                {order.shippingAddress.mapAddress && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-sm mb-2">Map Location</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">{order.shippingAddress.mapAddress}</p>
                      {order.shippingAddress.latitude && order.shippingAddress.longitude && (
                        <div className="mt-2">
                          <a
                            href={`https://www.google.com/maps?q=${order.shippingAddress.latitude},${order.shippingAddress.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            View on Google Maps
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Payment Method</span>
                    <span className="text-sm font-medium uppercase">{order.paymentMethod}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Payment Status</span>
                    <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Total Amount</span>
                    <span className="text-sm font-bold">₹{order.total.toLocaleString('en-IN')}</span>
                  </div>

                  {order.razorpayPaymentId && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Payment ID: {order.razorpayPaymentId}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{order.customerEmail}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{order.customerPhone}</span>
                </div>
              </CardContent>
            </Card>

            {/* Special Instructions */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Special Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{order.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <a href="/contact">Contact Support</a>
                </Button>
                {order.trackingNumber && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={order.trackingNumber} target="_blank" rel="noopener noreferrer">
                      Track Package
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOrderDetail;