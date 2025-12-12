# Raj Luxmi - Delhivery API Integration

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

1. **Pricing Estimation**: Calculates delivery fees based on pincode distance using actual Delhivery API data
2. **Serviceability Check**: Verifies if delivery is possible to the customer's area using real API responses
3. **Order Creation**: Creates delivery orders in the Delhivery system
4. **Order Tracking**: Retrieves order status and location information
5. **Order Cancellation**: Cancels orders in the Delhivery system

### Delivery Fee Calculation
The delivery fee is now calculated using the actual Delhivery API which provides accurate pricing based on:
- Distance between pickup and delivery locations
- Package weight
- Delivery zone
- Service type (surface/air)
- Additional charges (fuel, peak, etc.)

### Serviceability Checking
The system now checks serviceability in real-time using Delhivery's API responses rather than assumptions.

### Fallback Mechanism
The system includes a built-in fallback mechanism that uses simplified distance calculations when the API is unavailable or during development.

## How It Works

1. Customer enters their delivery address during checkout
2. System extracts pincode from the address
3. Makes real-time API call to Delhivery to calculate accurate delivery fee and check serviceability
4. Displays calculated delivery fee and estimated delivery time to customer
5. If delivery is not serviceable to the area, informs the customer accordingly

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
VITE_DELHIVERY_API_KEY=your_actual_delivery_api_key_here
VITE_DELHIVERY_BASE_URL=https://track.delhivery.com

# For testing, you can use:
# VITE_DELHIVERY_BASE_URL=https://staging-experience.delhivery.com
```

**Important**: You also need to set the `DELHIVERY_API_KEY` environment variable in your Supabase project settings for the proxy function to work.

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
- `supabase/functions/delhivery-proxy/index.ts`: Proxy function to handle Delhivery API calls and avoid CORS issues

## API Methods Implementation

The Delhivery service in `src/utils/delhivery.ts` includes the following methods:

### 1. estimateDeliveryPricing()
Calculates delivery fees based on pickup and delivery pincodes using the actual Delhivery API:
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

### Testing the Supabase Function

I've created several test files to help you verify your Supabase function is working correctly:

1. **Browser-based Testing**:
   - Open `test-delhivery-function.html` in your browser to test basic function calls
   - Open `test-delhivery-integration.html` in your browser for comprehensive Delhivery API testing

2. **Command-line Testing**:
   - Run `node test-delhivery-function.js` to test the function from the command line

3. **Manual Testing with curl**:
   ```bash
   curl -X POST https://dhmehtfdxqwumtwktmlp.supabase.co/functions/v1/delhivery-proxy \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
     -d '{
       "method": "GET",
       "path": "/api/kinko/v1/invoice/charges/.json?md=S&ss=RTO&d_pin=400001&o_pin=110001&cgm=1000"
     }'
   ```

### Setting up Environment Variables

1. **Frontend Environment Variables**:
   - Create a `.env` file in your project root
   - Add: `VITE_DELHIVERY_API_KEY=your_api_key_here`

2. **Supabase Environment Variables**:
   - Go to your Supabase project dashboard
   - Navigate to Settings > Configuration > Environment Variables
   - Add a new variable:
     - Name: `DELHIVERY_API_KEY`
     - Value: Your actual Delhivery API key
   - Redeploy your functions after adding the variable

3. **Supabase Anon Key**:
   - You'll need your Supabase project's anon key for client-side requests
   - Find it in your Supabase project dashboard under Project Settings > API

## Enabling Real API Calls

✅ **Real Delhivery API calls are now enabled!**

The application is now configured to use the actual Delhivery API for:

1. **Delivery Pricing Estimation** - Real-time calculation of shipping charges based on pincode distance using the `/api/kinko/v1/invoice/charges/.json` endpoint
2. **Serviceability Checking** - Real-time verification if delivery is possible to customer's area
3. **Order Creation** - Creating delivery orders in the Delhivery system
4. **Order Tracking** - Retrieving real-time status updates for orders
5. **Order Cancellation** - Canceling orders in the Delhivery system

All API methods have been implemented with proper error handling. **No fallback or mock data is used in normal operation** - all data is retrieved dynamically from the Delhivery API.

## Future Improvements

1. ~~Implement caching for delivery estimates to reduce API calls~~ (Implemented)
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
   - Make sure the `DELHIVERY_API_KEY` is set in your Supabase project settings
   - Ensure you're using the correct Authorization header format (`Token` for Delhivery API, `Bearer` for Supabase)

2. **Serviceability Issues**:
   - Verify the delivery pincode is serviceable by Delhivery
   - Check if there are any temporary service disruptions

3. **Pricing Discrepancies**:
   - Ensure pincodes are correctly formatted (6 digits)
   - Check if there are any special pricing rules for your account

4. **Network Issues**:
   - Implement retry logic for transient network failures
   - Add timeout handling for slow API responses

5. **401 Unauthorized Errors**:
   - Ensure the `DELHIVERY_API_KEY` environment variable is correctly set in your Supabase project
   - Verify your API key has the correct permissions
   - Check that the Authorization header in client requests uses `Bearer` with your Supabase anon key
   - Check that the Authorization header in the proxy function uses `Token` with your Delhivery API key

## Support

For issues with the Delhivery integration:
1. Check the browser console for error messages
2. Verify your API credentials in the `.env` file
3. Contact Delhivery support for API-related issues
4. Check the Delhivery developer documentation for API updates