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

      // Use the Supabase proxy function to make the API call
      const proxyUrl = 'https://dhmehtfdxqwumtwktmlp.supabase.co/functions/v1/delhivery-proxy';
      
      const requestBody = {
        method: 'POST',
        path: '/api/kinko/v1/invoice/charges/.json',
        body: {
          pickupPincode: pickupPincode,
          deliveryPincode: deliveryPincode,
          orderValue: orderValue,
          weight: weight
        }
      };
      
      console.log('Sending request to Delhivery proxy:', proxyUrl, requestBody);
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Delhivery proxy response status:', response.status);
      console.log('Delhivery proxy response headers:', [...response.headers.entries()]);

      // Check if the response is OK (status in the range 200-299)
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delhivery API error response:', errorText);
        
        // Try to parse the error response
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.detail) {
            throw new Error(`Delhivery API error: ${response.status} - ${errorData.detail}`);
          } else if (errorData.message) {
            throw new Error(`Delhivery API error: ${response.status} - ${errorData.message}`);
          }
        } catch (parseError) {
          // If we can't parse the error, use the raw text
          throw new Error(`Delhivery API error: ${response.status} - ${errorText}`);
        }
        
        throw new Error(`Delhivery API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Delhivery API response data:', data);
      
      // Check if this is a debug response (indicating the function is not properly deployed)
      if (data.message && data.message.includes("Delhivery proxy function is working")) {
        console.warn("Proxy function is returning debug response - may not be properly configured");
        // Return default values in this case
        return {
          shipping_charges: 0,
          cod_charges: 0,
          estimated_delivery_time: 'Service temporarily unavailable',
          serviceability: false
        };
      }
      
      // Parse the response to extract pricing information
      if (data && data.length > 0) {
        const chargeData = data[0];
        const shippingCharges = chargeData.total_amount || 0;
        
        // Check serviceability based on API response
        const isServiceable = chargeData.total_amount > 0;
        
        return {
          shipping_charges: shippingCharges,
          cod_charges: orderValue > 1000 ? 0 : 30, // COD charges
          estimated_delivery_time: this.getDeliveryTimeEstimate(pickupPincode, deliveryPincode),
          serviceability: isServiceable
        };
      } else {
        // If no data returned, service is not available
        return {
          shipping_charges: 0,
          cod_charges: 0,
          estimated_delivery_time: 'Service not available',
          serviceability: false
        };
      }
    } catch (error) {
      console.error('Delhivery pricing estimation error:', error);
      // If API call fails, service is not available
      return {
        shipping_charges: 0,
        cod_charges: 0,
        estimated_delivery_time: 'Service not available',
        serviceability: false
      };
    }
  }

  // Get delivery time estimate based on pincode distance
  private getDeliveryTimeEstimate(pickupPincode: string, deliveryPincode: string): string {
    // Clean the pincodes
    const cleanPickupPincode = pickupPincode.replace(/\D/g, '').slice(0, 6);
    const cleanDeliveryPincode = deliveryPincode.replace(/\D/g, '').slice(0, 6);
    
    // If same pincode, fastest delivery
    if (cleanPickupPincode === cleanDeliveryPincode) {
      return '1-2 business days';
    }
    
    // Check if both pincodes are in the same city/region
    const pickupRegion = cleanPickupPincode.substring(0, 3);
    const deliveryRegion = cleanDeliveryPincode.substring(0, 3);
    
    if (pickupRegion === deliveryRegion) {
      return '2-3 business days';
    }
    
    // Different regions/cities
    return '3-5 business days';
  }

  // Create a delivery order with Delhivery
  async createDeliveryOrder(orderData: DelhiveryCreateOrderRequest): Promise<DelhiveryOrderResponse> {
    try {
      console.log('Creating Delhivery delivery order:', orderData);

      // Use the Supabase proxy function to make the API call
      const proxyUrl = 'https://dhmehtfdxqwumtwktmlp.supabase.co/functions/v1/delhivery-proxy';
      
      const requestBody = {
        method: 'POST',
        path: '/api/cmu/create.json?format=json',
        body: orderData
      };
      
      console.log('Sending request to Delhivery proxy:', proxyUrl, requestBody);
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Delhivery proxy response status:', response.status);
      console.log('Delhivery proxy response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delhivery API error response:', errorText);
        throw new Error(`Delhivery API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Delhivery API response data:', data);
      
      // Return the actual response from Delhivery
      return {
        task_id: data.packages?.[0]?.refnum || '',
        status: data.success ? 'created' : 'error',
        tracking_url: data.packages?.[0]?.waybill
          ? `https://www.delhivery.com/tracking/${data.packages[0].waybill}`
          : `https://www.delhivery.com/`,
        estimated_fare: data.packages?.[0]?.total_amount || 0,
        estimated_delivery_time: this.getDeliveryTimeEstimate(
          orderData.pickup_details.pincode, 
          orderData.drop_details.pincode
        )
      };
    } catch (error) {
      console.error('Delhivery API error:', error);
      // Return error response when API calls fail
      return {
        task_id: '',
        status: 'error',
        tracking_url: '',
        estimated_fare: 0,
        estimated_delivery_time: 'Service unavailable'
      };
    }
  }

  // Get mock order response - only used when API calls fail
  private getMockOrderResponse(): DelhiveryOrderResponse {
    const mockResponse: DelhiveryOrderResponse = {
      task_id: `DLV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'error',
      tracking_url: `https://www.delhivery.com/`,
      estimated_fare: 0,
      estimated_delivery_time: 'Service unavailable'
    };
    
    console.log('Using mock Delhivery response due to API error:', mockResponse);
    return mockResponse;
  }

  // Get order status from Delhivery
  async getOrderStatus(taskId: string): Promise<{ status: string; location?: { lat: number; lng: number } }> {
    try {
      // Use the Supabase proxy function to make the API call
      const proxyUrl = 'https://dhmehtfdxqwumtwktmlp.supabase.co/functions/v1/delhivery-proxy';
      
      const requestBody = {
        method: 'GET',
        path: `/api/v1/packages/json/?waybill=${taskId}`
      };
      
      console.log('Sending request to Delhivery proxy:', proxyUrl, requestBody);
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Delhivery proxy response status:', response.status);
      console.log('Delhivery proxy response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delhivery API error response:', errorText);
        throw new Error(`Delhivery API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Delhivery API response data:', data);
      
      // Parse the response to extract status information
      if (data && data.length > 0) {
        const packageData = data[0];
        return {
          status: packageData.status || 'unknown',
          location: packageData.location
            ? { lat: packageData.location.latitude, lng: packageData.location.longitude }
            : undefined
        };
      } else {
        return { status: 'not_found' };
      }
    } catch (error) {
      console.error('Delhivery status check error:', error);
      return { status: 'error' };
    }
  }

  // Cancel Delhivery order
  async cancelOrder(taskId: string): Promise<boolean> {
    try {
      // Use the Supabase proxy function to make the API call
      const proxyUrl = 'https://dhmehtfdxqwumtwktmlp.supabase.co/functions/v1/delhivery-proxy';
      
      const requestBody = {
        method: 'GET',
        path: `/api/p/edit?waybill=${taskId}&cancellation=true`
      };
      
      console.log('Sending request to Delhivery proxy:', proxyUrl, requestBody);
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Delhivery proxy response status:', response.status);
      console.log('Delhivery proxy response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delhivery API error response:', errorText);
        throw new Error(`Delhivery API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Delhivery API response data:', data);
      
      // Check if cancellation was successful
      return data.success === true;
    } catch (error) {
      console.error('Delhivery cancel order error:', error);
      // Return false when API calls fail
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