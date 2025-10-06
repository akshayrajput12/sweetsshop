# Sweetsshop - Delhivery API Integration

This e-commerce application integrates with Delhivery's API to calculate accurate delivery fees based on the distance between the customer's location and the shop location. The integration provides real-time pricing estimates and order tracking capabilities.

## Features

### Delhivery Delivery API Integration
- Delivery fees are calculated using Delhivery's real-time pricing API
- Free delivery threshold can be configured
- Delivery estimates include both pricing and time
- Order tracking and status updates
- Cash on Delivery (COD) charge calculation
- Serviceability checking for delivery areas

### Configuration Settings
The following settings can be configured:

1. **Delhivery API Credentials**
   - Environment variables `VITE_DELHIVERY_API_KEY` and `VITE_DELHIVERY_BASE_URL`

2. **Shop Location**
   - Fixed pickup location in `src/utils/delhivery.ts`

3. **Delivery Pricing**
   - `free_delivery_threshold`: Minimum order amount for free delivery (₹)

## Implementation Details

### Delhivery API Integration
The system integrates with Delhivery's delivery API to get real-time delivery pricing estimates. The integration includes:

1. **Pricing Estimation**: Calculates delivery fees based on pincode distance
2. **Order Creation**: Creates delivery orders in the Delhivery system
3. **Order Tracking**: Retrieves order status and location information
4. **Order Cancellation**: Cancels orders in the Delhivery system

### Delivery Fee Calculation
The delivery fee is calculated using a simplified distance-based algorithm based on pincode:
- Same pincode: Minimal charge
- Same city: Moderate charge
- Different cities: Higher charge

The current implementation uses a mock calculation for demonstration purposes. To enable real API calls, uncomment the actual API call sections in `src/utils/delhivery.ts`.

### Fallback Mechanism
The system includes a built-in fallback mechanism that uses simplified distance calculations when the API is unavailable or during development.

## How It Works

1. Customer enters their delivery address during checkout
2. System extracts pincode from the address
3. Calculates distance-based delivery fee using pincode mapping
4. Applies free delivery rules based on order value
5. Displays calculated delivery fee to customer

## Configuration

### Getting Delhivery API Credentials

To use the Delhivery API integration, you need to obtain API credentials from Delhivery:

1. **Visit the Delhivery Developer Portal**:
   - Go to [https://www.delhivery.com/business-with-us/technology-partners/](https://www.delhivery.com/business-with-us/technology-partners/)
   - Click on "API Integration" or contact Delhivery sales

2. **Register Your Business**:
   - Fill out the business registration form
   - Provide your business details, including:
     - Business name and address
     - Contact person and phone number
     - Expected monthly shipment volume
     - Business type (e-commerce, retail, etc.)

3. **Get API Access**:
   - After approval, Delhivery will provide:
     - **API Key**: Used for authentication with Delhivery services
     - **Account ID**: Your unique identifier in the Delhivery system
     - **Documentation**: API documentation and integration guides

4. **Test Environment**:
   - Delhivery provides a sandbox environment for testing
   - Use the test API endpoint: `https://staging-experience.delhivery.com`
   - Obtain test credentials from your Delhivery account manager

### Environment Variables
Create a `.env` file in the root of your project with your Delhivery API credentials:
```env
# Delhivery API Configuration
VITE_DELHIVERY_API_KEY=your_actual_delhivery_api_key_here
VITE_DELHIVERY_BASE_URL=https://track.delhivery.com

# For testing, you can use:
# VITE_DELHIVERY_BASE_URL=https://staging-experience.delhivery.com
```

### Shop Pickup Location
Configure your shop pickup location in `src/utils/delhivery.ts`:
```typescript
export const PICKUP_LOCATION = {
  lat: 28.6139, // Your shop's latitude
  lng: 77.2090,  // Your shop's longitude
  address: "Your Shop Complete Address",
  name: "Your Shop Name",
  phone: "Your Shop Phone Number",
  pincode: "Your Shop Pincode" // Important for Delhivery API
};
```

### Admin Settings
Set delivery-related settings in the admin panel:
- `free_delivery_threshold`: Minimum order amount for free delivery (₹)
- `delivery_charge`: Standard delivery charge (fallback when API is unavailable)
- `cod_charge`: Additional charge for Cash on Delivery
- `cod_threshold`: Maximum order value for COD availability

## Files Implementation

- `src/pages/Checkout.tsx`: Main implementation of Delhivery API integration for delivery fee calculation
- `src/utils/delhivery.ts`: Complete Delhivery service with all API methods (pricing, order creation, tracking, cancellation)
- `src/hooks/useSettings.ts`: Settings management for delivery pricing rules

## API Methods Implementation

The Delhivery service in `src/utils/delhivery.ts` includes the following methods:

### 1. estimateDeliveryPricing()
Calculates delivery fees based on pickup and delivery pincodes:
```typescript
async estimateDeliveryPricing(
  pickupPincode: string, 
  deliveryPincode: string, 
  orderValue: number, 
  weight: number = 1
): Promise<DelhiveryPricingResponse>
```

### 2. createDeliveryOrder()
Creates a delivery order in the Delhivery system:
```typescript
async createDeliveryOrder(
  orderData: DelhiveryCreateOrderRequest
): Promise<DelhiveryOrderResponse>
```

### 3. getOrderStatus()
Retrieves the current status of a delivery order:
```typescript
async getOrderStatus(
  taskId: string
): Promise<{ status: string; location?: { lat: number; lng: number } }>
```

### 4. cancelOrder()
Cancels a delivery order in the Delhivery system:
```typescript
async cancelOrder(taskId: string): Promise<boolean>
```

## Error Handling

The Delhivery integration includes comprehensive error handling:

1. **API Errors**: Network failures, authentication issues, and server errors are caught and logged
2. **Fallback Pricing**: If the API is unavailable, the system uses a simplified distance-based calculation
3. **Serviceability Check**: Verifies if delivery is possible to the customer's area
4. **Graceful Degradation**: Maintains checkout functionality even when the delivery API is down

## Testing the Integration

To test the Delhivery integration:

1. **Development Testing**:
   - The current implementation uses mock responses for development
   - Actual API calls are commented out but ready to be enabled

2. **Sandbox Testing**:
   - Uncomment the actual API calls in `delhivery.ts`
   - Update the base URL to the staging environment
   - Use test credentials provided by Delhivery

3. **Production Testing**:
   - Update environment variables with production credentials
   - Test with real addresses and pincodes
   - Verify pricing calculations and order creation

## Enabling Real API Calls

To enable actual Delhivery API calls instead of mock responses:

1. In `src/utils/delhivery.ts`, uncomment the actual API call sections
2. Comment out or remove the mock response code
3. Ensure your API key has the necessary permissions
4. Test thoroughly in the staging environment first

Example for the pricing estimation method:
```typescript
// Uncomment this section to enable real API calls:
const response = await fetch(`${this.baseUrl}/api/kinko/v1/invoice/charges.json`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.apiKey}`,
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    pickup_pincode: normalizedPickupPincode,
    delivery_pincode: normalizedDeliveryPincode,
    order_value: orderValue,
    weight: weight
  })
});

// if (!response.ok) {
//   throw new Error(`Delhivery API error: ${response.status} ${response.statusText}`);
// }

// const result = await response.json();

// Comment out or remove the mock calculation:
// const distanceFactor = this.calculateDistanceFactor(normalizedPickupPincode, normalizedDeliveryPincode);
// const shippingCharges = Math.max(50, Math.round(50 + (distanceFactor * 10) + (weight * 5)));

// Return the actual API response:
// return {
//   shipping_charges: result.shipping_charges,
//   cod_charges: result.cod_charges,
//   estimated_delivery_time: result.estimated_delivery_time,
//   serviceability: result.serviceability
// };
```

## Future Improvements

1. Implement caching for delivery estimates to reduce API calls
2. Add delivery time estimates to the checkout process
3. Implement real-time tracking updates in the customer dashboard
4. Add support for multiple delivery partners
5. Implement webhook handling for real-time order status updates
6. Add retry mechanisms for failed API calls
7. Implement rate limiting to prevent API abuse
8. Add detailed logging for debugging and monitoring

## Troubleshooting

Common issues and solutions:

1. **API Authentication Errors**:
   - Verify your API key is correct and active
   - Check that you're using the correct base URL
   - Ensure your account has API access permissions

2. **Serviceability Issues**:
   - Verify the delivery pincode is serviceable by Delhivery
   - Check if there are any temporary service disruptions

3. **Pricing Discrepancies**:
   - Ensure pincodes are correctly formatted (6 digits)
   - Check if there are any special pricing rules for your account

4. **Network Issues**:
   - Implement retry logic for transient network failures
   - Add timeout handling for slow API responses

## Support

For issues with the Delhivery integration:
1. Check the browser console for error messages
2. Verify your API credentials in the `.env` file
3. Contact Delhivery support for API-related issues
4. Check the Delhivery developer documentation for API updates