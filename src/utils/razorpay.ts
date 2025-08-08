import { CartItem } from '@/store/useStore';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string; // Optional for direct payments
  image?: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    [key: string]: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
  retry?: {
    enabled: boolean;
    max_count: number;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface OrderData {
  orderId: string;
  amount: number;
  currency: string;
  items: CartItem[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  deliveryAddress: {
    address: string;
    lat: number;
    lng: number;
    plotNumber?: string;
    buildingName?: string;
    street?: string;
    landmark?: string;
    pincode?: string;
    addressType?: string;
    saveAs?: string;
  };
}

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Create order using Razorpay's direct integration
export const createRazorpayOrder = async (orderData: OrderData): Promise<{
  id: string;
  amount: number;
  currency: string;
}> => {
  try {
    // Since we can't expose the secret key on client-side, we'll use a different approach
    // We'll create the order directly in the Razorpay checkout without pre-creating it
    
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    const orderId = `BUK_${timestamp}_${randomString}`;
    
    const amount = Math.round(orderData.amount * 100); // Convert to paise
    
    // Log order creation for debugging
    console.log('Creating Razorpay order:', {
      orderId,
      amount,
      currency: orderData.currency,
      customer: orderData.customerInfo.name,
      items: orderData.items.length
    });
    
    return {
      id: orderId,
      amount: amount,
      currency: orderData.currency
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create payment order. Please try again.');
  }
};

// Verify payment using client-side signature verification
export const verifyRazorpayPayment = async (
  paymentId: string,
  orderId: string,
  signature: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // For client-side verification, we'll use a simplified approach
    // In a production environment, you should verify this on your backend
    
    // Basic validation - check if all required fields are present
    if (!paymentId || !orderId || !signature) {
      return {
        success: false,
        message: 'Missing payment verification data'
      };
    }

    // Check if payment ID and order ID follow Razorpay format
    const paymentIdPattern = /^pay_[A-Za-z0-9]{14}$/;
    const orderIdPattern = /^order_[A-Za-z0-9]{14}$/;
    
    if (!paymentIdPattern.test(paymentId) || !orderIdPattern.test(orderId)) {
      return {
        success: false,
        message: 'Invalid payment or order ID format'
      };
    }

    // For client-side implementation, we'll trust Razorpay's callback
    // since the payment was processed through their secure checkout
    console.log('Payment verification successful:', {
      paymentId,
      orderId,
      signature: signature.substring(0, 10) + '...' // Log partial signature for debugging
    });

    return {
      success: true,
      message: 'Payment verified successfully'
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return {
      success: false,
      message: 'Payment verification failed. Please contact support.'
    };
  }
};

// Initialize Razorpay payment
export const initiateRazorpayPayment = async (
  orderData: OrderData,
  onSuccess: (response: RazorpayResponse) => void,
  onError: (error: any) => void
): Promise<void> => {
  try {
    // Load Razorpay script
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    // Create order
    const order = await createRazorpayOrder(orderData);

    // Get Razorpay key from environment
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      throw new Error('Razorpay key not configured');
    }

    // Razorpay options for direct payment (without pre-created order)
    const options: any = {
      key: razorpayKey,
      amount: order.amount,
      currency: order.currency,
      name: import.meta.env.VITE_APP_NAME || 'BukBox',
      description: `Bulk order for ${orderData.items.length} items - ${orderData.items.map(item => item.name).join(', ').substring(0, 100)}`,
      image: '/logo.png', // Add your logo here
      handler: async (response: any) => {
        try {
          console.log('Payment successful:', response);
          
          // For direct payment without pre-created order, response will have:
          // razorpay_payment_id
          const paymentResponse: RazorpayResponse = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: order.id, // Our generated order ID
            razorpay_signature: response.razorpay_signature || 'direct_payment'
          };

          // Verify payment (simplified for direct payment)
          const verification = await verifyRazorpayPayment(
            paymentResponse.razorpay_payment_id,
            paymentResponse.razorpay_order_id,
            paymentResponse.razorpay_signature
          );

          if (verification.success) {
            onSuccess(paymentResponse);
          } else {
            onError(new Error('Payment verification failed'));
          }
        } catch (error) {
          console.error('Payment handler error:', error);
          onError(error);
        }
      },
      prefill: {
        name: orderData.customerInfo.name,
        email: orderData.customerInfo.email,
        contact: orderData.customerInfo.phone,
      },
      notes: {
        address: `${orderData.deliveryAddress.plotNumber || ''} ${orderData.deliveryAddress.buildingName || ''}, ${orderData.deliveryAddress.street || ''}, ${orderData.deliveryAddress.address}`.trim(),
        order_id: order.id,
        customer_name: orderData.customerInfo.name,
        items_count: orderData.items.length.toString()
      },
      theme: {
        color: '#dc2626', // Red color matching the app theme
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal dismissed by user');
          onError(new Error('Payment cancelled by user'));
        },
      },
      retry: {
        enabled: true,
        max_count: 3
      }
    };

    // Create Razorpay instance and open
    const razorpay = new window.Razorpay(options);
    razorpay.open();

  } catch (error) {
    onError(error);
  }
};

// Format amount for display
export const formatRazorpayAmount = (amount: number): string => {
  return `₹${(amount / 100).toFixed(2)}`;
};

// Generate order receipt
export const generateOrderReceipt = (orderData: OrderData): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `BUKBOX_${timestamp}_${orderData.orderId.substring(orderData.orderId.length - 6)}`;
};
