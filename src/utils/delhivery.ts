// Delhivery API integration for delivery services

export interface DelhiveryPickupLocation {
  lat: number;
  lng: number;
  address: string;
  name: string;
  phone: string;
  pincode: string;
}

export interface DelhiveryDeliveryLocation {
  lat: number;
  lng: number;
  address: string;
  name: string;
  phone: string;
  pincode: string;
}

export interface DelhiveryOrderItem {
  name: string;
  quantity: number;
  price: number;
  category: string;
}

export interface DelhiveryCreateOrderRequest {
  pickup_details: DelhiveryPickupLocation;
  drop_details: DelhiveryDeliveryLocation;
  order_details: {
    order_id: string;
    order_value: number;
    payment_mode: 'COD' | 'PREPAID';
    items: DelhiveryOrderItem[];
    customer_name: string;
    customer_phone: string;
  };
  vehicle_type?: 'bike' | 'mini' | 'medium' | 'large';
  delivery_instructions?: string;
}

export interface DelhiveryOrderResponse {
  task_id: string;
  status: string;
  tracking_url: string;
  estimated_fare: number;
  estimated_delivery_time: string;
}

export interface DelhiveryPricingRequest {
  pickup_pincode: string;
  delivery_pincode: string;
  order_value: number;
  weight: number; // in kg
}

export interface DelhiveryPricingResponse {
  shipping_charges: number;
  cod_charges: number;
  estimated_delivery_time: string;
  serviceability: boolean;
}

// Fixed pickup location (your store/warehouse)
export const PICKUP_LOCATION: DelhiveryPickupLocation = {
  lat: 28.6139, // Delhi coordinates - update with your actual location
  lng: 77.2090,
  address: "Meat Feast Store, Connaught Place, New Delhi, Delhi 110001",
  name: "Meat Feast Store",
  phone: "+91-9876543210", // Update with your store phone
  pincode: "110001" // Update with your store pincode
};

// Pincode to pincode mapping for major cities in India
const PINCODE_PINCODE_MAPPING: Record<string, string> = {
  // Delhi NCR
  '110001': '110001',
  '110002': '110001',
  '110003': '110001',
  '110021': '110021',
  '110022': '110021',
  
  // Mumbai
  '400001': '400001',
  '400002': '400001',
  '400003': '400001',
  
  // Bangalore
  '560001': '560001',
  '560002': '560001',
  '560003': '560001',
  
  // Chennai
  '600001': '600001',
  '600002': '600001',
  
  // Kolkata
  '700001': '700001',
  '700002': '700001',
  
  // Hyderabad
  '500001': '500001',
  '500002': '500001',
  
  // Pune
  '411001': '411001',
  '411002': '411001',
  
  // Ahmedabad
  '380001': '380001',
  '380002': '380001',
  
  // Jaipur
  '302001': '302001',
  '302002': '302001',
  
  // Default fallback
  'default': '110001'
};

class DelhiveryService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_DELHIVERY_API_KEY || '';
    this.baseUrl = import.meta.env.VITE_DELHIVERY_BASE_URL || 'https://track.delhivery.com';
  }

  // Estimate delivery pricing using Delhivery API
  async estimateDeliveryPricing(pickupPincode: string, deliveryPincode: string, orderValue: number, weight: number = 1): Promise<DelhiveryPricingResponse> {
    try {
      console.log('Estimating Delhivery delivery pricing:', { pickupPincode, deliveryPincode, orderValue, weight });

      // Normalize pincode format
      const normalizedPickupPincode = pickupPincode.replace(/\D/g, '').slice(0, 6) || '110001';
      const normalizedDeliveryPincode = deliveryPincode.replace(/\D/g, '').slice(0, 6) || '110001';

      // For demo purposes, we'll use a simplified calculation
      // In a real implementation, you would call the Delhivery API
      // const response = await fetch(`${this.baseUrl}/api/kinko/v1/invoice/charges.json`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${this.apiKey}`,
      //     'Accept': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     pickup_pincode: normalizedPickupPincode,
      //     delivery_pincode: normalizedDeliveryPincode,
      //     order_value: orderValue,
      //     weight: weight
      //   })
      // });

      // if (!response.ok) {
      //   throw new Error(`Delhivery API error: ${response.status} ${response.statusText}`);
      // }

      // const result = await response.json();
      
      // Simplified calculation for demonstration
      const distanceFactor = this.calculateDistanceFactor(normalizedPickupPincode, normalizedDeliveryPincode);
      const shippingCharges = Math.max(50, Math.round(50 + (distanceFactor * 10) + (weight * 5)));
      
      return {
        shipping_charges: shippingCharges,
        cod_charges: orderValue > 1000 ? 0 : 30, // COD charges
        estimated_delivery_time: '2-5 business days',
        serviceability: true
      };
    } catch (error) {
      console.error('Delhivery pricing estimation error:', error);
      // Return a default estimate if API fails
      return {
        shipping_charges: 75, // Default shipping charges
        cod_charges: 30, // Default COD charges
        estimated_delivery_time: '2-5 business days',
        serviceability: true
      };
    }
  }

  // Calculate a simple distance factor based on pincodes
  private calculateDistanceFactor(pickupPincode: string, deliveryPincode: string): number {
    // This is a simplified approach for demonstration
    // In a real implementation, you would calculate actual distance
    if (pickupPincode === deliveryPincode) {
      return 0; // Same pincode
    }
    
    // Check if both pincodes are in the same city
    const pickupCity = this.getCityFromPincode(pickupPincode);
    const deliveryCity = this.getCityFromPincode(deliveryPincode);
    
    if (pickupCity === deliveryCity) {
      return 1; // Same city
    }
    
    // Different cities
    return 3;
  }

  // Get city from pincode (simplified)
  private getCityFromPincode(pincode: string): string {
    const cleanPincode = pincode.replace(/\D/g, '').slice(0, 6);
    
    // First 3 digits of pincode usually indicate the region
    const regionCode = cleanPincode.substring(0, 3);
    
    // Simplified mapping
    switch (regionCode) {
      case '110':
        return 'Delhi';
      case '400':
        return 'Mumbai';
      case '560':
        return 'Bangalore';
      case '600':
        return 'Chennai';
      case '700':
        return 'Kolkata';
      case '500':
        return 'Hyderabad';
      case '411':
        return 'Pune';
      case '380':
        return 'Ahmedabad';
      case '302':
        return 'Jaipur';
      default:
        return 'Delhi'; // Default
    }
  }

  // Create a delivery order with Delhivery
  async createDeliveryOrder(orderData: DelhiveryCreateOrderRequest): Promise<DelhiveryOrderResponse> {
    try {
      console.log('Creating Delhivery delivery order:', orderData);

      // In a real implementation, you would call the Delhivery API
      // const response = await fetch(`${this.baseUrl}/api/cmu/create.json`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${this.apiKey}`,
      //     'Accept': 'application/json'
      //   },
      //   body: JSON.stringify(orderData)
      // });

      // if (!response.ok) {
      //   throw new Error(`Delhivery API error: ${response.status} ${response.statusText}`);
      // }

      // const result = await response.json();
      // console.log('Delhivery order created successfully:', result);

      // Return mock response for development/testing
      const mockResponse: DelhiveryOrderResponse = {
        task_id: `DLV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'created',
        tracking_url: `https://www.delhivery.com/tracking/${Date.now()}`,
        estimated_fare: Math.floor(Math.random() * 100) + 50,
        estimated_delivery_time: '2-5 business days'
      };
      
      console.log('Using mock Delhivery response:', mockResponse);
      return mockResponse;
    } catch (error) {
      console.error('Delhivery API error:', error);
      
      // Return mock response for development/testing
      const mockResponse: DelhiveryOrderResponse = {
        task_id: `DLV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'created',
        tracking_url: `https://www.delhivery.com/tracking/${Date.now()}`,
        estimated_fare: Math.floor(Math.random() * 100) + 50,
        estimated_delivery_time: '2-5 business days'
      };
      
      console.log('Using mock Delhivery response:', mockResponse);
      return mockResponse;
    }
  }

  // Get order status from Delhivery
  async getOrderStatus(taskId: string): Promise<{ status: string; location?: { lat: number; lng: number } }> {
    try {
      // In a real implementation, you would call the Delhivery API
      // const response = await fetch(`${this.baseUrl}/api/v1/packages/json`, {
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //     'Accept': 'application/json'
      //   }
      // });

      // if (!response.ok) {
      //   throw new Error(`Delhivery API error: ${response.status} ${response.statusText}`);
      // }

      // const result = await response.json();
      
      // Return mock response for development/testing
      return {
        status: 'in_transit',
        location: {
          lat: 28.6139,
          lng: 77.2090
        }
      };
    } catch (error) {
      console.error('Delhivery status check error:', error);
      return { status: 'unknown' };
    }
  }

  // Cancel Delhivery order
  async cancelOrder(taskId: string): Promise<boolean> {
    try {
      // In a real implementation, you would call the Delhivery API
      // const response = await fetch(`${this.baseUrl}/api/cmu/cancel.json`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //     'Accept': 'application/json'
      //   },
      //   body: JSON.stringify({ task_id: taskId })
      // });

      // return response.ok;
      
      // For demo purposes, always return true
      return true;
    } catch (error) {
      console.error('Delhivery cancel order error:', error);
      return false;
    }
  }
}

export const delhiveryService = new DelhiveryService();

// Helper function to create Delhivery order from checkout data
export function createDelhiveryOrderFromCheckout(
  orderNumber: string,
  customerInfo: any,
  deliveryLocation: any,
  addressDetails: any,
  items: any[],
  total: number,
  paymentMethod: string
): DelhiveryCreateOrderRequest {
  return {
    pickup_details: PICKUP_LOCATION,
    drop_details: {
      lat: deliveryLocation.lat || 28.6139,
      lng: deliveryLocation.lng || 77.2090,
      address: `${addressDetails.address}, ${addressDetails.landmark ? addressDetails.landmark + ', ' : ''}${deliveryLocation.city}, ${deliveryLocation.state}`,
      name: customerInfo.name,
      phone: customerInfo.phone,
      pincode: addressDetails.pincode || '110001'
    },
    order_details: {
      order_id: orderNumber,
      order_value: total,
      payment_mode: paymentMethod === 'cod' ? 'COD' : 'PREPAID',
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        category: item.category || 'Food'
      })),
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone
    },
    vehicle_type: 'bike', // Default to bike for food delivery
    delivery_instructions: addressDetails.instructions || 'Handle with care - Fresh meat products'
  };
}