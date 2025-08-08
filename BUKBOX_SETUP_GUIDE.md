# BukBox Complete Setup Guide

## Overview

This guide provides a complete setup for the BukBox bulk shopping e-commerce platform. You can easily switch between different Supabase instances by simply updating the `.env` file credentials.

## Quick Setup

### 1. Environment Configuration

Update your `.env` file with your Supabase credentials:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps API Configuration (REQUIRED for address features)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Razorpay Configuration (REQUIRED for payments)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# Application Configuration
VITE_APP_NAME=BukBox
VITE_APP_URL=http://localhost:8080

# Porter API Configuration (OPTIONAL - for delivery tracking)
VITE_PORTER_API_KEY=your_porter_api_key_here
VITE_PORTER_BASE_URL=https://api.porter.in
```

### 2. Supabase Edge Functions Configuration

Update `supabase/.env` with your Razorpay secret key:

```env
# Razorpay Configuration for Edge Functions
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 3. Database Setup

Run the complete migration in your Supabase SQL Editor:

```sql
-- Copy and paste the entire content from:
-- supabase/migrations/20250208000000_bukbox_complete_migration.sql
```

This single migration file includes:
- ✅ Complete database schema
- ✅ Product features enhancement
- ✅ Storage buckets and policies
- ✅ All necessary functions and triggers
- ✅ Initial sample data
- ✅ Row Level Security policies

### 4. Deploy Edge Functions (Optional)

If you want payment processing:

```bash
# Deploy Razorpay functions
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
```

## Detailed Setup Instructions

### Prerequisites

1. **Supabase Project**: Create a new Supabase project
2. **Google Maps API**: Get API key from Google Cloud Console
3. **Razorpay Account**: Get API keys from Razorpay Dashboard
4. **Node.js**: Version 16 or higher

### Step-by-Step Setup

#### 1. Clone and Install

```bash
git clone <your-repo>
cd bukbox
npm install
```

#### 2. Configure Environment Variables

Create `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_or_live_key_id

# Application Configuration
VITE_APP_NAME=BukBox
VITE_APP_URL=http://localhost:8080
```

#### 3. Setup Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the entire content from `supabase/migrations/20250208000000_bukbox_complete_migration.sql`
4. Paste and run the migration

#### 4. Configure Storage

The migration automatically creates storage buckets:
- `product-images`: For product photos
- `category-images`: For category images
- `coupon-images`: For coupon graphics

#### 5. Setup Authentication

Supabase Auth is automatically configured. The first user to register will become an admin.

#### 6. Deploy Edge Functions (Optional)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
```

#### 7. Start Development Server

```bash
npm run dev
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key | `AIzaSyAtraEz-42cS37r4u0fYyiH_pb0K0jadL4` |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key ID | `rzp_test_1234567890` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_APP_NAME` | Application name | `BukBox` |
| `VITE_APP_URL` | Application URL | `http://localhost:8080` |
| `VITE_PORTER_API_KEY` | Porter delivery API key | Not used if empty |
| `VITE_PORTER_BASE_URL` | Porter API base URL | `https://api.porter.in` |

## Database Schema Overview

### Core Tables

1. **profiles** - User profiles and admin management
2. **categories** - Product categories for bulk items
3. **products** - Product catalog with enhanced features
4. **product_features** - Dynamic feature management
5. **orders** - Order management with payment integration
6. **addresses** - User address management
7. **coupons** - Discount and coupon system
8. **reviews** - Product review system

### Key Features

- ✅ **Row Level Security**: Secure data access
- ✅ **Dynamic Features**: Flexible product feature system
- ✅ **Bulk Shopping**: Optimized for bulk purchases
- ✅ **Payment Integration**: Razorpay payment processing
- ✅ **Image Storage**: Organized image management
- ✅ **Admin System**: Comprehensive admin panel

## Switching Supabase Instances

To switch to a different Supabase instance:

1. **Update Environment Variables**:
   ```env
   VITE_SUPABASE_URL=https://new-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=new-anon-key-here
   ```

2. **Run Migration on New Instance**:
   - Copy `supabase/migrations/20250208000000_bukbox_complete_migration.sql`
   - Run in new Supabase project's SQL Editor

3. **Deploy Edge Functions** (if needed):
   ```bash
   supabase link --project-ref new-project-ref
   supabase functions deploy create-razorpay-order
   supabase functions deploy verify-razorpay-payment
   ```

4. **Restart Development Server**:
   ```bash
   npm run dev
   ```

## Production Deployment

### Environment Setup

1. **Update Environment Variables** for production:
   ```env
   VITE_SUPABASE_URL=https://your-prod-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-prod-anon-key
   VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key
   VITE_APP_URL=https://your-domain.com
   ```

2. **Deploy to Production**:
   ```bash
   npm run build
   # Deploy dist folder to your hosting provider
   ```

### Security Checklist

- ✅ Use live Razorpay keys for production
- ✅ Enable RLS policies in Supabase
- ✅ Configure proper CORS settings
- ✅ Use HTTPS for all endpoints
- ✅ Secure API keys and secrets

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Verify Supabase URL and anon key
   - Check if migration ran successfully
   - Ensure RLS policies are enabled

2. **Payment Issues**:
   - Verify Razorpay keys are correct
   - Check if Edge Functions are deployed
   - Ensure webhook URLs are configured

3. **Image Upload Issues**:
   - Check storage bucket policies
   - Verify admin permissions
   - Ensure storage buckets exist

### Getting Help

1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure database migration completed successfully
4. Check Supabase logs for detailed error information

## Features Overview

### For Customers
- ✅ **Bulk Product Browsing**: Category-based product discovery
- ✅ **Advanced Search**: Filter by features, price, availability
- ✅ **Secure Checkout**: Razorpay payment integration
- ✅ **Order Tracking**: Real-time order status updates
- ✅ **Address Management**: Save multiple delivery addresses

### For Administrators
- ✅ **Product Management**: Add/edit products with dynamic features
- ✅ **Order Management**: Process and track orders
- ✅ **Customer Management**: View customer information and history
- ✅ **Analytics Dashboard**: Sales and performance insights
- ✅ **Coupon Management**: Create and manage discount codes

### Technical Features
- ✅ **Responsive Design**: Works on all devices
- ✅ **Real-time Updates**: Live data synchronization
- ✅ **Secure Authentication**: Supabase Auth integration
- ✅ **Image Management**: Organized file storage
- ✅ **Performance Optimized**: Fast loading and smooth UX

## Support

For technical support or questions:
1. Check this documentation first
2. Review error logs in browser console
3. Check Supabase project logs
4. Verify all environment variables are correctly set

## License

This project is proprietary software for BukBox bulk shopping platform.

---

**Ready to start bulk shopping with BukBox!** 🎉