import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import { formatPrice } from '@/utils/currency';
import { useSettings } from '@/hooks/useSettings';
import { toNumber, formatCurrency, calculatePercentage, meetsThreshold } from '@/utils/settingsHelpers';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart } = useStore();
  const { settings, loading: settingsLoading, error: settingsError } = useSettings();

  // Early return if settings are still loading
  if (settingsLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading cart settings...</p>
      </div>
    );
  }

  // Show error if settings failed to load
  if (settingsError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-red-500 mb-4">⚠️ Settings Error</div>
        <p className="text-muted-foreground mb-4">{settingsError}</p>
        <Button onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (toNumber(item.price) * toNumber(item.quantity)), 0);
  const tax = calculatePercentage(subtotal, settings.tax_rate);
  const deliveryFee = meetsThreshold(subtotal, settings.free_delivery_threshold) ? 0 : toNumber(settings.delivery_charge);
  const total = subtotal + tax + deliveryFee;
  

  
  // Check if minimum order amount is met
  const minOrderAmount = toNumber(settings.min_order_amount);
  const isMinOrderMet = subtotal >= minOrderAmount;
  const minOrderShortfall = Math.max(0, minOrderAmount - subtotal);

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
                        {formatCurrency(item.price, settings.currency_symbol)}
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
                        {formatCurrency(toNumber(item.price) * toNumber(item.quantity), settings.currency_symbol)}
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
                <span>Tax ({toNumber(settings.tax_rate).toFixed(0)}%)</span>
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
                    💡 Add {formatPrice(toNumber(settings.free_delivery_threshold) - subtotal)} more for FREE delivery!
                  </p>
                </div>
              )}

              {/* COD Fee Information */}
              {settings.cod_enabled && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">COD Fee (if applicable)</span>
                    <span className="text-sm font-medium text-blue-700">
                      {formatCurrency(settings.cod_charge, settings.currency_symbol)}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Additional {formatCurrency(settings.cod_charge, settings.currency_symbol)} for Cash on Delivery orders
                  </p>
                  {settings.cod_threshold && (
                    <p className="text-xs text-blue-600 mt-1">
                      COD available for orders up to {formatCurrency(settings.cod_threshold, settings.currency_symbol)}
                    </p>
                  )}
                </div>
              )}
              
              <hr />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>

              {/* Minimum Order Validation */}
              {!isMinOrderMet && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-700 font-medium">
                    ⚠️ Minimum order amount: {formatCurrency(minOrderAmount, settings.currency_symbol)}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Add {formatPrice(minOrderShortfall)} more to proceed to checkout
                  </p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Final total will be calculated at checkout based on payment method
              </p>
              
              <Button 
                asChild 
                className="w-full" 
                size="lg"
                disabled={!isMinOrderMet}
              >
                <Link to="/checkout">
                  {isMinOrderMet ? 'Proceed to Checkout' : `Add ${formatPrice(minOrderShortfall)} More`}
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

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
              </p>
              <p className="font-bold text-lg">{formatPrice(total)}</p>
            </div>
            <div className="text-right">
              {!isMinOrderMet && (
                <p className="text-xs text-orange-600 mb-1">
                  Add {formatPrice(minOrderShortfall)} more
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                + COD fee if applicable
              </p>
            </div>
          </div>
          
          {!isMinOrderMet && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-3">
              <p className="text-xs text-orange-700 text-center">
                Minimum order: {formatCurrency(minOrderAmount, settings.currency_symbol)}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              asChild 
              variant="outline" 
              className="flex-1"
            >
              <Link to="/products">
                Continue Shopping
              </Link>
            </Button>
            <Button 
              asChild 
              className="flex-1" 
              disabled={!isMinOrderMet}
            >
              <Link to="/checkout">
                {isMinOrderMet ? 'Checkout' : 'Add More Items'}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Add bottom padding to prevent content from being hidden behind sticky bar */}
      <div className="lg:hidden h-32"></div>
    </div>
  );
};

export default Cart;