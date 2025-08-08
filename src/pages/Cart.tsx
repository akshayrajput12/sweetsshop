import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import { formatPrice } from '@/utils/currency';
import { supabase } from '@/integrations/supabase/client';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart } = useStore();

  // Dynamic settings from database
  const [settings, setSettings] = useState<Record<string, any>>({
    tax_rate: 18,
    delivery_charge: 50,
    free_delivery_threshold: 1000,
    currency_symbol: '₹'
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['tax_rate', 'delivery_charge', 'free_delivery_threshold', 'currency_symbol']);

      if (error) throw error;

      const settingsObj: Record<string, any> = {};
      data?.forEach(setting => {
        try {
          settingsObj[setting.key] = typeof setting.value === 'string' 
            ? JSON.parse(setting.value) 
            : setting.value;
        } catch {
          settingsObj[setting.key] = setting.value;
        }
      });

      setSettings(prev => ({ ...prev, ...settingsObj }));
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * (settings.tax_rate / 100);
  const deliveryFee = subtotal >= settings.free_delivery_threshold ? 0 : settings.delivery_charge;
  const total = subtotal + tax + deliveryFee;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-16 w-16 sm:h-24 sm:w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8 text-sm sm:text-base">
            Looks like you haven't added any items to your cart yet.
          </p>
          <div className="space-y-3">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/products">Start Shopping</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild className="sm:hidden">
            <Link to="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Shopping Cart</h1>
            <p className="text-sm text-muted-foreground">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items in cart
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild className="hidden sm:flex">
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  {/* Product Image and Info */}
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-lg line-clamp-2">{item.name}</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        {item.weight}{item.pieces && ` • ${item.pieces}`}
                      </p>
                      <p className="font-bold text-primary text-sm sm:text-base mt-1">
                        {settings.currency_symbol}{item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Controls and Price */}
                  <div className="flex items-center justify-between sm:justify-end sm:space-x-6">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <span className="font-medium min-w-[2rem] text-center text-sm sm:text-base">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>

                    {/* Price and Remove */}
                    <div className="text-right">
                      <p className="font-bold text-sm sm:text-base">
                        {settings.currency_symbol}{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 mt-1 h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Tax ({settings.tax_rate}%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    formatPrice(deliveryFee)
                  )}
                </span>
              </div>

              {deliveryFee > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700 font-medium">
                    💡 Add {formatPrice(settings.free_delivery_threshold - subtotal)} more for FREE delivery!
                  </p>
                </div>
              )}

              {/* COD Fee Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">COD Fee (if applicable)</span>
                  <span className="text-sm font-medium text-blue-700">
                    {settings.currency_symbol}{settings.cod_charge}
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Additional {settings.currency_symbol}{settings.cod_charge} for Cash on Delivery orders
                </p>
              </div>
              
              <hr />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>

              <p className="text-xs text-muted-foreground">
                Final total will be calculated at checkout based on payment method
              </p>
              
              <Button asChild className="w-full" size="lg">
                <Link to="/checkout">
                  Proceed to Checkout
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link to="/products">
                  Continue Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;