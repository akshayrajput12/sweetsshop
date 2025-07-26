import { useState } from 'react';
import { ArrowLeft, MapPin, CreditCard, Truck, Tag, User, Phone, Mail, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/store/useStore';
import { formatPrice } from '@/utils/currency';
import { initiateRazorpayPayment, OrderData } from '@/utils/razorpay';
import LocationPicker from '@/components/LocationPicker';
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
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Customer Information
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Delivery Location
  const [deliveryLocation, setDeliveryLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  // Address Details
  const [addressDetails, setAddressDetails] = useState({
    plotNumber: '',
    buildingName: '',
    street: '',
    landmark: '',
    pincode: '',
    addressType: 'home' as 'home' | 'work' | 'other',
    saveAs: ''
  });

  const steps = [
    { id: 'info', title: 'Contact Info', description: 'Your details' },
    { id: 'location', title: 'Delivery Location', description: 'Where to deliver' },
    { id: 'address', title: 'Address Details', description: 'Complete address' },
    { id: 'payment', title: 'Payment', description: 'Choose payment method' },
    { id: 'summary', title: 'Order Summary', description: 'Review & confirm' }
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
    // Validation for each step
    if (currentStep === 1) {
      if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
        toast({
          title: "Missing Information",
          description: "Please fill in all contact details.",
          variant: "destructive",
        });
        return;
      }
    } else if (currentStep === 2) {
      if (!deliveryLocation) {
        toast({
          title: "Location Required",
          description: "Please select a delivery location.",
          variant: "destructive",
        });
        return;
      }
    } else if (currentStep === 3) {
      if (!addressDetails.plotNumber || !addressDetails.street || !addressDetails.pincode) {
        toast({
          title: "Address Details Required",
          description: "Please fill in plot number, street, and pincode.",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'cod') {
      // Handle Cash on Delivery
      clearCart();
      toast({
        title: "Order placed successfully!",
        description: "Your order will be delivered with Cash on Delivery option.",
      });
      navigate('/');
    } else {
      // Handle Online Payment with Razorpay
      if (!deliveryLocation) {
        toast({
          title: "Error",
          description: "Please select a delivery location.",
          variant: "destructive",
        });
        return;
      }

      setIsProcessingPayment(true);

      const completeAddress = {
        ...deliveryLocation!,
        plotNumber: addressDetails.plotNumber,
        buildingName: addressDetails.buildingName,
        street: addressDetails.street,
        landmark: addressDetails.landmark,
        pincode: addressDetails.pincode,
        addressType: addressDetails.addressType,
        saveAs: addressDetails.saveAs
      };

      const orderData: OrderData = {
        orderId: `ORDER_${Date.now()}`,
        amount: Math.round(total),
        currency: 'INR',
        items: cartItems,
        customerInfo,
        deliveryAddress: completeAddress
      };

      try {
        await initiateRazorpayPayment(
          orderData,
          (response) => {
            // Payment successful
            clearCart();
            toast({
              title: "Payment Successful!",
              description: `Payment ID: ${response.razorpay_payment_id}`,
            });
            navigate('/');
            setIsProcessingPayment(false);
          },
          (error) => {
            // Payment failed
            console.error('Payment error:', error);
            toast({
              title: "Payment Failed",
              description: error.message || "Something went wrong with the payment.",
              variant: "destructive",
            });
            setIsProcessingPayment(false);
          }
        );
      } catch (error) {
        console.error('Order creation error:', error);
        toast({
          title: "Error",
          description: "Failed to create order. Please try again.",
          variant: "destructive",
        });
        setIsProcessingPayment(false);
      }
    }
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
          {/* Step 1: Contact Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 text-sm">
                        Your information is secure
                      </h4>
                      <p className="text-blue-700 text-sm mt-1">
                        We use your contact details only for order updates and delivery coordination.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleNextStep} size="lg" className="px-8">
                    Continue to Location
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Delivery Location */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Delivery Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-900 text-sm">
                        Fast Delivery Available
                      </h4>
                      <p className="text-orange-700 text-sm mt-1">
                        Get your fresh meat delivered in 30-45 minutes in selected areas.
                      </p>
                    </div>
                  </div>
                </div>

                <LocationPicker
                  onLocationSelect={(location) => {
                    setDeliveryLocation(location);
                  }}
                  initialLocation={deliveryLocation || undefined}
                />

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handlePrevStep} size="lg" className="px-8">
                    Back to Contact
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    disabled={!deliveryLocation}
                    size="lg"
                    className="px-8"
                  >
                    Continue to Address
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Address Details */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Complete Address Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 text-sm">
                        Selected Location
                      </h4>
                      <p className="text-blue-700 text-sm mt-1">
                        {deliveryLocation?.address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plotNumber" className="text-sm font-medium">
                      Plot/House Number *
                    </Label>
                    <Input
                      id="plotNumber"
                      type="text"
                      placeholder="e.g., 123, A-45"
                      value={addressDetails.plotNumber}
                      onChange={(e) => setAddressDetails({...addressDetails, plotNumber: e.target.value})}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buildingName" className="text-sm font-medium">
                      Building/Society Name
                    </Label>
                    <Input
                      id="buildingName"
                      type="text"
                      placeholder="e.g., Green Valley Apartments"
                      value={addressDetails.buildingName}
                      onChange={(e) => setAddressDetails({...addressDetails, buildingName: e.target.value})}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street" className="text-sm font-medium">
                    Street/Area *
                  </Label>
                  <Input
                    id="street"
                    type="text"
                    placeholder="e.g., MG Road, Sector 15"
                    value={addressDetails.street}
                    onChange={(e) => setAddressDetails({...addressDetails, street: e.target.value})}
                    className="h-12"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="landmark" className="text-sm font-medium">
                      Nearby Landmark
                    </Label>
                    <Input
                      id="landmark"
                      type="text"
                      placeholder="e.g., Near Metro Station"
                      value={addressDetails.landmark}
                      onChange={(e) => setAddressDetails({...addressDetails, landmark: e.target.value})}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode" className="text-sm font-medium">
                      Pincode *
                    </Label>
                    <Input
                      id="pincode"
                      type="text"
                      placeholder="e.g., 110001"
                      value={addressDetails.pincode}
                      onChange={(e) => setAddressDetails({...addressDetails, pincode: e.target.value})}
                      className="h-12"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Save this address as</Label>
                  <RadioGroup
                    value={addressDetails.addressType}
                    onValueChange={(value: 'home' | 'work' | 'other') =>
                      setAddressDetails({...addressDetails, addressType: value})
                    }
                    className="flex space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="home" id="home" />
                      <Label htmlFor="home" className="cursor-pointer">🏠 Home</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="work" id="work" />
                      <Label htmlFor="work" className="cursor-pointer">🏢 Work</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="cursor-pointer">📍 Other</Label>
                    </div>
                  </RadioGroup>

                  {addressDetails.addressType === 'other' && (
                    <Input
                      placeholder="Enter custom name (e.g., Friend's Place)"
                      value={addressDetails.saveAs}
                      onChange={(e) => setAddressDetails({...addressDetails, saveAs: e.target.value})}
                      className="h-12 mt-2"
                    />
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handlePrevStep} size="lg" className="px-8">
                    Back to Location
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    disabled={!addressDetails.plotNumber || !addressDetails.street || !addressDetails.pincode}
                    size="lg"
                    className="px-8"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Payment */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  {/* Pay Online Option */}
                  <div className="relative">
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-base">Pay Online</div>
                            <div className="text-sm text-gray-600 mt-1">
                              Credit/Debit Card, UPI, Net Banking, Wallets
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                              VISA
                            </div>
                            <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                              MC
                            </div>
                            <div className="w-8 h-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">
                              UPI
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                    {paymentMethod === 'online' && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700 font-medium">
                            Secure payment powered by Razorpay
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cash on Delivery Option */}
                  <div className="relative">
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-base">Cash on Delivery</div>
                            <div className="text-sm text-gray-600 mt-1">
                              Pay when your order is delivered
                            </div>
                          </div>
                          <div className="text-2xl">💵</div>
                        </div>
                      </Label>
                    </div>
                    {paymentMethod === 'cod' && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-700">
                            Please keep exact change ready for faster delivery
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </RadioGroup>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handlePrevStep} size="lg" className="px-8">
                    Back to Address
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    size="lg"
                    className="px-8"
                  >
                    Review Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Order Summary */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* Order Summary Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <Shield className="h-5 w-5 mr-2" />
                    Review Your Order
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Personal Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <User className="h-5 w-5 mr-2" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{customerInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{customerInfo.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{customerInfo.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <MapPin className="h-5 w-5 mr-2" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {addressDetails.plotNumber}
                          {addressDetails.buildingName && `, ${addressDetails.buildingName}`}
                        </p>
                        <p className="text-gray-600">
                          {addressDetails.street}
                          {addressDetails.landmark && `, Near ${addressDetails.landmark}`}
                        </p>
                        <p className="text-gray-600">
                          Pincode: {addressDetails.pincode}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {addressDetails.addressType === 'home' ? '🏠 Home' :
                             addressDetails.addressType === 'work' ? '🏢 Work' :
                             `📍 ${addressDetails.saveAs || 'Other'}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                      <strong>Map Location:</strong> {deliveryLocation?.address}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Truck className="h-5 w-5 mr-2" />
                    Order Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">
                            {item.weight} • Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatPrice(item.price * item.quantity)}</p>
                          <p className="text-sm text-gray-500">
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                      <div className="flex items-center space-x-3">
                        {paymentMethod === 'cod' ? (
                          <>
                            <div className="text-2xl">💵</div>
                            <div>
                              <p className="font-medium">Cash on Delivery</p>
                              <p className="text-sm text-gray-600">Pay when your order is delivered</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-2xl">💳</div>
                            <div>
                              <p className="font-medium">Pay Online</p>
                              <p className="text-sm text-gray-600">Secure payment via Razorpay</p>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-green-600">{formatPrice(total)}</p>
                      </div>
                    </div>

                    {/* Bill Breakdown */}
                    <div className="border rounded-lg p-4 space-y-3">
                      <h4 className="font-medium text-gray-900">Bill Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Item Total</span>
                          <span>{formatPrice(subtotal)}</span>
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
                        <div className="flex justify-between">
                          <span>Taxes & Charges</span>
                          <span>{formatPrice(tax)}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount Applied</span>
                            <span>-{formatPrice(discount)}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total Amount</span>
                          <span>{formatPrice(total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handlePrevStep} size="lg" className="px-8">
                      Back to Payment
                    </Button>
                    <Button
                      onClick={handlePlaceOrder}
                      size="lg"
                      className="px-8 bg-green-600 hover:bg-green-700"
                      disabled={isProcessingPayment}
                    >
                      {isProcessingPayment ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span>{paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'} {formatPrice(total)}</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Items Summary */}
              {currentStep < 5 && (
                <>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-700">
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items in cart
                    </h4>
                    {cartItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 py-2">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm truncate">{item.name}</h5>
                          <p className="text-xs text-gray-500">
                            {item.weight} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                    {cartItems.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{cartItems.length - 3} more items
                      </p>
                    )}
                  </div>

                  <Separator />
                </>
              )}

              {/* Progress Indicator */}
              {currentStep < 5 && (
                <>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700">Progress</h4>
                    <div className="space-y-2">
                      <div className={`flex items-center space-x-2 text-sm ${currentStep >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-4 h-4 rounded-full ${currentStep >= 1 ? 'bg-green-600' : 'bg-gray-300'} flex items-center justify-center`}>
                          {currentStep > 1 ? <span className="text-white text-xs">✓</span> : <span className="text-white text-xs">1</span>}
                        </div>
                        <span>Contact Info</span>
                      </div>
                      <div className={`flex items-center space-x-2 text-sm ${currentStep >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-4 h-4 rounded-full ${currentStep >= 2 ? 'bg-green-600' : 'bg-gray-300'} flex items-center justify-center`}>
                          {currentStep > 2 ? <span className="text-white text-xs">✓</span> : <span className="text-white text-xs">2</span>}
                        </div>
                        <span>Location</span>
                      </div>
                      <div className={`flex items-center space-x-2 text-sm ${currentStep >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-4 h-4 rounded-full ${currentStep >= 3 ? 'bg-green-600' : 'bg-gray-300'} flex items-center justify-center`}>
                          {currentStep > 3 ? <span className="text-white text-xs">✓</span> : <span className="text-white text-xs">3</span>}
                        </div>
                        <span>Address Details</span>
                      </div>
                      <div className={`flex items-center space-x-2 text-sm ${currentStep >= 4 ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-4 h-4 rounded-full ${currentStep >= 4 ? 'bg-green-600' : 'bg-gray-300'} flex items-center justify-center`}>
                          {currentStep > 4 ? <span className="text-white text-xs">✓</span> : <span className="text-white text-xs">4</span>}
                        </div>
                        <span>Payment</span>
                      </div>
                      <div className={`flex items-center space-x-2 text-sm ${currentStep >= 5 ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-4 h-4 rounded-full ${currentStep >= 5 ? 'bg-green-600' : 'bg-gray-300'} flex items-center justify-center`}>
                          <span className="text-white text-xs">5</span>
                        </div>
                        <span>Review & Confirm</span>
                      </div>
                    </div>
                  </div>

                  <Separator />
                </>
              )}
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