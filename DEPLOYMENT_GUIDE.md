# 🚀 Deployment Guide - Delhivery API Integration

## Step 1: Set Environment Variable in Supabase

### Method A: Using Supabase Dashboard (Recommended)
1. **Go to your Supabase project dashboard**: https://supabase.com/dashboard
2. **Navigate to**: Settings → Configuration → Environment Variables
3. **Add a new environment variable**:
   - **Name**: `DELHIVERY_API_KEY`
   - **Value**: `db825db6ab6c44b3e809520915801f5dbc205d92`
   - **Description**: Delhivery API Key for delivery pricing

### Method B: Using Supabase CLI (Alternative)
If you have Supabase CLI access, run:
```bash
cd /Users/pulkitkhatter/hello/sweetsshop
supabase login  # Follow the browser authentication
supabase secrets set DELHIVERY_API_KEY=db825db6ab6c44b3e809520915801f5dbc205d92
```

## Step 2: Deploy the Updated Edge Function

### Method A: Using Supabase Dashboard
1. **Go to**: Functions → Create new function
2. **Function name**: `delhivery-proxy`
3. **Copy the code** from `supabase/functions/delhivery-proxy/index.ts`
4. **Deploy the function**

### Method B: Using Supabase CLI
```bash
cd /Users/pulkitkhatter/hello/sweetsshop
supabase functions deploy delhivery-proxy
```

## Step 3: Test the Deployment

### Test Script
Run the test script to verify everything works:
```bash
cd /Users/pulkitkhatter/hello/sweetsshop
node test-delhivery.js
```

### Browser Test
1. Open `test-delhivery.html` in your browser
2. Update the Supabase URL and anon key in the script
3. Click "Test Supabase Proxy"

### React App Test
1. Start your development server: `npm run dev`
2. Go to checkout with items in cart
3. Enter a delivery address
4. Check browser console for API calls and responses

## Step 4: Verify Integration

### Check These Points:
- ✅ Environment variable is set in Supabase
- ✅ Edge function is deployed and running
- ✅ API returns delivery charges correctly
- ✅ Checkout process shows calculated delivery fees
- ✅ No CORS errors in browser console

## Troubleshooting

### Common Issues:

1. **Environment Variable Not Set**
   - Error: "DELHIVERY_API_KEY not configured"
   - Solution: Set the environment variable in Supabase dashboard

2. **Function Not Deployed**
   - Error: 404 when calling the proxy
   - Solution: Deploy the Edge function

3. **CORS Issues**
   - Error: CORS policy blocks request
   - Solution: Ensure you're using the Supabase proxy, not direct API calls

4. **API Key Issues**
   - Error: 401 Unauthorized
   - Solution: Verify API key is correct and active

### Debug Commands:
```bash
# Check function status
supabase functions list

# View function logs
supabase functions logs delhivery-proxy

# Test function locally
supabase functions serve delhivery-proxy
```

## Expected Results

After successful deployment, you should see:

1. **API Response Format**:
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

2. **Checkout Process**:
- User enters delivery address
- System calculates delivery fee automatically
- Fee is displayed in order summary
- Total is updated with delivery charges

3. **Console Logs**:
- Successful API calls to Delhivery
- Delivery charges calculated
- No error messages

## Next Steps After Deployment

1. **Update Store Coordinates**: Replace placeholder coordinates in `PICKUP_LOCATION` with your actual store location
2. **Test with Real Addresses**: Try different pincodes to ensure serviceability
3. **Monitor Performance**: Check function logs for any issues
4. **Set Up Monitoring**: Consider adding alerts for API failures

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Test the API directly using the provided test scripts
4. Check Supabase function logs for server-side errors
