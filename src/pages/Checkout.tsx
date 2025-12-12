import { useState, useEffect } from 'react';
import { ArrowLeft, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/store/useStore';
import { formatPrice } from '@/utils/currency';
import { initiateRazorpayPayment, OrderData } from '@/utils/razorpay';

import AddressManager from '@/components/AddressManager';
import Stepper from '@/components/Stepper';
import GuestOrderPopup from '@/components/GuestOrderPopup';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { validateContactInfo, validateAddressDetails, validatePaymentMethod } from '@/utils/validation';
import { useSettings } from '@/hooks/useSettings';
import { toNumber, formatCurrency, calculatePercentage, meetsThreshold } from '@/utils/settingsHelpers';

// Import the new components
import CheckoutContactInfo from './Checkout/CheckoutContactInfo';
import CheckoutAddressDetails from './Checkout/CheckoutAddressDetails';
import CheckoutPayment from './Checkout/CheckoutPayment';
import CheckoutSummary from './Checkout/CheckoutSummary';

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cartItems, clearCart } = useStore();
  const { settings, loading: settingsLoading, error: settingsError } = useSettings();
  const [currentStep, setCurrentStep] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [showGuestOrderPopup, setShowGuestOrderPopup] = useState(false);
  const [guestOrderData, setGuestOrderData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Pincode serviceability is now always true since we removed the API check
  const [isPincodeServiceable, setIsPincodeServiceable] = useState(true);

  // Form validation states
  const [contactErrors, setContactErrors] = useState<string[]>([]);
  const [addressErrors, setAddressErrors] = useState<string[]>([]);

  // Customer Information
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Address Details
  const [addressDetails, setAddressDetails] = useState({
    plotNumber: '',
    buildingName: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'home' as 'home' | 'work' | 'other',
    saveAs: ''
  });

  const steps = [
    { id: 'info', title: 'Contact Info', description: 'Your details' },
    { id: 'address', title: 'Address Details', description: 'Complete address' },
    { id: 'payment', title: 'Payment', description: 'Choose payment method' },
    { id: 'summary', title: 'Order Summary', description: 'Review & confirm' }
  ];

  useEffect(() => {
    fetchProductCoupons();
    fetchSavedAddresses();
    getCurrentUser();
  }, [cartItems]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error getting current user:', error);
      setCurrentUser(null);
    }
  };

  const fetchSavedAddresses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setSavedAddresses([]);
        return;
      }

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setSavedAddresses(data || []);
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
    }
  };

  const handleSavedAddressSelect = (address: any) => {
    setSelectedAddress(address);
    setUseExistingAddress(true);

    setAddressDetails({
      plotNumber: address.address_line_1.split(',')[0] || '',
      buildingName: '',
      street: address.address_line_2 || '',
      landmark: address.landmark || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode,
      addressType: address.type,
      saveAs: address.type === 'other' ? address.name : ''
    });
  };

  const saveAddressToProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      if (savedAddresses.length >= 3) {
        toast({
          title: "Address Limit Reached",
          description: "You can only save up to 3 addresses. Please delete an existing address first.",
          variant: "destructive",
        });
        return;
      }

      const addressData = {
        user_id: user.id,
        name: addressDetails.addressType === 'other' ? addressDetails.saveAs : addressDetails.addressType,
        address_line_1: addressDetails.plotNumber,
        address_line_2: addressDetails.street,
        city: addressDetails.city,
        state: addressDetails.state,
        pincode: addressDetails.pincode,
        landmark: addressDetails.landmark,
        type: addressDetails.addressType,
        latitude: null,
        longitude: null,
        is_default: savedAddresses.length === 0
      };

      const { error } = await supabase
        .from('addresses')
        .insert([addressData]);

      if (error) throw error;

      toast({
        title: "Address Saved",
        description: "Your address has been saved to your profile for future use.",
      });

      fetchSavedAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Error",
        description: "Failed to save address to profile.",
        variant: "destructive",
      });
    }
  };

  const fetchProductCoupons = async () => {
    try {
      const productIds = cartItems.map(item => item.id);

      if (productIds.length === 0) return;

      const { data: productCoupons, error: pcError } = await supabase
        .from('product_coupons')
        .select(`
          coupon_id,
          coupons (
            id,
            code,
            description,
            discount_type,
            discount_value,
            min_order_amount,
            max_discount_amount,
            is_active,
            valid_from,
            valid_until
          )
        `)
        .in('product_id', productIds);

      if (pcError) throw pcError;

      const productSpecificCoupons = productCoupons
        ?.map(pc => pc.coupons)
        .filter(c => c !== null && c.is_active && new Date(c.valid_until) > new Date())
        .filter((coupon, index, self) =>
          index === self.findIndex(c => c.id === coupon.id)
        ) || [];

      setAvailableCoupons(productSpecificCoupons);
    } catch (error) {
      console.error('Error fetching product coupons:', error);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (toNumber(item.price) * toNumber(item.quantity)), 0);
  const tax = calculatePercentage(subtotal, settings.tax_rate);

  const deliveryFee = meetsThreshold(subtotal, settings.free_delivery_threshold) ? 0 : toNumber(settings.delivery_charge);
  const estimatedDeliveryTime = `${settings.delivery_time_estimate || '3-5 business days'}`;

  const codFee = paymentMethod === 'cod' ? toNumber(settings.cod_charge) : 0;
  const total = subtotal + tax + deliveryFee + codFee - discount;

  const isMinOrderMet = subtotal >= toNumber(settings.min_order_amount);
  const minOrderShortfall = Math.max(0, toNumber(settings.min_order_amount) - subtotal);

  const applyCoupon = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast({
          title: "Invalid coupon",
          description: "Please check your coupon code.",
          variant: "destructive",
        });
        return;
      }

      if (data.min_order_amount && subtotal < data.min_order_amount) {
        toast({
          title: "Minimum order not met",
          description: `Minimum order of ${settings.currency_symbol}${data.min_order_amount} required for this coupon.`,
          variant: "destructive",
        });
        return;
      }

      if (data.usage_limit && data.used_count >= data.usage_limit) {
        toast({
          title: "Coupon expired",
          description: "This coupon has reached its usage limit.",
          variant: "destructive",
        });
        return;
      }

      let discountAmount = 0;
      if (data.discount_type === 'percentage') {
        discountAmount = (subtotal * data.discount_value) / 100;
        if (data.max_discount_amount) {
          discountAmount = Math.min(discountAmount, data.max_discount_amount);
        }
      } else {
        discountAmount = data.discount_value;
      }

      setDiscount(discountAmount);
      setAppliedCoupon(data);
      toast({
        title: "Coupon applied!",
        description: `You saved ${settings.currency_symbol}${discountAmount.toFixed(2)} on your order.`,
      });
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast({
        title: "Error",
        description: "Failed to apply coupon.",
        variant: "destructive",
      });
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode('');
    toast({
      title: "Coupon removed",
      description: "Coupon has been removed from your order.",
    });
  };

  const handleNextStep = () => {
    if (subtotal < toNumber(settings.min_order_amount)) {
      toast({
        title: "Minimum Order Not Met",
        description: `Minimum order amount is ${formatCurrency(settings.min_order_amount, settings.currency_symbol)}. Please add more items to your cart.`,
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 1) {
      const validation = validateContactInfo(customerInfo);
      if (!validation.isValid) {
        setContactErrors(validation.errors);
        toast({
          title: "Invalid Information",
          description: validation.errors[0],
          variant: "destructive",
        });
        return;
      }
      setContactErrors([]);
    } else if (currentStep === 2) {
      if (!addressDetails.city || !addressDetails.state || !addressDetails.pincode) {
        toast({
          title: "Missing Location Information",
          description: "Please fill in city, state, and pincode.",
          variant: "destructive",
        });
        return;
      }

      if (!useExistingAddress) {
        const validation = validateAddressDetails(addressDetails);
        if (!validation.isValid) {
          setAddressErrors(validation.errors);
          toast({
            title: "Invalid Address",
            description: validation.errors[0],
            variant: "destructive",
          });
          return;
        }
      }
      setAddressErrors([]);
    } else if (currentStep === 3) {
      const paymentValidation = validatePaymentMethod(paymentMethod, total, settings);
      if (!paymentValidation.isValid) {
        toast({
          title: "Payment Method Error",
          description: paymentValidation.errors[0],
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
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required customer information.",
        variant: "destructive",
      });
      return;
    }

    if (!addressDetails.city || !addressDetails.state) {
      toast({
        title: "Missing Location",
        description: "Please provide your city and state.",
        variant: "destructive",
      });
      return;
    }

    if (!useExistingAddress && (!addressDetails.plotNumber || !addressDetails.street)) {
      toast({
        title: "Missing Address",
        description: "Please provide your complete address details.",
        variant: "destructive",
      });
      return;
    }

    // Validate minimum order amount
    if (subtotal < Number(settings.min_order_amount)) {
      toast({
        title: "Minimum Order Not Met",
        description: `Minimum order amount is ${settings.currency_symbol}${Number(settings.min_order_amount).toFixed(2)}. Please add more items.`,
        variant: "destructive",
      });
      return;
    }

    // Validate COD order limits
    if (paymentMethod === 'cod') {
      if (!settings.cod_enabled) {
        toast({
          title: "COD Not Available",
          description: "Cash on Delivery is currently not available.",
          variant: "destructive",
        });
        return;
      }

      if (total > Number(settings.cod_threshold)) {
        toast({
          title: "COD Limit Exceeded",
          description: `Cash on Delivery is not available for orders above ${settings.currency_symbol}${Number(settings.cod_threshold).toFixed(2)}. Please choose online payment.`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessingPayment(true);

    try {
      const orderNumber = `SS${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const completeAddress = `${addressDetails.plotNumber}, ${addressDetails.buildingName ? addressDetails.buildingName + ', ' : ''}${addressDetails.street}, ${addressDetails.landmark ? 'Near ' + addressDetails.landmark + ', ' : ''}${addressDetails.city}, ${addressDetails.state} - ${addressDetails.pincode}`;

      const { data: { user } } = await supabase.auth.getUser();

      const orderData = {
        user_id: user?.id || null,
        order_number: orderNumber,
        customer_info: customerInfo as any,
        delivery_location: { address: completeAddress } as any,
        address_details: {
          ...addressDetails,
          complete_address: completeAddress,
          latitude: null,
          longitude: null
        } as any,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          weight: item.weight,
          image: item.image,
          category: item.category || 'bulk'
        })) as any,
        subtotal: subtotal,
        tax: tax,
        delivery_fee: deliveryFee,
        estimated_delivery_time: estimatedDeliveryTime,
        cod_fee: codFee,
        discount: discount,
        total: total,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon?.code || null
      };

      if (paymentMethod === 'cod') {
        const codOrderData = {
          ...orderData,
          payment_status: 'pending',
          order_status: 'placed'
        };

        const { data: savedOrder, error: dbError } = await supabase
          .from('orders')
          .insert([codOrderData])
          .select()
          .single();

        if (dbError) throw new Error(`Database error: ${dbError.message}`);

        if (!useExistingAddress && currentUser) {
          await saveAddressToProfile();
        }

        if (appliedCoupon) {
          await supabase
            .from('coupons')
            .update({ used_count: appliedCoupon.used_count + 1 })
            .eq('id', appliedCoupon.id);
        }

        if (!currentUser) {
          const guestOrder = {
            orderNumber: orderNumber,
            customerInfo: customerInfo,
            items: cartItems.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              weight: item.weight,
              image: item.image,
              category: item.category || 'bulk'
            })),
            subtotal: subtotal,
            tax: tax,
            deliveryFee: deliveryFee,
            estimatedDeliveryTime: estimatedDeliveryTime,
            codFee: codFee,
            discount: discount,
            total: total,
            paymentMethod: paymentMethod,
            paymentStatus: 'pending',
            deliveryAddress: {
              plotNumber: addressDetails.plotNumber,
              buildingName: addressDetails.buildingName,
              street: addressDetails.street,
              city: addressDetails.city,
              state: addressDetails.state,
              pincode: addressDetails.pincode,
              landmark: addressDetails.landmark
            },
            orderDate: new Date().toISOString(),
            couponCode: appliedCoupon?.code
          };

          setGuestOrderData(guestOrder);
          setShowGuestOrderPopup(true);

          toast({
            title: "Order Placed Successfully!",
            description: `Your COD order #${orderNumber} has been placed. Please save the order details as you won't be able to view them again.`,
          });
        } else {
          toast({
            title: "Order Placed Successfully!",
            description: `Your COD order #${orderNumber} has been placed. You'll pay ${settings.currency_symbol}${total.toFixed(2)} on delivery.`,
          });

          navigate('/profile?tab=orders');
        }

        clearCart();
      } else {
        const razorpayOrderData: OrderData = {
          orderId: orderNumber,
          amount: Math.round(total),
          currency: 'INR',
          items: cartItems,
          customerInfo,
          deliveryAddress: {
            address: completeAddress,
            lat: 0,
            lng: 0
          }
        };

        await initiateRazorpayPayment(
          razorpayOrderData,
          async (response) => {
            try {
              const onlineOrderData = {
                ...orderData,
                payment_status: 'paid',
                order_status: 'confirmed',
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id
              };

              const { data: savedOrder, error: dbError } = await supabase
                .from('orders')
                .insert([onlineOrderData])
                .select()
                .single();

              if (dbError) throw new Error(`Database error: ${dbError.message}`);

              if (!useExistingAddress && currentUser) {
                await saveAddressToProfile();
              }

              if (appliedCoupon) {
                await supabase
                  .from('coupons')
                  .update({ used_count: appliedCoupon.used_count + 1 })
                  .eq('id', appliedCoupon.id);
              }

              if (!currentUser) {
                const guestOrder = {
                  orderNumber: orderNumber,
                  customerInfo: customerInfo,
                  items: cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    weight: item.weight,
                    image: item.image,
                    category: item.category || 'bulk'
                  })),
                  subtotal: subtotal,
                  tax: tax,
                  deliveryFee: deliveryFee,
                  estimatedDeliveryTime: estimatedDeliveryTime,
                  codFee: codFee,
                  discount: discount,
                  total: total,
                  paymentMethod: paymentMethod,
                  paymentStatus: 'paid',
                  deliveryAddress: {
                    plotNumber: addressDetails.plotNumber,
                    buildingName: addressDetails.buildingName,
                    street: addressDetails.street,
                    city: addressDetails.city,
                    state: addressDetails.state,
                    pincode: addressDetails.pincode,
                    landmark: addressDetails.landmark
                  },
                  orderDate: new Date().toISOString(),
                  couponCode: appliedCoupon?.code
                };

                setGuestOrderData(guestOrder);
                setShowGuestOrderPopup(true);

                toast({
                  title: "Payment Successful!",
                  description: `Order #${orderNumber} confirmed and paid. Please save the order details as you won't be able to view them again.`,
                });
              } else {
                toast({
                  title: "Payment Successful!",
                  description: `Order #${orderNumber} confirmed and paid. Your order is being processed.`,
                });

                navigate('/profile?tab=orders');
              }

              clearCart();
            } catch (error) {
              console.error('Post-payment processing error:', error);
              toast({
                title: "Order Processing Error",
                description: "Payment successful but order processing failed. Please contact support.",
                variant: "destructive",
              });
            }
          },
          (error) => {
            console.error('Payment error:', error);
            toast({
              title: "Payment Failed",
              description: error.message || "Payment was cancelled or failed. Please try again.",
              variant: "destructive",
            });
          }
        );
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center min-h-[60vh] flex flex-col items-center justify-center bg-[#FFFDF7]">
        <h1 className="text-3xl font-serif text-[#2C1810] mb-4">Your cart is empty</h1>
        <Button onClick={() => navigate('/products')} className="bg-[#8B2131] hover:bg-[#701a26] text-white">
          Continue Shopping
        </Button>
      </div>
    );
  }

  if (settingsLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center bg-[#FFFDF7] min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B2131] mx-auto"></div>
        <p className="mt-4 text-[#5D4037]">Loading checkout...</p>
      </div>
    );
  }

  if (settingsError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center bg-[#FFFDF7] min-h-screen">
        <div className="text-[#C53030] mb-4">⚠️ Error loading settings</div>
        <p className="text-[#5D4037]">Please refresh the page to try again.</p>
        <Button onClick={() => window.location.reload()} className="mt-4 bg-[#8B2131] hover:bg-[#701a26]">
          Refresh Page
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF7] pb-10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate(-1)} size="sm" className="text-[#5D4037] hover:text-[#8B2131] hover:bg-[#FFF8F0]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold font-serif text-[#2C1810]">Checkout</h1>
          </div>

          {/* Mobile Total Display */}
          <div className="xl:hidden">
            <div className="text-right">
              <p className="text-sm text-[#5D4037]">Total</p>
              <p className="text-lg font-bold text-[#8B2131]">{formatPrice(total)}</p>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 order-2 xl:order-1">
            {/* Step 1: Contact Information */}
            {currentStep === 1 && (
              <CheckoutContactInfo
                customerInfo={customerInfo}
                setCustomerInfo={setCustomerInfo}
                onNext={handleNextStep}
              />
            )}

            {/* Step 2: Address Details */}
            {currentStep === 2 && (
              <CheckoutAddressDetails
                addressDetails={addressDetails}
                setAddressDetails={setAddressDetails}
                savedAddresses={savedAddresses}
                selectedAddress={selectedAddress}
                setSelectedAddress={setSelectedAddress}
                useExistingAddress={useExistingAddress}
                setUseExistingAddress={setUseExistingAddress}
                showAddressForm={showAddressForm}
                setShowAddressForm={setShowAddressForm}
                settings={settings}
                subtotal={subtotal}
                currentUser={currentUser}
                onNext={handleNextStep}
                onPrev={handlePrevStep}
                estimatedDeliveryFee={deliveryFee}
                setEstimatedDeliveryFee={() => { }}
                estimatedDeliveryTime={estimatedDeliveryTime}
                setEstimatedDeliveryTime={() => { }}
                cartItems={cartItems}
                isPincodeServiceable={isPincodeServiceable}
                setIsPincodeServiceable={setIsPincodeServiceable}
              />
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <CheckoutPayment
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                settings={settings}
                total={total}
                onNext={handleNextStep}
                onPrev={handlePrevStep}
              />
            )}

            {/* Step 4: Order Summary */}
            {currentStep === 4 && (
              <CheckoutSummary
                customerInfo={customerInfo}
                addressDetails={addressDetails}
                paymentMethod={paymentMethod}
                cartItems={cartItems}
                subtotal={subtotal}
                tax={tax}
                deliveryFee={deliveryFee}
                codFee={codFee}
                discount={discount}
                total={total}
                settings={settings}
                isMinOrderMet={isMinOrderMet}
                minOrderShortfall={minOrderShortfall}
                isProcessingPayment={isProcessingPayment}
                estimatedDeliveryFee={deliveryFee}
                estimatedDeliveryTime={estimatedDeliveryTime}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                appliedCoupon={appliedCoupon}
                setAppliedCoupon={setAppliedCoupon}
                availableCoupons={availableCoupons}
                onPlaceOrder={handlePlaceOrder}
                onPrev={handlePrevStep}
                onApplyCoupon={applyCoupon}
                onRemoveCoupon={removeCoupon}
                isPincodeServiceable={isPincodeServiceable}
              />
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="xl:col-span-1 order-1 xl:order-2">
            <Card className="sticky top-4 border-[#E6D5B8] bg-[#FFF8F0] shadow-sm">
              <CardHeader className="border-b border-[#E6D5B8]">
                <CardTitle className="text-[#2C1810] font-serif">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {/* Quick Items Summary */}
                {currentStep < 4 && (
                  <>
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-[#5D4037]">
                        {cartItems.reduce((sum, item) => sum + toNumber(item.quantity), 0)} items in cart
                      </h4>
                      {cartItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 py-2">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded-sm border border-[#E6D5B8]"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm truncate text-[#2C1810]">{item.name}</h5>
                            <p className="text-xs text-[#5D4037]">
                              {item.weight} × {item.quantity}
                            </p>
                          </div>
                          <div className="text-sm font-medium text-[#2C1810]">
                            {formatPrice(toNumber(item.price) * toNumber(item.quantity))}
                          </div>
                        </div>
                      ))}
                      {cartItems.length > 3 && (
                        <p className="text-xs text-[#8B2131] text-center cursor-pointer hover:underline">
                          +{cartItems.length - 3} more items
                        </p>
                      )}
                    </div>

                    <Separator className="bg-[#E6D5B8]" />
                  </>
                )}

                <div className="flex justify-between text-[#5D4037]">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-[#5D4037]">
                  <span>Tax ({toNumber(settings.tax_rate).toFixed(0)}%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>

                <div className="flex justify-between text-[#5D4037]">
                  <span>Delivery Fee</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-[#8B2131] font-medium">
                        FREE
                      </span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>

                {paymentMethod === 'cod' && toNumber(settings.cod_charge) > 0 && (
                  <div className="flex justify-between text-[#5D4037]">
                    <span>COD Fee</span>
                    <span>{formatPrice(codFee)}</span>
                  </div>
                )}

                {discount > 0 && (
                  <div className="flex justify-between text-[#2F855A]">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <Separator className="bg-[#E6D5B8]" />

                {currentStep < 4 && (
                  <div className="space-y-3">
                    <Label className="flex items-center text-[#2C1810]">
                      <Tag className="h-4 w-4 mr-2" />
                      Apply Coupon
                    </Label>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-[#F0FFF4] border border-[#C6F6D5] rounded-sm">
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-[#2F855A]" />
                          <div>
                            <span className="text-sm font-medium text-[#22543D]">
                              {appliedCoupon.code} Applied
                            </span>
                            <p className="text-xs text-[#2F855A]">
                              {appliedCoupon.description}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={removeCoupon} className="text-[#2F855A] hover:text-[#22543D] hover:bg-[#C6F6D5]">
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="bg-white border-[#E6D5B8] focus:ring-[#8B2131]"
                        />
                        <Button variant="outline" onClick={applyCoupon} className="border-[#8B2131] text-[#8B2131] hover:bg-[#8B2131] hover:text-white">
                          Apply
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <Separator className="bg-[#E6D5B8]" />

                <div className="flex justify-between font-bold text-lg text-[#2C1810]">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                {/* Minimum Order Warning */}
                {subtotal < toNumber(settings.min_order_amount) && (
                  <div className="bg-[#FFFAF0] border border-[#FEEBC8] rounded-sm p-3 mt-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-[#C05621]">⚠️</span>
                      <div>
                        <p className="text-sm text-[#9C4221] font-medium">
                          Minimum Order: {formatCurrency(settings.min_order_amount, settings.currency_symbol)}
                        </p>
                        <p className="text-xs text-[#C05621]">
                          Add {formatCurrency(toNumber(settings.min_order_amount) - subtotal, settings.currency_symbol)} more to proceed
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Desktop Action Button */}
                <div className="hidden xl:block">
                  {currentStep < 4 && (
                    <Button
                      className="w-full bg-[#8B2131] hover:bg-[#701a26] text-white"
                      size="lg"
                      onClick={handleNextStep}
                      disabled={isProcessingPayment || !isMinOrderMet}
                    >
                      Continue
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Sticky Bottom Bar */}
        <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-[#FFFDF7] border-t border-[#E6D5B8] p-4 z-50">
          <div className="container mx-auto">
            {currentStep < 4 ? (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-[#5D4037]">
                    Step {currentStep} of {steps.length}
                  </p>
                  <p className="font-medium text-[#2C1810]">{steps[currentStep - 1]?.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-4">
                    <p className="text-sm text-[#5D4037]">Total</p>
                    <p className="font-bold text-[#8B2131]">{formatPrice(total)}</p>
                  </div>
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={handlePrevStep}
                      size="sm"
                      className="border-[#E6D5B8] text-[#5D4037]"
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    onClick={handleNextStep}
                    disabled={isProcessingPayment || (currentStep === 4 && !isMinOrderMet)}
                    size="sm"
                    className="min-w-[100px] bg-[#8B2131] text-white"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            ) : (
              // Step 4 is handled by CheckoutSummary component's internal action button or we can show one here
              // CheckoutSummary has its own button, but layout-wise we might want consistency.
              // However, CheckoutSummary acts as the final confirmation.
              // Let's hide this sticky bar for step 4 to allow CheckoutSummary's placement to take precedence OR keep it simple.
              // The original had logic for step 4 here.
              <div className="text-center">
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessingPayment || !isMinOrderMet}
                  className="w-full bg-[#8B2131] text-white"
                  size="lg"
                >
                  {isProcessingPayment ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Guest Order Popup */}
        {showGuestOrderPopup && guestOrderData && (
          <GuestOrderPopup
            isOpen={showGuestOrderPopup}
            onClose={() => {
              setShowGuestOrderPopup(false);
              setGuestOrderData(null);
            }}
            orderData={guestOrderData}
          />
        )}
      </div>
    </div>
  );
};

export default Checkout;