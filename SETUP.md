# Meat Feast - Setup Instructions

## Environment Configuration

### 1. Copy Environment File

```bash
cp .env.example .env
```

### 2. Add API Keys

Edit the `.env` file and add your API keys:

```env
# Google Maps API Configuration
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
VITE_RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# Application Configuration
VITE_APP_NAME=Meat Feast
VITE_APP_URL=http://localhost:8080
```

## API Keys Setup

### Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Add the API key to your `.env` file

### Razorpay API Keys

1. Sign up at [Razorpay](https://razorpay.com/)
2. Go to Dashboard → Settings → API Keys
3. Generate Test/Live API keys
4. Add Key ID and Key Secret to your `.env` file

## Features Implemented

### ✅ Enhanced Checkout Flow (5-Step Process)
- **Step 1**: Contact Information (Name, Email, Phone)
- **Step 2**: Delivery Location with Google Maps
- **Step 3**: Complete Address Details (Plot, Building, Street, Landmark, Pincode)
- **Step 4**: Payment Method Selection (COD or Pay Online)
- **Step 5**: Comprehensive Order Summary & Confirmation

### ✅ Google Maps Integration
- Interactive map with location picker
- Autocomplete search functionality
- Current location detection
- Saved addresses support
- Zomato-style UI design

### ✅ Razorpay Payment Integration
- Secure online payments
- Support for cards, UPI, net banking, wallets
- Real order creation and payment processing
- Cash on Delivery option

### ✅ UI Enhancements
- Modern Zomato-style design
- Enhanced input fields with icons
- Improved checkout flow
- Better user experience
- Responsive design

## Usage Instructions

1. **Contact Information**: Fill in your name, email, and phone number
2. **Location Selection**:
   - Use the search bar to find your location
   - Click "Use current location" for automatic detection
   - Select from saved addresses
   - Drag the map marker to adjust location
3. **Address Details**: Complete your delivery address with:
   - Plot/House number (required)
   - Building/Society name (optional)
   - Street/Area (required)
   - Nearby landmark (optional)
   - Pincode (required)
   - Save address as Home/Work/Other
4. **Payment Method**: Choose between Cash on Delivery or Pay Online
5. **Order Summary**: Review complete order details including:
   - Personal information
   - Complete delivery address
   - All order items with pricing
   - Payment method and bill breakdown
   - Final confirmation and payment

## Testing

- For testing payments, use Razorpay test keys
- Google Maps requires a valid API key with enabled services
- Location services need user permission for current location detection

## Notes

- All pricing is in Indian Rupees (₹)
- Environment variables are required for full functionality
- The application is optimized for Indian market
- Delivery areas can be configured based on location coordinates
