import { useState } from 'react';
import { ArrowLeft, MapPin, CreditCard, Truck, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/store/useStore';
import { formatPrice } from '@/utils/currency';
import Stepper from '@/components/Stepper';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cartItems, clearCart } = useStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [pickupAddress, setPickupAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const steps = [
    { id: 'review', title: 'Review Order', description: 'Check your items' },
    { id: 'pickup', title: 'Pickup Location', description: 'Set delivery address' },
    { id: 'payment', title: 'Payment', description: 'Complete order' }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const deliveryFee = subtotal >= 999 ? 0 : 49;
  const total = subtotal + tax + deliveryFee - discount;

  const applyCoupon = () => {
    if (couponCode === 'SAVE10') {
      setDiscount(subtotal * 0.1);
      toast({
        title: "Coupon applied!",
        description: "You saved 10% on your order.",
      });
    } else if (couponCode === 'FIRST50') {
      setDiscount(50);
      toast({
        title: "Coupon applied!",
        description: "You saved ₹50 on your order.",
      });
    } else {
      toast({
        title: "Invalid coupon",
        description: "Please check your coupon code.",
        variant: "destructive",
      });
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = () => {
    clearCart();
    toast({
      title: "Order placed successfully!",
      description: "You will receive a confirmation email shortly.",
    });
    navigate('/');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Button onClick={() => navigate('/products')}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Review Order */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Review Your Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.weight} • Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button onClick={handleNextStep}>
                    Continue to Pickup Location
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Pickup Location */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Select Pickup Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Map Placeholder */}
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Interactive Google Maps will be displayed here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Click on the map to set your pickup location
                    </p>
                  </div>
                </div>

                {/* Address Input */}
                <div className="space-y-2">
                  <Label htmlFor="pickup-address">Pickup Address</Label>
                  <Input
                    id="pickup-address"
                    placeholder="Enter your complete address"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                  />
                </div>

                {/* Saved Addresses */}
                <div>
                  <Label className="text-sm font-medium">Quick Select</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <Button 
                      variant="outline" 
                      className="h-auto p-3 text-left justify-start"
                      onClick={() => setPickupAddress('123 Food Street, Mumbai, Maharashtra 400001')}
                    >
                      <div>
                        <div className="font-medium">Home</div>
                        <div className="text-sm text-muted-foreground">
                          123 Food Street, Mumbai
                        </div>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto p-3 text-left justify-start"
                      onClick={() => setPickupAddress('456 Business Park, Andheri, Mumbai, Maharashtra 400053')}
                    >
                      <div>
                        <div className="font-medium">Office</div>
                        <div className="text-sm text-muted-foreground">
                          456 Business Park, Andheri
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePrevStep}>
                    Back to Review
                  </Button>
                  <Button 
                    onClick={handleNextStep}
                    disabled={!pickupAddress}
                  >
                    Continue to Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1">
                      Credit/Debit Card
                    </Label>
                    <div className="flex space-x-2">
                      <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
                        VISA
                      </div>
                      <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center">
                        MC
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex-1">
                      UPI Payment
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Label htmlFor="wallet" className="flex-1">
                      Digital Wallet
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1">
                      Cash on Delivery
                    </Label>
                  </div>
                </RadioGroup>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePrevStep}>
                    Back to Address
                  </Button>
                  <Button onClick={handlePlaceOrder} size="lg">
                    Place Order - {formatPrice(total)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Tax (5%)</span>
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

              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <Separator />

              {/* Coupon Section */}
              <div className="space-y-3">
                <Label className="flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Apply Coupon
                </Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button variant="outline" onClick={applyCoupon}>
                    Apply
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Available: SAVE10 (10% off), FIRST50 (₹50 off)
                </div>
              </div>

              <Separator />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {currentStep === 3 && (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handlePlaceOrder}
                >
                  Pay {formatPrice(total)}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;