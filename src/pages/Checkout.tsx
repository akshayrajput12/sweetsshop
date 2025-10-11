import { useState, useEffect } from 'react';
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

import AddressManager from '@/components/AddressManager';
import Stepper from '@/components/Stepper';
import GuestOrderPopup from '@/components/GuestOrderPopup';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { validateContactInfo, validateAddressDetails, validatePaymentMethod, formatPhoneNumber } from '@/utils/validation';
import { useSettings } from '@/hooks/useSettings';
import { toNumber, formatCurrency, calculatePercentage, meetsThreshold, toBoolean } from '@/utils/settingsHelpers';
import { delhiveryService, PICKUP_LOCATION } from '@/utils/delhivery';


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
  const [estimatedDeliveryFee, setEstimatedDeliveryFee] = useState<number | null>(null);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<string | null>(null);
  
  // Form validation states
  const [contactErrors, setContactErrors] = useState<string[]>([]);
  const [addressErrors, setAddressErrors] = useState<string[]>([]);

  // Customer Information
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Delivery Location - removed location picker functionality

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

  // Simple pincode to coordinates mapping for major cities in India
  // This is just a sample - a real implementation would have a comprehensive database
  const PINCODE_COORDINATES: Record<string, { lat: number; lng: number; city: string; state: string }> = {
    // Delhi NCR
    '110001': { lat: 28.6139, lng: 77.2090, city: 'Delhi', state: 'Delhi' },
    '110002': { lat: 28.6139, lng: 77.2090, city: 'Delhi', state: 'Delhi' },
    '110003': { lat: 28.6139, lng: 77.2090, city: 'Delhi', state: 'Delhi' },
    '110021': { lat: 28.6139, lng: 77.2090, city: 'Delhi', state: 'Delhi' },
    '110022': { lat: 28.6139, lng: 77.2090, city: 'Delhi', state: 'Delhi' },
    
    // Mumbai
    '400001': { lat: 19.0760, lng: 72.8777, city: 'Mumbai', state: 'Maharashtra' },
    '400002': { lat: 19.0760, lng: 72.8777, city: 'Mumbai', state: 'Maharashtra' },
    '400003': { lat: 19.0760, lng: 72.8777, city: 'Mumbai', state: 'Maharashtra' },
    
    // Bangalore
    '560001': { lat: 12.9716, lng: 77.5946, city: 'Bangalore', state: 'Karnataka' },
    '560002': { lat: 12.9716, lng: 77.5946, city: 'Bangalore', state: 'Karnataka' },
    '560003': { lat: 12.9716, lng: 77.5946, city: 'Bangalore', state: 'Karnataka' },
    
    // Chennai
    '600001': { lat: 13.0827, lng: 80.2707, city: 'Chennai', state: 'Tamil Nadu' },
    '600002': { lat: 13.0827, lng: 80.2707, city: 'Chennai', state: 'Tamil Nadu' },
    
    // Kolkata
    '700001': { lat: 22.5726, lng: 88.3639, city: 'Kolkata', state: 'West Bengal' },
    '700002': { lat: 22.5726, lng: 88.3639, city: 'Kolkata', state: 'West Bengal' },
    
    // Hyderabad
    '500001': { lat: 17.3850, lng: 78.4867, city: 'Hyderabad', state: 'Telangana' },
    '500002': { lat: 17.3850, lng: 78.4867, city: 'Hyderabad', state: 'Telangana' },
    
    // Pune
    '411001': { lat: 18.5204, lng: 73.8567, city: 'Pune', state: 'Maharashtra' },
    '411002': { lat: 18.5204, lng: 73.8567, city: 'Pune', state: 'Maharashtra' },
    
    // Ahmedabad
    '380001': { lat: 23.0225, lng: 72.5714, city: 'Ahmedabad', state: 'Gujarat' },
    '380002': { lat: 23.0225, lng: 72.5714, city: 'Ahmedabad', state: 'Gujarat' },
    
    // Jaipur
    '302001': { lat: 26.9124, lng: 75.7873, city: 'Jaipur', state: 'Rajasthan' },
    '302002': { lat: 26.9124, lng: 75.7873, city: 'Jaipur', state: 'Rajasthan' },
    
    // Default fallback (Delhi coordinates)
    'default': { lat: 28.6139, lng: 77.2090, city: 'Delhi', state: 'Delhi' }
  };

  // Get approximate coordinates for a pincode
  const getCoordinatesForPincode = (pincode: string): { lat: number; lng: number; city: string; state: string } => {
    // Clean the pincode
    const cleanPincode = pincode.replace(/\D/g, '').slice(0, 6);
    
    // Return coordinates if found, otherwise return default
    return PINCODE_COORDINATES[cleanPincode] || PINCODE_COORDINATES['default'];
  };

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

  // Remove fetchSettings since we're using static settings now

  const fetchSavedAddresses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // For guest users, no saved addresses
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

  // Removed location extraction functions - users will manually enter address details

  const handleSavedAddressSelect = (address: any) => {
    setSelectedAddress(address);
    setUseExistingAddress(true);

    // Pre-fill address details from saved address
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
      
      if (!user) {
        // For guest users, we don't save addresses
        return;
      }

      // Check if user already has 3 addresses
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
        is_default: savedAddresses.length === 0 // Make first address default
      };

      const { error } = await supabase
        .from('addresses')
        .insert([addressData]);

      if (error) throw error;

      toast({
        title: "Address Saved",
        description: "Your address has been saved to your profile for future use.",
      });

      // Refresh saved addresses
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

      // Fetch product-specific coupons
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

      // Filter and process only product-specific coupons for items in cart
      const productSpecificCoupons = productCoupons
        ?.map(pc => pc.coupons)
        .filter(c => c !== null && c.is_active && new Date(c.valid_until) > new Date())
        .filter((coupon, index, self) => 
          index === self.findIndex(c => c.id === coupon.id)
        ) || [];

      // Only show coupons that are specifically assigned to products in the cart
      setAvailableCoupons(productSpecificCoupons);
    } catch (error) {
      console.error('Error fetching product coupons:', error);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (toNumber(item.price) * toNumber(item.quantity)), 0);
  const tax = calculatePercentage(subtotal, settings.tax_rate);
  
  // Calculate delivery fee using Delhivery API
  let deliveryFee = estimatedDeliveryFee !== null ? estimatedDeliveryFee : (
    meetsThreshold(subtotal, settings.free_delivery_threshold) ? 0 : toNumber(settings.delivery_charge)
  );
  
  const codFee = paymentMethod === 'cod' ? toNumber(settings.cod_charge) : 0;
  const total = subtotal + tax + deliveryFee + codFee - discount;
  
  // Check if minimum order amount is met
  const isMinOrderMet = subtotal >= toNumber(settings.min_order_amount);
  const minOrderShortfall = Math.max(0, toNumber(settings.min_order_amount) - subtotal);

  // Estimate delivery fee when address details change
  useEffect(() => {
    const estimateDeliveryFee = async () => {
      // Only estimate if we have a pincode and city/state
      if (addressDetails.pincode && addressDetails.city && addressDetails.state) {
        try {
          // Get customer coordinates from pincode
          const customerCoords = getCoordinatesForPincode(addressDetails.pincode);
          
          // Calculate total weight of items in cart
          let totalWeight = 0;
          cartItems.forEach(item => {
            // Extract numeric weight from string (e.g., "500g" -> 0.5kg, "1kg" -> 1kg)
            const weightMatch = item.weight.match(/(\d+(?:\.\d+)?)\s*(g|kg)/i);
            if (weightMatch) {
              const value = parseFloat(weightMatch[1]);
              const unit = weightMatch[2].toLowerCase();
              // Convert to kg
              totalWeight += unit === 'g' ? value / 1000 : value;
            }
          });
          
          // Display the actual weight to the user but use buffered weight for API calculations
          const displayWeight = Math.max(1, totalWeight); // Display actual weight with minimum 1kg
          const bufferedWeight = Math.max(1, totalWeight * 1.2); // Use 20% buffer for API calculations
          
          // Estimate delivery pricing using Delhivery API
          const estimate = await delhiveryService.estimateDeliveryPricing(
            PICKUP_LOCATION.pincode || '110001',
            addressDetails.pincode,
            subtotal,
            bufferedWeight // weight in kg with 20% buffer for API
          );
          
          // Set estimated delivery time
          setEstimatedDeliveryTime(estimate.estimated_delivery_time);
          
          // Check if order qualifies for free delivery
          const freeDeliveryThreshold = toNumber(settings.free_delivery_threshold);
          if (subtotal >= freeDeliveryThreshold && estimate.serviceability) {
            setEstimatedDeliveryFee(0);
          } else {
            setEstimatedDeliveryFee(estimate.shipping_charges);
          }
        } catch (error) {
          console.error('Error estimating delivery fee:', error);
          // Fallback to standard delivery charge
          setEstimatedDeliveryTime('2-5 business days');
          const freeDeliveryThreshold = toNumber(settings.free_delivery_threshold);
          if (subtotal >= freeDeliveryThreshold) {
            setEstimatedDeliveryFee(0);
          } else {
            setEstimatedDeliveryFee(toNumber(settings.delivery_charge));
          }
        }
      } else {
        // Reset estimated delivery fee if we don't have complete address
        setEstimatedDeliveryFee(null);
      }
    };
    
    // Only estimate if we're past the contact info step
    if (currentStep >= 2) {
      estimateDeliveryFee();
    }
  }, [addressDetails, currentStep, subtotal, settings, customerInfo]);

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

      // Check minimum order amount
      if (data.min_order_amount && subtotal < data.min_order_amount) {
        toast({
          title: "Minimum order not met",
          description: `Minimum order of ${settings.currency_symbol}${data.min_order_amount} required for this coupon.`,
          variant: "destructive",
        });
        return;
      }

      // Check usage limit
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
    // Check minimum order amount before any step
    if (subtotal < toNumber(settings.min_order_amount)) {
      toast({
        title: "Minimum Order Not Met",
        description: `Minimum order amount is ${formatCurrency(settings.min_order_amount, settings.currency_symbol)}. Please add more items to your cart.`,
        variant: "destructive",
      });
      return;
    }

    // Validation for each step
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
      // Validate city, state, and pincode first
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
    
    if (!addressDetails.pincode) {
      toast({
        title: "Missing Pincode",
        description: "Please enter your area pincode.",
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
      // Generate unique order number
      const orderNumber = `BUK${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const completeAddress = `${addressDetails.plotNumber}, ${addressDetails.buildingName ? addressDetails.buildingName + ', ' : ''}${addressDetails.street}, ${addressDetails.landmark ? 'Near ' + addressDetails.landmark + ', ' : ''}${addressDetails.city}, ${addressDetails.state} - ${addressDetails.pincode}`;
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Prepare order data
      const orderData = {
        user_id: user?.id || null, // Add user_id to link order to user
        order_number: orderNumber,
        customer_info: customerInfo as any,
        delivery_location: { address: completeAddress } as any, // Manual address only
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
        // Handle Cash on Delivery - Direct order placement
        const codOrderData = {
          ...orderData,
          payment_status: 'pending',
          order_status: 'placed'
        };

        // Save order to database
        const { data: savedOrder, error: dbError } = await supabase
          .from('orders')
          .insert([codOrderData])
          .select()
          .single();

        if (dbError) {
          throw new Error(`Database error: ${dbError.message}`);
        }

        // Save address to profile if it's a new address and user is authenticated
        if (!useExistingAddress && currentUser) {
          await saveAddressToProfile();
        }

        // Update coupon usage if applied
        if (appliedCoupon) {
          await supabase
            .from('coupons')
            .update({ used_count: appliedCoupon.used_count + 1 })
            .eq('id', appliedCoupon.id);
        }

        // Check if user is authenticated
        if (!currentUser) {
          // Guest user - show popup with order details
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
          // Authenticated user - redirect to profile
          toast({
            title: "Order Placed Successfully!",
            description: `Your COD order #${orderNumber} has been placed. You'll pay ${settings.currency_symbol}${total.toFixed(2)} on delivery.`,
          });
          
          navigate('/profile?tab=orders');
        }
        
        clearCart();
      } else {
        // Handle online payment with Razorpay
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
              // Payment successful - Save order to database
              const onlineOrderData = {
                ...orderData,
                payment_status: 'paid',
                order_status: 'confirmed',
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id
              };

              // Save order to database
              const { data: savedOrder, error: dbError } = await supabase
                .from('orders')
                .insert([onlineOrderData])
                .select()
                .single();

              if (dbError) {
                throw new Error(`Database error: ${dbError.message}`);
              }

              // Save address to profile if it's a new address and user is authenticated
              if (!useExistingAddress && currentUser) {
                await saveAddressToProfile();
              }

              // Update coupon usage if applied
              if (appliedCoupon) {
                await supabase
                  .from('coupons')
                  .update({ used_count: appliedCoupon.used_count + 1 })
                  .eq('id', appliedCoupon.id);
              }

              // Check if user is authenticated
              if (!currentUser) {
                // Guest user - show popup with order details
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
                // Authenticated user - redirect to profile
                toast({
                  title: "Payment Successful!",
                  description: `Order #${orderNumber} confirmed and paid. Your bulk order is being processed.`,
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
            // Payment failed or cancelled
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
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Button onClick={() => navigate('/products')}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  if (settingsLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading checkout...</p>
      </div>
    );
  }

  if (settingsError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-red-500 mb-4">⚠️ Error loading settings</div>
        <p className="text-muted-foreground">Please refresh the page to try again.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Refresh Page
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>
        </div>
        
        {/* Mobile Total Display */}
        <div className="xl:hidden">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-lg font-bold">{formatPrice(total)}</p>
          </div>
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <div className="xl:hidden mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {steps.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round((currentStep / steps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{steps[currentStep - 1]?.description}</p>
        </div>
      </div>

      {/* Mobile Price Breakdown - Always Visible */}
      <div className="xl:hidden mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Order Total</span>
              <span className="font-bold text-lg">{formatPrice(total)}</span>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({toNumber(settings.tax_rate).toFixed(0)}%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>
                  {estimatedDeliveryFee === null && addressDetails.pincode ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-1"></div>
                      Calculating...
                    </span>
                  ) : deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                </span>
              </div>
              {estimatedDeliveryTime && (
                <div className="flex justify-between text-xs">
                  <span>Est. Delivery Time</span>
                  <span>{estimatedDeliveryTime}</span>
                </div>
              )}
              {paymentMethod === 'cod' && toNumber(settings.cod_charge) > 0 && (
                <div className="flex justify-between">
                  <span>COD Fee</span>
                  <span>{formatPrice(codFee)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
            </div>
            
            {/* Mobile Minimum Order Warning */}
            {!isMinOrderMet && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                <div className="flex items-center space-x-2">
                  <span className="text-orange-600">⚠️</span>
                  <div>
                    <p className="text-sm text-orange-700 font-medium">
                      Minimum Order: {formatCurrency(settings.min_order_amount, settings.currency_symbol)}
                    </p>
                    <p className="text-xs text-orange-600">
                      Add {formatCurrency(minOrderShortfall, settings.currency_symbol)} more to proceed
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="xl:col-span-2 order-2 xl:order-1">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        onChange={(e) => {
                          setCustomerInfo({...customerInfo, name: e.target.value});
                          // Clear errors when user starts typing
                          if (contactErrors.length > 0) {
                            setContactErrors([]);
                          }
                        }}
                        className={`pl-10 h-12 ${contactErrors.some(e => e.includes('name') || e.includes('Name')) ? 'border-red-500' : ''}`}
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
                        onChange={(e) => {
                          setCustomerInfo({...customerInfo, phone: e.target.value});
                          if (contactErrors.length > 0) {
                            setContactErrors([]);
                          }
                        }}
                        className={`pl-10 h-12 ${contactErrors.some(e => e.includes('phone') || e.includes('Phone')) ? 'border-red-500' : ''}`}
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
                      onChange={(e) => {
                        setCustomerInfo({...customerInfo, email: e.target.value});
                        if (contactErrors.length > 0) {
                          setContactErrors([]);
                        }
                      }}
                      className={`pl-10 h-12 ${contactErrors.some(e => e.includes('email') || e.includes('Email')) ? 'border-red-500' : ''}`}
                      required
                    />
                  </div>
                </div>

                {/* Validation Errors */}
                {contactErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="h-5 w-5 text-red-600 mt-0.5">⚠️</div>
                      <div>
                        <h4 className="font-medium text-red-900 text-sm mb-1">
                          Please fix the following errors:
                        </h4>
                        <ul className="text-red-700 text-sm space-y-1">
                          {contactErrors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

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

          {/* Step 2: Address Details */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Complete Address Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Delivery Information */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-900 text-sm">
                        Fast Delivery Available
                      </h4>
                      <p className="text-orange-700 text-sm mt-1">
                        Get your bulk orders delivered within 2-3 business days nationwide.
                        {!meetsThreshold(subtotal, settings.free_delivery_threshold) && (
                          <span className="block mt-1 font-medium">
                            Add {formatCurrency(toNumber(settings.free_delivery_threshold) - subtotal, settings.currency_symbol)} more for FREE delivery!
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Saved Addresses Section */}
                {savedAddresses.length > 0 && !useExistingAddress && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Use Saved Address</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddressForm(true)}
                      >
                        Add New Address
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {savedAddresses.map((address) => (
                        <div
                          key={address.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedAddress?.id === address.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleSavedAddressSelect(address)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-sm">{address.name}</span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                                </span>
                                {address.is_default && (
                                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {address.address_line_1}
                                {address.address_line_2 && `, ${address.address_line_2}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                              {address.landmark && (
                                <p className="text-xs text-gray-500">Near {address.landmark}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center">
                      <Button
                        variant="ghost"
                        onClick={() => setShowAddressForm(true)}
                        className="text-primary"
                      >
                        + Add New Address Instead
                      </Button>
                    </div>
                  </div>
                )}

                {/* Show address form if no saved addresses or user wants to add new */}
                {(savedAddresses.length === 0 || showAddressForm || useExistingAddress) && (
                  <>
                    {useExistingAddress && (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-800">
                            Using saved address: {selectedAddress?.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUseExistingAddress(false);
                            setSelectedAddress(null);
                            setShowAddressForm(true);
                          }}
                          className="text-green-700 hover:text-green-800"
                        >
                          Change
                        </Button>
                      </div>
                    )}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 text-sm">
                        Delivery Address
                      </h4>
                      <p className="text-blue-700 text-sm mt-1">
                        {addressDetails.city && addressDetails.state && addressDetails.pincode 
                          ? `${addressDetails.city}, ${addressDetails.state} - ${addressDetails.pincode}`
                          : 'Please fill in your city, state, and pincode above'
                        }
                      </p>
                      {estimatedDeliveryFee !== null && estimatedDeliveryTime && (
                        <div className="text-blue-700 text-sm mt-2">
                          <span className="font-medium">Estimated Delivery:</span> {estimatedDeliveryTime} 
                          <span className="font-medium">({formatPrice(estimatedDeliveryFee)})</span>
                        </div>
                      )}
                      {estimatedDeliveryFee === null && addressDetails.pincode && (
                        <div className="text-blue-700 text-sm mt-2 flex items-center">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                          Calculating delivery charges...
                        </div>
                      )}
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

                {/* City, State, and Pincode */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">
                      City *
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Enter your city"
                      value={addressDetails.city}
                      onChange={(e) => setAddressDetails({...addressDetails, city: e.target.value})}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium">
                      State *
                    </Label>
                    <Input
                      id="state"
                      type="text"
                      placeholder="Enter your state"
                      value={addressDetails.state}
                      onChange={(e) => setAddressDetails({...addressDetails, state: e.target.value})}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode" className="text-sm font-medium">
                      Pincode *
                    </Label>
                    <Input
                      id="pincode"
                      type="text"
                      placeholder="Enter 6-digit pincode"
                      value={addressDetails.pincode}
                      onChange={(e) => setAddressDetails({...addressDetails, pincode: e.target.value})}
                      className="h-12"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

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

                {/* Address saving options - only show for authenticated users */}
                {currentUser && (
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
                )}

                {/* Save Address Option - only show for authenticated users */}
                {currentUser && !useExistingAddress && (
                  <div className="flex items-center space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="saveAddress"
                      checked={true}
                      readOnly
                      className="rounded"
                    />
                    <Label htmlFor="saveAddress" className="text-sm text-blue-800">
                      Save this address to your profile for future orders
                      {savedAddresses.length >= 3 && (
                        <span className="block text-xs text-orange-600 mt-1">
                          ⚠️ You have reached the maximum limit of 3 saved addresses
                        </span>
                      )}
                    </Label>
                  </div>
                )}
                </>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handlePrevStep} size="lg" className="px-8">
                    Back to Contact
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    disabled={
                      useExistingAddress 
                        ? !selectedAddress || !addressDetails.city || !addressDetails.state || !addressDetails.pincode
                        : !addressDetails.plotNumber || !addressDetails.street || !addressDetails.city || !addressDetails.state || !addressDetails.pincode
                    }
                    size="lg"
                    className="px-8"
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
                  {/* Pay Online Option */}
                  {settings.razorpay_enabled && (
                    <div className="relative">
                      <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                        <RadioGroupItem value="online" id="online" />
                        <Label htmlFor="online" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-base">Pay Online</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {[
                                  settings.card_enabled && 'Credit/Debit Card',
                                  settings.upi_enabled && 'UPI',
                                  settings.netbanking_enabled && 'Net Banking'
                                ].filter(Boolean).join(', ')}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {settings.card_enabled && (
                                <>
                                  <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                                    VISA
                                  </div>
                                  <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                                    MC
                                  </div>
                                </>
                              )}
                              {settings.upi_enabled && (
                                <div className="w-8 h-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">
                                  UPI
                                </div>
                              )}
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
                  )}

                  {/* Cash on Delivery Option */}
                  {settings.cod_enabled && total <= Number(settings.cod_threshold) && (
                    <div className="relative">
                      <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-base">Cash on Delivery</div>
                              <div className="text-sm text-gray-600 mt-1">
                                Pay when your order is delivered
                                {Number(settings.cod_charge) > 0 && (
                                  <span className="text-orange-600 font-medium">
                                    {' '}+ {settings.currency_symbol}{Number(settings.cod_charge).toFixed(2)} COD fee
                                  </span>
                                )}
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
                              {Number(settings.cod_charge) > 0 && (
                                <span className="block mt-1 font-medium">
                                  COD fee: {settings.currency_symbol}{Number(settings.cod_charge).toFixed(2)} will be added to your total
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* COD Not Available Message */}
                  {settings.cod_enabled && total > Number(settings.cod_threshold) && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-orange-700">
                          Cash on Delivery not available for orders above {settings.currency_symbol}{Number(settings.cod_threshold).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
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

          {/* Step 4: Order Summary */}
          {currentStep === 4 && (
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
                      <strong>Delivery Area:</strong> {addressDetails.city && addressDetails.state && addressDetails.pincode 
                        ? `${addressDetails.city}, ${addressDetails.state} - ${addressDetails.pincode}`
                        : 'Address details will appear here'
                      }
                    </div>
                    {estimatedDeliveryFee !== null && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-green-800">Delivery Information</p>
                            <p className="text-xs text-green-700">Calculated using Delhivery API</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-800">
                              {estimatedDeliveryFee === 0 ? 'FREE' : formatPrice(estimatedDeliveryFee)}
                            </p>
                            <p className="text-xs text-green-700">{estimatedDeliveryTime}</p>
                          </div>
                        </div>
                      </div>
                    )}
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
                        {estimatedDeliveryTime && (
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Estimated Delivery Time</span>
                            <span>{estimatedDeliveryTime}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Taxes & Charges ({Number(settings.tax_rate || 0).toFixed(0)}%)</span>
                          <span>{formatPrice(tax)}</span>
                        </div>
                        {paymentMethod === 'cod' && Number(settings.cod_charge) > 0 && (
                          <div className="flex justify-between">
                            <span>COD Fee</span>
                            <span>{formatPrice(codFee)}</span>
                          </div>
                        )}
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
                      disabled={isProcessingPayment || !isMinOrderMet}
                    >
                      {isProcessingPayment ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </div>
                      ) : !isMinOrderMet ? (
                        <div className="flex items-center space-x-2">
                          <span>Add {formatCurrency(minOrderShortfall, settings.currency_symbol)} More</span>
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
        <div className="xl:col-span-1 order-1 xl:order-2">
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
                      {cartItems.reduce((sum, item) => sum + toNumber(item.quantity), 0)} items in cart
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
                          {formatPrice(toNumber(item.price) * toNumber(item.quantity))}
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
                <span>Subtotal ({cartItems.reduce((sum, item) => sum + toNumber(item.quantity), 0)} items)</span>
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
                    <span className="text-green-600 font-medium">
                      FREE (Above {formatCurrency(settings.free_delivery_threshold, settings.currency_symbol)})
                    </span>
                  ) : (
                    formatPrice(deliveryFee)
                  )}
                </span>
              </div>
              
              {estimatedDeliveryTime && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Estimated Delivery Time</span>
                  <span>{estimatedDeliveryTime}</span>
                </div>
              )}

              {paymentMethod === 'cod' && toNumber(settings.cod_charge) > 0 && (
                <div className="flex justify-between">
                  <span>COD Fee</span>
                  <span>{formatPrice(codFee)}</span>
                </div>
              )}

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
                
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <div>
                        <span className="text-sm font-medium text-green-800">
                          {appliedCoupon.code} Applied
                        </span>
                        <p className="text-xs text-green-600">
                          {appliedCoupon.description}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeCoupon} className="text-green-700">
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
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
                    
                    {availableCoupons.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600 font-medium">Available Coupons:</p>
                        <div className="space-y-1">
                          {availableCoupons.slice(0, 3).map((coupon) => (
                            <div
                              key={coupon.id}
                              className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded cursor-pointer hover:bg-blue-100"
                              onClick={() => {
                                setCouponCode(coupon.code);
                                applyCoupon();
                              }}
                            >
                              <div>
                                <span className="text-xs font-medium text-blue-800">
                                  {coupon.code}
                                </span>
                                <p className="text-xs text-blue-600">
                                  {coupon.description}
                                </p>
                              </div>
                              <Button variant="ghost" size="sm" className="text-xs text-blue-700">
                                Apply
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <Separator />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {/* Minimum Order Warning */}
              {subtotal < toNumber(settings.min_order_amount) && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-600">⚠️</span>
                    <div>
                      <p className="text-sm text-orange-700 font-medium">
                        Minimum Order: {formatCurrency(settings.min_order_amount, settings.currency_symbol)}
                      </p>
                      <p className="text-xs text-orange-600">
                        Add {formatCurrency(toNumber(settings.min_order_amount) - subtotal, settings.currency_symbol)} more to proceed
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Action Button */}
              <div className="xl:hidden">
                {currentStep < 5 && (
                  <div className="flex gap-2">
                    {currentStep > 1 && (
                      <Button 
                        variant="outline" 
                        onClick={handlePrevStep}
                        className="flex-1"
                      >
                        Back
                      </Button>
                    )}
                    <Button 
                      onClick={currentStep === 4 ? handlePlaceOrder : handleNextStep}
                      className="flex-1"
                      disabled={isProcessingPayment || (currentStep === 4 && !isMinOrderMet)}
                    >
                      {isProcessingPayment ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </div>
                      ) : !isMinOrderMet && currentStep === 4 ? (
                        `Add ${formatCurrency(minOrderShortfall, settings.currency_symbol)} More`
                      ) : currentStep === 4 ? (
                        `Pay ${formatPrice(total)}`
                      ) : (
                        'Continue'
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Desktop Action Button */}
              <div className="hidden xl:block">
                {currentStep === 4 && (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isProcessingPayment || !isMinOrderMet}
                  >
                    {isProcessingPayment ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing Payment...
                      </div>
                    ) : (
                      `Pay ${formatPrice(total)}`
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="container mx-auto">
          {currentStep < 5 ? (
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Step {currentStep} of {steps.length}
                </p>
                <p className="font-medium">{steps[currentStep - 1]?.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right mr-4">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-bold">{formatPrice(total)}</p>
                </div>
                {currentStep > 1 && (
                  <Button 
                    variant="outline" 
                    onClick={handlePrevStep}
                    size="sm"
                  >
                    Back
                  </Button>
                )}
                <Button 
                  onClick={currentStep === 4 ? handlePlaceOrder : handleNextStep}
                  disabled={isProcessingPayment || (currentStep === 4 && !isMinOrderMet)}
                  size="sm"
                  className="min-w-[100px]"
                >
                  {isProcessingPayment ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      <span className="text-xs">Processing...</span>
                    </div>
                  ) : currentStep === 4 ? (
                    'Pay Now'
                  ) : (
                    'Continue'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Review your order and confirm</p>
              <Button 
                onClick={handlePlaceOrder}
                disabled={isProcessingPayment || !isMinOrderMet}
                className="w-full"
                size="lg"
              >
                {isProcessingPayment ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing Payment...
                  </div>
                ) : !isMinOrderMet ? (
                  `Add ${formatCurrency(minOrderShortfall, settings.currency_symbol)} More`
                ) : (
                  `Confirm Order - ${formatPrice(total)}`
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add bottom padding to prevent content from being hidden behind sticky bar */}
      <div className="xl:hidden h-20"></div>

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
  );
};

export default Checkout;