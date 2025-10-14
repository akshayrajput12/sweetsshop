# Delhivery API Implementation Guide

## Overview
This document explains the implementation of the Delhivery delivery API integration for calculating delivery charges from the admin address to user delivery addresses.

## API Details

### Endpoint
```
https://track.delhivery.com/api/kinko/v1/invoice/charges/.json
```

### Parameters
- `md=S` - Surface delivery mode
- `ss=RTO` - Service type (Return to Origin)
- `d_pin={delivery_pincode}` - Destination pincode (user address)
- `o_pin={origin_pincode}` - Origin pincode (admin address)
- `cgm={weight_in_grams}` - Weight in grams (2500g for 2.5kg)

### Authentication
```
Authorization: Token db825db6ab6c44b3e809520915801f5dbc205d92
```

## Implementation Details

### 1. Fixed Package Configuration
- **Weight**: 2.5kg (2500g)
- **Dimensions**: 3x3x3 (fixed for all deliveries)
- **Service Type**: Surface delivery (S)
- **Package Type**: RTO

### 2. Admin Address Configuration
- **Pincode**: 201016
- **Location**: SuperSweets Store, Connaught Place, New Delhi
- **Coordinates**: 28.6139, 77.2090 (update with actual coordinates)

### 3. Code Changes Made

#### A. Updated `src/utils/delhivery.ts`
- Modified `estimateDeliveryPricing()` method to use correct API parameters
- Updated default weight to 2.5kg
- Changed API parameters to match your curl command exactly
- Added test functions for verification

#### B. Updated `src/pages/Checkout.tsx`
- Removed dynamic weight calculation from cart items
- Set fixed weight of 2.5kg for all deliveries
- Updated pickup pincode to 201016

#### C. Updated `supabase/functions/delhivery-proxy/index.ts`
- Added fallback API key for testing
- Maintained CORS handling for browser requests

#### D. Updated `src/hooks/useSettings.ts`
- Added `store_pincode` field to settings
- Set default store pincode to 201016

## Testing

### 1. Direct API Test
Use the provided `test-delhivery.js` script:
```bash
node test-delhivery.js
```

### 2. Browser Test
Open `test-delhivery.html` in your browser to test the API integration.

### 3. React App Test
The checkout process will automatically use the new API implementation when users enter their delivery address.

## Environment Variables

### Required in Supabase
Set this environment variable in your Supabase project:
```
DELHIVERY_API_KEY=db825db6ab6c44b3e809520915801f5dbc205d92
```

### Required in Frontend
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## API Response Format

The API returns delivery charges in the following format:
```json
[
  {
    "total_amount": 150.00,
    "shipping_charges": 120.00,
    "cod_charges": 30.00,
    "estimated_delivery_time": "2-3 business days",
    "serviceability": true
  }
]
```

## Integration Flow

1. **User enters delivery address** in checkout
2. **System extracts pincode** from address
3. **API call is made** to Delhivery with:
   - Origin: 201016 (admin address)
   - Destination: User's pincode
   - Weight: 2.5kg (fixed)
   - Service: Surface delivery
4. **Delivery charges are calculated** and displayed to user
5. **Charges are applied** to order total

## Error Handling

The implementation includes:
- Fallback pricing when API is unavailable
- Serviceability checking
- Graceful error handling with user-friendly messages
- Logging for debugging

## Next Steps

1. **Deploy the Supabase Edge Function** with the updated code
2. **Set the environment variable** in Supabase
3. **Test the integration** using the provided test scripts
4. **Update admin coordinates** in `PICKUP_LOCATION` with actual store location
5. **Verify delivery charges** are calculated correctly in the checkout process

## Troubleshooting

### Common Issues

1. **CORS Errors**: Use the Supabase proxy function for browser requests
2. **API Key Issues**: Ensure the API key is set correctly in environment variables
3. **Serviceability**: Some pincodes may not be serviceable by Delhivery
4. **Rate Limiting**: Implement caching for frequently requested routes

### Debug Information

Check browser console for detailed logging of:
- API requests and responses
- Parameter values being sent
- Error messages and stack traces

## Support

For issues with the Delhivery integration:
1. Check the browser console for error messages
2. Verify API credentials and environment variables
3. Test with the provided test scripts
4. Contact Delhivery support for API-related issues
