/*
  delhivery.service.ts
  Clean, well-structured Delhivery API integration for frontend/backend usage.
  - Uses a configurable proxy to call Delhivery endpoints (avoid exposing Delhivery token in frontend)
  - Robust parsing, clear types, and helpful helper functions
  - Exports a single instance `delhiveryService` and helper factory `createDelhiveryOrderFromCheckout`
*/

/* -----------------------------
   Types & Interfaces
   ----------------------------- */
export interface DelhiveryPoint {
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
  category?: string;
}

export interface DelhiveryCreateOrderRequest {
  pickup_details: DelhiveryPoint;
  drop_details: DelhiveryPoint;
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
  status: 'created' | 'error' | 'unknown';
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

/* -----------------------------
   Configuration / Constants
   ----------------------------- */
const DEFAULT_PROXY_URL = (import.meta as any).env?.VITE_DELHIVERY_PROXY_URL ||
  'https://dhmehtfdxqwumtwktmlp.supabase.co/functions/v1/delhivery-proxy';

const DEFAULT_SUPABASE_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// ✅ Updated pickup location to Super Sweets, Tohana, Haryana
export const PICKUP_LOCATION: DelhiveryPoint = {
  lat: 29.7030,
  lng: 75.9032,
  address: 'Super Sweets, Railway Station Rd, Ram Nagar, Tohana, Haryana 125120',
  name: 'Super Sweets',
  phone: '+91-9876543210',
  pincode: '125120'
};

// Minimal pincode mapping (kept small here — extend as needed)
const PINCODE_PINCODE_MAPPING: Record<string, string> = {
  '110001': '110001',
  '201016': '201016',
  '226010': '226010',
  '125120': '125120',
  default: '110001'
};

/* -----------------------------
   Utilities
   ----------------------------- */
function buildProxyUrl(proxyBase: string, path: string, method: 'GET' | 'POST' = 'GET'): string {
  const params = new URLSearchParams({ path, method });
  return `${proxyBase}?${params.toString()}`;
}

function safeParseJson<T = any>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    console.warn('JSON parse failed', e);
    return null;
  }
}

function normalizePincode(pin?: string): string {
  if (!pin) return PINCODE_PINCODE_MAPPING.default;
  const cleaned = pin.replace(/\D/g, '').slice(0, 6);
  return PINCODE_PINCODE_MAPPING[cleaned] || PINCODE_PINCODE_MAPPING.default;
}

function getDeliveryTimeEstimate(pickupPincode: string, deliveryPincode: string): string {
  const a = normalizePincode(pickupPincode);
  const b = normalizePincode(deliveryPincode);
  if (a === b) return '1-2 business days';
  if (a.substring(0, 3) === b.substring(0, 3)) return '2-3 business days';
  return '3-5 business days';
}

/* -----------------------------
   DelhiveryService Class
   ----------------------------- */
class DelhiveryService {
  private proxyUrl: string;
  private supabaseKey: string;

  constructor(proxyUrl = DEFAULT_PROXY_URL, supabaseKey = DEFAULT_SUPABASE_KEY) {
    this.proxyUrl = proxyUrl;
    this.supabaseKey = supabaseKey;
  }

  private async fetchProxy(fullUrl: string, init?: RequestInit) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.supabaseKey) headers['Authorization'] = `Bearer ${this.supabaseKey}`;

    const resp = await fetch(fullUrl, { ...(init || {}), headers });
    const text = await resp.text();
    if (!resp.ok) {
      const parsed = safeParseJson<any>(text);
      const message = parsed?.detail || parsed?.message || text;
      throw new Error(`Delhivery proxy error: ${resp.status} - ${message}`);
    }
    return { status: resp.status, text };
  }

  async estimateDeliveryPricing(
    pickupPincode: string,
    deliveryPincode: string,
    orderValue: number,
    weightKg = 2.5
  ): Promise<DelhiveryPricingResponse> {
    try {
      const grams = Math.max(1, Math.round(weightKg * 1000)).toString();
      const query = new URLSearchParams({ md: 'S', ss: 'RTO', d_pin: deliveryPincode, o_pin: pickupPincode, cgm: grams });
      const path = `/api/kinko/v1/invoice/charges/.json?${query.toString()}`;
      const url = buildProxyUrl(this.proxyUrl, path, 'GET');

      const { text } = await this.fetchProxy(url);
      const parsed = safeParseJson<any>(text);
      if (!parsed) {
        return {
          shipping_charges: 0,
          cod_charges: 0,
          estimated_delivery_time: 'Service not available',
          serviceability: false
        };
      }

      const chargeData = Array.isArray(parsed) && parsed.length ? parsed[0] : parsed;

      const shippingCharges = Number(chargeData?.total_amount ?? chargeData?.shipping_charges ?? chargeData?.amount ?? 0) || 0;
      const isServiceable = Boolean(chargeData?.serviceability) || shippingCharges > 0 || Boolean(chargeData?.success);

      return {
        shipping_charges: shippingCharges,
        cod_charges: orderValue > 1000 ? 0 : 30,
        estimated_delivery_time: chargeData?.estimated_delivery_time ?? chargeData?.delivery_time ?? getDeliveryTimeEstimate(pickupPincode, deliveryPincode),
        serviceability: isServiceable
      };
    } catch (err) {
      console.error('estimateDeliveryPricing error:', err);
      return {
        shipping_charges: 0,
        cod_charges: 0,
        estimated_delivery_time: 'Service not available',
        serviceability: false
      };
    }
  }

  async createDeliveryOrder(order: DelhiveryCreateOrderRequest): Promise<DelhiveryOrderResponse> {
    try {
      const path = `/api/cmu/create.json?format=json`;
      const params = new URLSearchParams({ path, method: 'GET' });
      params.append('body', JSON.stringify(order));
      const url = `${this.proxyUrl}?${params.toString()}`;

      const { text } = await this.fetchProxy(url);
      const parsed = safeParseJson<any>(text) || {};

      if (parsed?.message && String(parsed.message).includes('Delhivery proxy function is working')) {
        console.warn('Proxy debug response detected');
        return {
          task_id: '',
          status: 'error',
          tracking_url: '',
          estimated_fare: 0,
          estimated_delivery_time: 'Service unavailable'
        };
      }

      const pkg = parsed?.packages?.[0] ?? parsed;
      const taskId = pkg?.refnum ?? pkg?.waybill ?? '';
      const fare = Number(pkg?.total_amount ?? pkg?.total_charge ?? 0) || 0;

      return {
        task_id: String(taskId),
        status: parsed?.success ? 'created' : 'unknown',
        tracking_url: pkg?.waybill ? `https://www.delhivery.com/tracking/${pkg.waybill}` : 'https://www.delhivery.com/',
        estimated_fare: fare,
        estimated_delivery_time: getDeliveryTimeEstimate(order.pickup_details.pincode, order.drop_details.pincode)
      };
    } catch (err) {
      console.error('createDeliveryOrder error:', err);
      return {
        task_id: '',
        status: 'error',
        tracking_url: '',
        estimated_fare: 0,
        estimated_delivery_time: 'Service unavailable'
      };
    }
  }

  async getOrderStatus(taskId: string): Promise<{ status: string; location?: { lat: number; lng: number } }> {
    try {
      const path = `/api/v1/packages/json/?waybill=${encodeURIComponent(taskId)}`;
      const url = buildProxyUrl(this.proxyUrl, path, 'GET');
      const { text } = await this.fetchProxy(url);
      const parsed = safeParseJson<any>(text);
      if (!parsed) return { status: 'not_found' };

      if (parsed?.message && String(parsed.message).includes('Delhivery proxy function is working')) return { status: 'error' };

      const first = Array.isArray(parsed) && parsed.length ? parsed[0] : parsed;
      const status = first?.status ?? 'unknown';
      const location = first?.location ? { lat: Number(first.location.latitude), lng: Number(first.location.longitude) } : undefined;
      return { status, location };
    } catch (err) {
      console.error('getOrderStatus error:', err);
      return { status: 'error' };
    }
  }

  async cancelOrder(taskId: string): Promise<boolean> {
    try {
      const path = `/api/p/edit?waybill=${encodeURIComponent(taskId)}&cancellation=true`;
      const url = buildProxyUrl(this.proxyUrl, path, 'GET');
      const { text } = await this.fetchProxy(url);
      const parsed = safeParseJson<any>(text) || {};
      if (parsed?.message && String(parsed.message).includes('Delhivery proxy function is working')) return false;
      return Boolean(parsed?.success === true);
    } catch (err) {
      console.error('cancelOrder error:', err);
      return false;
    }
  }
}

export const delhiveryService = new DelhiveryService();

export function createDelhiveryOrderFromCheckout(
  orderNumber: string,
  customerInfo: { name: string; phone: string },
  deliveryLocation: { lat?: number; lng?: number; city?: string; state?: string },
  addressDetails: { address: string; landmark?: string; pincode?: string; instructions?: string },
  items: { name: string; quantity: number; price: number; category?: string }[],
  total: number,
  paymentMethod: string
): DelhiveryCreateOrderRequest {
  const pincode = normalizePincode(addressDetails.pincode || deliveryLocation?.['pincode']);
  const address = `${addressDetails.address}${addressDetails.landmark ? ', ' + addressDetails.landmark : ''}${deliveryLocation?.city ? ', ' + deliveryLocation.city : ''}${deliveryLocation?.state ? ', ' + deliveryLocation.state : ''}`;

  return {
    pickup_details: PICKUP_LOCATION,
    drop_details: {
      lat: deliveryLocation.lat ?? 28.6139,
      lng: deliveryLocation.lng ?? 77.2090,
      address,
      name: customerInfo.name,
      phone: customerInfo.phone,
      pincode
    },
    order_details: {
      order_id: orderNumber,
      order_value: total,
      payment_mode: paymentMethod === 'cod' ? 'COD' : 'PREPAID',
      items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, category: i.category ?? 'General' })),
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone
    },
    vehicle_type: 'bike',
    delivery_instructions: addressDetails.instructions ?? 'Handle with care'
  };
}

export async function testDelhiveryAPI(): Promise<void> {
  console.log('Testing Delhivery API connection...');
  try {
    const r = await delhiveryService.estimateDeliveryPricing('125120', '226010', 1500, 2.5);
    console.log('Test result:', r);
  } catch (e) {
    console.error('testDelhiveryAPI failed:', e);
  }
}

export async function testDelhiveryWithExactParams(): Promise<void> {
  console.log('Testing Delhivery exact curl params...');
  try {
    const query = new URLSearchParams({ md: 'S', ss: 'RTO', d_pin: '226010', o_pin: '125120', cgm: '2500' });
    const path = `/api/kinko/v1/invoice/charges/.json?${query.toString()}`;
    const url = buildProxyUrl(DEFAULT_PROXY_URL, path, 'GET');
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DEFAULT_SUPABASE_KEY}` } });
    console.log('status', res.status);
    console.log('text', await res.text());
  } catch (e) {
    console.error('testDelhiveryWithExactParams failed:', e);
  }
}
