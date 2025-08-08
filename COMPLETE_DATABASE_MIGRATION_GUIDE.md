# Complete BukBox Database Migration Guide

## Overview

This document provides a comprehensive guide to the complete BukBox database migration, which has been created after thorough analysis of all admin TypeScript files, product forms, and system requirements.

## Migration Analysis

### Files Analyzed

#### Admin Pages
- `src/pages/admin/Dashboard.tsx` - Dashboard metrics and top products
- `src/pages/admin/Analytics.tsx` - Sales analytics and reporting
- `src/pages/admin/BestSellers.tsx` - Bestseller tracking and metrics
- `src/pages/admin/Products.tsx` - Product management
- `src/pages/admin/ProductForm.tsx` - Product creation and editing
- `src/pages/admin/Categories.tsx` - Category management
- `src/pages/admin/CategoryForm.tsx` - Category creation and editing
- `src/pages/admin/Orders.tsx` - Order management
- `src/pages/admin/Customers.tsx` - Customer management
- `src/pages/admin/Coupons.tsx` - Coupon management
- `src/pages/admin/CouponForm.tsx` - Coupon creation and editing
- `src/pages/admin/CouponAssignment.tsx` - Product-coupon assignments
- `src/pages/admin/Settings.tsx` - System settings management

#### Core Application Files
- `src/pages/Checkout.tsx` - Order processing and payment
- `src/pages/ProductDetail.tsx` - Product display
- `src/integrations/supabase/client.ts` - Database client configuration

## Complete Database Schema

### Core Tables

#### 1. **profiles** - User Management
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

**Purpose**: Manages user profiles and admin permissions
**Key Features**:
- Links to Supabase Auth users
- Admin role management
- Profile information storage

#### 2. **categories** - Product Categories
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

**Purpose**: Organizes products into categories
**Key Features**:
- Category images support
- Active/inactive status
- Unique category names

#### 3. **products** - Product Catalog
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

**Purpose**: Complete product information storage
**Key Features**:
- Multiple product images
- Dynamic features system
- Nutritional/specification information
- Inventory tracking
- Marketing information

#### 4. **product_features** - Dynamic Feature Management
```sql
CREATE TABLE public.product_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Purpose**: Manages available product features
**Key Features**:
- Dynamic feature creation
- Reusable across products
- Admin-manageable feature library

#### 5. **product_sales** - Sales Tracking
```sql
CREATE TABLE public.product_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  order_id UUID REFERENCES orders(id),
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_revenue DECIMAL(10, 2) NOT NULL,
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Purpose**: Tracks individual product sales for analytics
**Key Features**:
- Automatic sales recording
- Revenue tracking
- Analytics data source

#### 6. **orders** - Order Management
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
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'placed',
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

**Purpose**: Complete order management system
**Key Features**:
- Guest and registered user orders
- Payment integration
- Delivery tracking
- Order status management

#### 7. **coupons** - Discount System
```sql
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
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

**Purpose**: Manages discount coupons
**Key Features**:
- Percentage and fixed discounts
- Usage limits and tracking
- Date-based validity

#### 8. **product_coupons** - Coupon Assignments
```sql
CREATE TABLE public.product_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, coupon_id)
);
```

**Purpose**: Links coupons to specific products
**Key Features**:
- Product-specific discounts
- Many-to-many relationship
- Unique constraints

#### 9. **addresses** - Address Management
```sql
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('home', 'work', 'other')),
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

**Purpose**: User address management
**Key Features**:
- Multiple address types
- GPS coordinates
- Default address selection

#### 10. **reviews** - Product Reviews
```sql
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Purpose**: Product review system
**Key Features**:
- 5-star rating system
- Verified purchase reviews
- Order-linked reviews

### Administrative Tables

#### 11. **settings** - System Configuration
```sql
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Purpose**: System-wide configuration management
**Key Features**:
- Key-value configuration storage
- Public/private settings
- Categorized settings

#### 12. **notifications** - User Notifications
```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Purpose**: User notification system
**Key Features**:
- Typed notifications
- Read/unread status
- Action links

#### 13. **activity_logs** - Admin Activity Tracking
```sql
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Purpose**: Tracks admin actions for audit trails
**Key Features**:
- Complete action logging
- Before/after value tracking
- IP and user agent logging

## Key Functions and Triggers

### 1. **Automatic Sales Tracking**
```sql
CREATE OR REPLACE FUNCTION public.track_product_sales()
RETURNS TRIGGER AS $$
DECLARE
  item JSONB;
BEGIN
  IF NEW.payment_status = 'paid' OR NEW.order_status = 'confirmed' THEN
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      INSERT INTO public.product_sales (
        product_id, order_id, quantity_sold, 
        unit_price, total_revenue, sale_date
      ) VALUES (
        (item->>'id')::UUID, NEW.id, (item->>'quantity')::INTEGER,
        (item->>'price')::DECIMAL, 
        (item->>'price')::DECIMAL * (item->>'quantity')::INTEGER,
        NEW.created_at
      );
      
      UPDATE public.products 
      SET stock_quantity = GREATEST(0, stock_quantity - (item->>'quantity')::INTEGER)
      WHERE id = (item->>'id')::UUID;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Purpose**: Automatically tracks sales and updates inventory
**Triggers**:
- On order insert
- On order status/payment update

### 2. **First User Admin Assignment**
```sql
CREATE OR REPLACE FUNCTION public.make_first_user_admin()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.profiles) = 0 THEN
    NEW.is_admin = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Purpose**: Makes the first registered user an admin

### 3. **New User Profile Creation**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 
             NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Purpose**: Automatically creates profile for new auth users

## Storage Buckets

### 1. **product-images**
- **Purpose**: Product photo storage
- **Access**: Public read, admin write
- **Usage**: Product galleries and thumbnails

### 2. **category-images**
- **Purpose**: Category banner images
- **Access**: Public read, admin write
- **Usage**: Category navigation and display

### 3. **coupon-images**
- **Purpose**: Coupon graphics and banners
- **Access**: Public read, admin write
- **Usage**: Promotional materials

## Row Level Security (RLS)

### Security Model
- **Public Access**: Product catalog, categories, active coupons
- **User Access**: Own orders, addresses, reviews, notifications
- **Admin Access**: All data with full CRUD permissions

### Key Policies
```sql
-- Products: Public can view active products
CREATE POLICY "products_select_active" ON public.products 
FOR SELECT USING (is_active = true);

-- Orders: Users can view own orders, admins can view all
CREATE POLICY "orders_select_own_or_admin" ON public.orders 
FOR SELECT USING ((auth.uid() = user_id) OR public.is_admin());

-- Settings: Public can view public settings
CREATE POLICY "settings_select_public" ON public.settings 
FOR SELECT USING (is_public = true);
```

## Performance Optimization

### Indexes
- **Product searches**: name, category, active status
- **Order queries**: user_id, order_number, status, date
- **Sales analytics**: product_id, sale_date
- **Category filtering**: category relationships
- **User data**: profile lookups, address queries

### Query Optimization
- **Composite indexes** for common filter combinations
- **Partial indexes** for active/inactive filtering
- **JSONB indexes** for product features and specifications

## Initial Data

### Default Categories
- Bulk Groceries
- Electronics
- Home Essentials
- Office Supplies
- Personal Care
- Cleaning Supplies

### Sample Products
- Bulk Rice - Premium Basmati (25kg)
- Bulk Cooking Oil - Refined (15L)
- Bulk LED Bulbs - 9W (Pack of 50)

### Default Features
- Bulk Pack, Wholesale Price, Commercial Grade
- Energy Efficient, Eco Friendly, Premium Quality
- Fast Delivery, Restaurant Grade, Quality Certified
- And 20+ more features

### System Settings
- Store information (name, description, contact)
- Business settings (currency, tax, delivery)
- Notification preferences
- Display settings

## Migration Benefits

### For Developers
- **Complete Schema**: All tables and relationships defined
- **Environment Variables**: Secure configuration management
- **Type Safety**: Proper data types and constraints
- **Performance**: Optimized indexes and queries

### For Business
- **Scalability**: Designed for growth
- **Analytics**: Comprehensive sales tracking
- **Flexibility**: Dynamic features and settings
- **Security**: Proper access controls

### For Administrators
- **Real Data**: Dynamic calculations from actual sales
- **Inventory Management**: Automatic stock updates
- **User Management**: Complete admin capabilities
- **System Control**: Configurable settings

## Deployment Instructions

### 1. Environment Setup
```env
# Update .env file
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Run Migration
1. Copy entire content from `supabase/migrations/20250208000000_bukbox_complete_migration.sql`
2. Paste in Supabase SQL Editor
3. Execute the migration

### 3. Verify Installation
- Check all tables are created
- Verify RLS policies are active
- Confirm storage buckets exist
- Test admin user creation

### 4. Post-Migration
- First user becomes admin automatically
- Sample data is available for testing
- All admin features are functional
- Sales tracking is active

## Maintenance

### Regular Tasks
- Monitor query performance
- Update indexes as needed
- Clean up old activity logs
- Backup critical data

### Scaling Considerations
- Add read replicas for analytics
- Implement caching for frequently accessed data
- Consider partitioning for large tables
- Monitor storage bucket usage

This migration provides a complete, production-ready database schema for the BukBox bulk shopping platform with all necessary features for a comprehensive e-commerce solution.