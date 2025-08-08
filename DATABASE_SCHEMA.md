# BukBox Database Schema Documentation

## Overview
This document describes the complete database schema for **BukBox** - a comprehensive bulk shopping e-commerce platform. The database is designed to handle bulk orders, wholesale pricing, multi-category products, and business-to-business transactions.

## Database Technology
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for images
- **Real-time**: Supabase Realtime for live updates

## Core Tables

### 1. profiles
User profile information with admin role management.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Key Features:**
- Links to Supabase Auth users
- Admin role management
- First user automatically becomes admin

### 2. categories
Product categories for bulk shopping (Groceries, Electronics, Home Essentials, etc.)

```sql
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Default Categories:**
- Bulk Groceries
- Electronics
- Home Essentials
- Office Supplies
- Personal Care
- Cleaning Supplies

### 3. products
Bulk products across all categories with wholesale pricing.

```sql
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  weight TEXT,
  pieces TEXT,
  serves INTEGER,
  category_id UUID REFERENCES categories(id),
  images TEXT[] DEFAULT '{}',
  nutritional_info JSONB,
  features JSONB DEFAULT '{}',
  storage_instructions TEXT,
  marketing_info JSONB,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Key Features:**
- Supports bulk quantities (weight, pieces, serves)
- JSONB fields for flexible product attributes
- Image arrays for multiple product photos
- Stock management
- Bestseller flagging

### 4. coupons
Discount coupons for bulk orders and wholesale customers.

```sql
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Features:**
- Percentage or fixed amount discounts
- Minimum order requirements
- Usage limits and tracking
- Time-based validity

### 5. product_coupons
Junction table linking products to specific coupons.

```sql
CREATE TABLE public.product_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, coupon_id)
);
```

### 6. orders
Complete order management for bulk purchases.

```sql
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  order_number TEXT NOT NULL UNIQUE,
  customer_info JSONB NOT NULL,
  delivery_location JSONB NOT NULL,
  address_details JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  order_status TEXT DEFAULT 'placed',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  courier_name TEXT,
  courier_phone TEXT,
  tracking_url TEXT,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  special_instructions TEXT,
  coupon_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Key Features:**
- JSONB fields for flexible order data
- Payment integration (Razorpay)
- Delivery tracking (Porter API)
- Order status management
- Coupon application

### 7. reviews
Product reviews and ratings system.

```sql
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 8. addresses
User delivery addresses management.

```sql
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('home', 'work', 'other')),
  name TEXT NOT NULL,
  phone TEXT,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Security & Permissions

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:

- **Public Access**: Categories, Products (active only), Reviews
- **User Access**: Own profiles, addresses, orders
- **Admin Access**: Full access to all tables
- **Guest Access**: Can create orders, view public data

### Key Security Functions

```sql
-- Check if current user is admin (prevents RLS recursion)
CREATE FUNCTION public.is_admin() RETURNS BOOLEAN;

-- Handle new user registration
CREATE FUNCTION public.handle_new_user() RETURNS TRIGGER;

-- Make first user admin automatically
CREATE FUNCTION public.make_first_user_admin() RETURNS TRIGGER;
```

## Storage Buckets

### Image Storage
- `product-images`: Product photos and galleries
- `category-images`: Category thumbnails and banners
- `coupon-images`: Coupon graphics and promotional images

**Storage Policies:**
- Public read access for all image buckets
- Admin-only write/update/delete access

## Indexes for Performance

### Critical Indexes
```sql
-- Products
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_bestseller ON products(is_bestseller);
CREATE INDEX idx_products_is_active ON products(is_active);

-- Orders
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_status ON orders(order_status);

-- Reviews
CREATE INDEX idx_reviews_product_id ON reviews(product_id);

-- Addresses
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
```

## Initial Data

### Default Categories
The migration includes 6 default categories suitable for bulk shopping:
1. **Bulk Groceries** - Essential groceries in bulk quantities
2. **Electronics** - Electronic items for businesses and resellers
3. **Home Essentials** - Home and kitchen essentials in bulk
4. **Office Supplies** - Office and business supplies
5. **Personal Care** - Personal care products in bulk
6. **Cleaning Supplies** - Cleaning and maintenance supplies

### Sample Products
- Bulk Rice - Premium Basmati (25kg)
- Bulk Cooking Oil - Refined (15L)
- Bulk LED Bulbs - 9W (Pack of 50)

### Sample Coupons
- `BULK50` - ₹50 off on orders above ₹2000
- `WHOLESALE10` - 10% off on orders above ₹5000
- `NEWBULK` - 15% off for new bulk customers

## API Integration

### Payment Gateway
- **Razorpay**: For processing bulk order payments
- Function: `create_real_razorpay_order()`

### Delivery Management
- **Internal delivery tracking**: Managed through order status updates
- **Courier information**: Stored in orders table for tracking

### Maps Integration
- **Google Maps**: For address validation and delivery tracking
- Latitude/longitude storage in addresses table

## Migration Usage

### Running the Migration
```bash
# Apply the complete migration
supabase db push

# Or apply specific migration file
supabase migration up --file 20250208000000_bukbox_complete_migration.sql
```

### Rollback Strategy
The migration is designed to be idempotent and includes:
- `IF NOT EXISTS` clauses for table creation
- `ON CONFLICT DO NOTHING` for data insertion
- Proper foreign key constraints with CASCADE options

## Monitoring & Maintenance

### Key Metrics to Monitor
1. **Order Volume**: Track bulk order patterns
2. **Product Performance**: Monitor bestsellers and stock levels
3. **User Growth**: Track admin vs regular user ratios
4. **Coupon Usage**: Monitor discount effectiveness
5. **Storage Usage**: Track image storage consumption

### Regular Maintenance Tasks
1. Clean up expired coupons
2. Archive old orders (>1 year)
3. Optimize indexes based on query patterns
4. Monitor storage bucket usage
5. Review and update RLS policies

## Conclusion

This database schema provides a robust foundation for BukBox's bulk shopping platform, supporting:
- Multi-category bulk products
- Wholesale pricing and discounts
- Business and individual customers
- Comprehensive order management
- Secure admin controls
- Scalable architecture

The schema is designed to handle high-volume bulk orders while maintaining data integrity and security through PostgreSQL's advanced features and Supabase's authentication system.