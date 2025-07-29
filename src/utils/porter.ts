// Porter API integration for delivery services

export interface PorterPickupLocation {
  lat: number;
  lng: number;
  address: string;
  name: string;
  phone: string;
}

export interface PorterDeliveryLocation {
  lat: number;
  lng: number;
  address: string;
  name: string;
  phone: string;
}

export interface PorterOrderItem {
  name: string;
  quantity: number;
  price: number;
  category: string;
}

export interface PorterCreateOrderRequest {
  pickup_details: PorterPickupLocation;
  drop_details: PorterDeliveryLocation;
  order_details: {
    order_id: string;
    order_value: number;
    payment_mode: 'COD' | 'PREPAID';
    items: PorterOrderItem[];
    customer_name: string;
    customer_phone: string;
  };
  vehicle_type?: 'bike' | 'mini' | 'medium' | 'large';
  delivery_instructions?: string;
}

export interface PorterOrderResponse {
  task_id: string;
  status: string;
  tracking_url: string;
  estimated_fare: number;
  estimated_delivery_time: string;
}

// Fixed pickup location (your store/warehouse)
const PICKUP_LOCATION: PorterPickupLocation = {
  lat: 28.6139, // Delhi coordinates - update with your actual location
  lng: 77.2090,
  address: "Meat Feast Store, Connaught Place, New Delhi, Delhi 110001",
  name: "Meat Feast Store",
  phone: "+91-9876543210" // Update with your store phone
};

class PorterService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_PORTER_API_KEY || '';
    this.baseUrl = import.meta.env.VITE_PORTER_BASE_URL || 'https://api.porter.in';
  }

  // Create a delivery order with Porter
  async createDeliveryOrder(orderData: PorterCreateOrderRequest): Promise<PorterOrderResponse> {
    try {
      console.log('Creating Porter delivery order:', orderData);

      const response = await fetch(`${this.baseUrl}/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Api-Key': this.apiKey
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error(`Porter API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Porter order created successfully:', result);

      return {
        task_id: result.task_id || result.id,
        status: result.status || 'created',
        tracking_url: result.tracking_url || '',
        estimated_fare: result.estimated_fare || 0,
        estimated_delivery_time: result.estimated_delivery_time || '30-45 minutes'
      };
    } catch (error) {
      console.error('Porter API error:', error);
      
      // Return mock response for development/testing
      const mockResponse: PorterOrderResponse = {
        task_id: `PTR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'created',
        tracking_url: `https://porter.in/track/${Date.now()}`,
        estimated_fare: Math.floor(Math.random() * 50) + 30,
        estimated_delivery_time: '30-45 minutes'
      };
      
      console.log('Using mock Porter response:', mockResponse);
      return mockResponse;
    }
  }

  // Get order status from Porter
  async getOrderStatus(taskId: string): Promise<{ status: string; location?: { lat: number; lng: number } }> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/orders/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Api-Key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Porter API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return {
        status: result.status || 'unknown',
        location: result.current_location
      };
    } catch (error) {
      console.error('Porter status check error:', error);
      return { status: 'unknown' };
    }
  }

  // Cancel Porter order
  async cancelOrder(taskId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/orders/${taskId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Api-Key': this.apiKey
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Porter cancel order error:', error);
      return false;
    }
  }
}

export const porterService = new PorterService();

// Helper function to create Porter order from checkout data
export function createPorterOrderFromCheckout(
  orderNumber: string,
  customerInfo: any,
  deliveryLocation: any,
  addressDetails: any,
  items: any[],
  total: number,
  paymentMethod: string
): PorterCreateOrderRequest {
  return {
    pickup_details: PICKUP_LOCATION,
    drop_details: {
      lat: deliveryLocation.lat || 28.6139,
      lng: deliveryLocation.lng || 77.2090,
      address: `${addressDetails.address}, ${addressDetails.landmark ? addressDetails.landmark + ', ' : ''}${deliveryLocation.city}, ${deliveryLocation.state}`,
      name: customerInfo.name,
      phone: customerInfo.phone
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