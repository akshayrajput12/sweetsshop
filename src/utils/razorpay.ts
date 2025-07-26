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
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
    [key: string]: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
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

// Create order on backend (mock implementation)
export const createRazorpayOrder = async (orderData: OrderData): Promise<{
  id: string;
  amount: number;
  currency: string;
}> => {
  // In a real application, this would be an API call to your backend
  // For demo purposes, we'll simulate the order creation
  
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    id: orderId,
    amount: orderData.amount * 100, // Razorpay expects amount in paise
    currency: orderData.currency
  };
};

// Verify payment on backend (mock implementation)
export const verifyRazorpayPayment = async (
  paymentId: string,
  orderId: string,
  signature: string
): Promise<{ success: boolean; message: string }> => {
  // In a real application, this would verify the payment signature on your backend
  // For demo purposes, we'll simulate successful verification
  
  console.log('Verifying payment:', { paymentId, orderId, signature });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    message: 'Payment verified successfully'
  };
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

    // Razorpay options
    const options: RazorpayOptions = {
      key: razorpayKey,
      amount: order.amount,
      currency: order.currency,
      name: import.meta.env.VITE_APP_NAME || 'Meat Feast',
      description: `Order for ${orderData.items.length} items`,
      order_id: order.id,
      handler: async (response: RazorpayResponse) => {
        try {
          // Verify payment
          const verification = await verifyRazorpayPayment(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          );

          if (verification.success) {
            onSuccess(response);
          } else {
            onError(new Error('Payment verification failed'));
          }
        } catch (error) {
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
      },
      theme: {
        color: '#dc2626', // Red color matching the app theme
      },
      modal: {
        ondismiss: () => {
          onError(new Error('Payment cancelled by user'));
        },
      },
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
  return `MEATFEAST_${timestamp}_${orderData.orderId.slice(-6)}`;
};
