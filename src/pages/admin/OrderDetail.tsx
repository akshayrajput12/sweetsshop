import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, User, CreditCard, Phone, Mail, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { downloadInvoice, validateInvoiceData } from '@/utils/invoiceGenerator';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  weight: string;
}

interface OrderDetail {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  codFee: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  couponCode?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    mapAddress?: string;
    latitude?: number;
    longitude?: number;
  };
  orderDate: string;
  deliveryDate?: string;
  trackingNumber?: string;
  notes?: string;
}

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const customerInfo = data.customer_info as any;
        const addressDetails = data.address_details as any;
        const orderItems = data.items as any;
        
        const deliveryLocation = data.delivery_location as any;
        
        const orderDetail: OrderDetail = {
          id: data.order_number,
          customerName: customerInfo?.name || 'Unknown Customer',
          customerEmail: customerInfo?.email || '',
          customerPhone: customerInfo?.phone || '',
          items: Array.isArray(orderItems) ? orderItems : [],
          subtotal: data.subtotal,
          deliveryFee: data.delivery_fee,
          codFee: data.cod_fee || 0,  // This should now work with updated types
          tax: data.tax,
          discount: data.discount || 0,
          total: data.total,
          status: data.order_status as any,
          paymentStatus: data.payment_status as any,
          paymentMethod: data.payment_method,
          couponCode: data.coupon_code,
          razorpayPaymentId: data.razorpay_payment_id,
          razorpayOrderId: data.razorpay_order_id,
          shippingAddress: {
            street: addressDetails?.complete_address || addressDetails?.address_line_1 || '',
            city: deliveryLocation?.address || addressDetails?.city || '',
            state: addressDetails?.state || '',
            pincode: addressDetails?.pincode || '',
            landmark: addressDetails?.landmark || '',
            mapAddress: addressDetails?.map_address || deliveryLocation?.address || '',
            latitude: addressDetails?.latitude || deliveryLocation?.lat,
            longitude: addressDetails?.longitude || deliveryLocation?.lng
          },
          orderDate: data.created_at,
          deliveryDate: data.actual_delivery,
          trackingNumber: data.tracking_url,
          notes: data.special_instructions
        };
        setOrder(orderDetail);
        setCurrentStatus(orderDetail.status);
      }
    } catch (error: any) {
      console.error('Error fetching order:', error);
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive",
      });
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
      case 'pending':
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

  const updateOrderStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setCurrentStatus(newStatus);
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;

    try {
      // Skip the database function call since generate_invoice_data doesn't exist
      // Directly generate invoice data from current order
      
      // Fetch store settings
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['store_name', 'store_address', 'store_phone', 'store_email', 'currency_symbol']);

      if (settingsError) {
        console.warn('Error fetching settings:', settingsError);
      }

      const storeSettings = settings?.reduce((acc: Record<string, any>, setting: any) => {
        acc[setting.key] = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
        return acc;
      }, {}) || {};

      const invoiceData = {
        invoice_number: `INV-${order.id}`,
        order_number: order.id,
        invoice_date: new Date().toLocaleDateString('en-IN'),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
        order_date: formatDate(order.orderDate),
        store_info: {
          store_name: storeSettings.store_name || 'SuperSweets',
          store_address: storeSettings.store_address || 'Shop number 5, Patel Nagar, Hansi road, Patiala chowk, JIND (Haryana) 126102',
          store_phone: storeSettings.store_phone || '+91 9996616153',
          store_email: storeSettings.store_email || 'contact@supersweets.fit',
          currency_symbol: storeSettings.currency_symbol || '₹'
        },
        customer_info: {
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone
        },
        delivery_address: order.shippingAddress,
        items: order.items,
        pricing: {
          subtotal: order.subtotal,
          tax: order.tax,
          delivery_fee: order.deliveryFee,
          cod_fee: order.codFee,
          discount: order.discount,
          total: order.total
        },
        payment_info: {
          method: order.paymentMethod,
          status: order.paymentStatus,
          razorpay_payment_id: order.razorpayPaymentId
        },
        order_status: order.status,
        coupon_code: order.couponCode,
        special_instructions: order.notes
      };

      if (!validateInvoiceData(invoiceData)) {
        throw new Error('Invalid invoice data');
      }

      // Download the invoice
      await downloadInvoice(invoiceData);
      
      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      });
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to download invoice",
        variant: "destructive",
      });
    }
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
        <Button onClick={() => navigate('/admin/orders')}>
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order #{order.id}</h1>
            <p className="text-muted-foreground">
              Placed on {formatDate(order.orderDate)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleDownloadInvoice}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download Invoice</span>
            <span className="sm:hidden">Invoice</span>
          </Button>
          
          <Badge className={getStatusColor(currentStatus)}>
            {currentStatus}
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
              <CardTitle>Order Items ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.weight}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.price} × {item.quantity}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-3 text-gray-700">Price Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Item Total ({order.items.length} items)</span>
                      <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee</span>
                      <span>
                        {order.deliveryFee === 0 ? (
                          <span className="text-green-600 font-medium">FREE</span>
                        ) : (
                          `₹${order.deliveryFee.toLocaleString('en-IN')}`
                        )}
                      </span>
                    </div>
                    {order.estimatedDeliveryTime && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Estimated Delivery Time</span>
                        <span>{order.estimatedDeliveryTime}</span>
                      </div>
                    )}

                    {order.codFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>COD Fee</span>
                        <span>₹{order.codFee.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span>Tax & Charges</span>
                      <span>₹{order.tax.toLocaleString('en-IN')}</span>
                    </div>

                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>
                          Discount {order.couponCode && (
                            <span className="font-medium">({order.couponCode})</span>
                          )}
                        </span>
                        <span className="font-medium">-₹{order.discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <Separator className="my-2" />
                    
                    <div className="flex justify-between font-bold text-base">
                      <span>Total Amount</span>
                      <span className="text-primary">₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-3 text-blue-700">Payment Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Payment Method</span>
                      <span className="font-medium uppercase">
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Payment Status</span>
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </div>

                    {order.razorpayPaymentId && (
                      <div className="pt-2 border-t border-blue-200">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-blue-600">Payment ID</span>
                            <span className="font-mono">{order.razorpayPaymentId}</span>
                          </div>
                          {order.razorpayOrderId && (
                            <div className="flex justify-between text-xs">
                              <span className="text-blue-600">Order ID</span>
                              <span className="font-mono">{order.razorpayOrderId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {order.paymentMethod === 'cod' && order.paymentStatus === 'pending' && (
                      <div className="pt-2 border-t border-blue-200">
                        <p className="text-xs text-blue-600">
                          Customer will pay ₹{order.total.toLocaleString('en-IN')} on delivery
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
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
                
                {currentStatus !== 'pending' && (
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Order Confirmed</p>
                      <p className="text-sm text-muted-foreground">Processing your order</p>
                    </div>
                  </div>
                )}

                {['shipped', 'delivered'].includes(currentStatus) && (
                  <div className="flex items-center space-x-3">
                    <Truck className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Order Shipped</p>
                      <p className="text-sm text-muted-foreground">
                        Tracking: {order.trackingNumber}
                      </p>
                    </div>
                  </div>
                )}

                {currentStatus === 'delivered' && order.deliveryDate && (
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
          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle>Update Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={currentStatus} onValueChange={updateOrderStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground">Customer</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{order.customerEmail}</p>
                  <p className="text-sm text-muted-foreground">Email</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{order.customerPhone}</p>
                  <p className="text-sm text-muted-foreground">Phone</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                <div className="space-y-1">
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm">{order.shippingAddress.street}</p>
                  <p className="text-sm">
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                  <p className="text-sm">{order.shippingAddress.pincode}</p>
                  {order.shippingAddress.landmark && (
                    <p className="text-sm text-muted-foreground">
                      Landmark: {order.shippingAddress.landmark}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Map Address Section */}
              {order.shippingAddress.mapAddress && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-2">Map Location</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">{order.shippingAddress.mapAddress}</p>
                    {order.shippingAddress.latitude && order.shippingAddress.longitude && (
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>Lat: {order.shippingAddress.latitude.toFixed(6)}</span>
                        <span>Lng: {order.shippingAddress.longitude.toFixed(6)}</span>
                        <a
                          href={`https://www.google.com/maps?q=${order.shippingAddress.latitude},${order.shippingAddress.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View on Map
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
                  <span className="text-sm font-medium uppercase">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                  </span>
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

                {order.codFee > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span className="text-sm">COD Fee Included</span>
                    <span className="text-sm font-medium">₹{order.codFee.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {order.razorpayPaymentId && (
                  <div className="pt-3 border-t">
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Razorpay Payment ID</p>
                        <p className="text-xs font-mono bg-gray-100 p-2 rounded">
                          {order.razorpayPaymentId}
                        </p>
                      </div>
                      {order.razorpayOrderId && (
                        <div>
                          <p className="text-xs text-muted-foreground">Razorpay Order ID</p>
                          <p className="text-xs font-mono bg-gray-100 p-2 rounded">
                            {order.razorpayOrderId}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {order.paymentMethod === 'cod' && order.paymentStatus === 'pending' && (
                  <div className="pt-3 border-t bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-orange-700">
                      <strong>COD Order:</strong> Customer will pay ₹{order.total.toLocaleString('en-IN')} on delivery
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
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
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;