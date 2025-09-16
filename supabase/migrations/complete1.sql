-- =====================================================
-- DARE TO DIET COMPLETE DATABASE MIGRATION
-- =====================================================
-- This migration creates the complete database schema for Dare To Diet
-- A comprehensive bulk shopping e-commerce platform
-- 
-- Version: 3.0 (Complete Analysis-Based Migration)
-- Date: 2025-02-08
-- 
-- This migration is based on comprehensive analysis of:
-- - All admin TypeScript files
-- - Product form requirements
-- - Sales tracking needs
-- - Complete feature requirements
-- 
-- This single migration file contains:
-- 1. Complete database schema with all tables
-- 2. Product features enhancement system
-- 3. Sales tracking and inventory management
-- 4. Storage buckets and policies
-- 5. All necessary functions and triggers
-- 6. Row Level Security policies
-- 7. Performance indexes
-- 8. Initial sample data
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Categories Table (for bulk product categories)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Products Table (bulk products across all categories)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  weight TEXT,
  pieces TEXT,
  serves INTEGER,
  category_id UUID REFERENCES public.categories(id),
  images TEXT[] DEFAULT '{}',
  nutritional_info JSONB,
  features JSONB DEFAULT '{}',
  storage_instructions TEXT,
  marketing_info JSONB,
  is_bestseller BOOLEAN DEFAULT FALSE,
  new_arrival BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Product Coupons Junction Table
CREATE TABLE IF NOT EXISTS public.product_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, coupon_id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  order_number TEXT NOT NULL UNIQUE,
  customer_info JSONB NOT NULL,
  delivery_location JSONB NOT NULL,
  address_details JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cod_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Addresses Table
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
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

-- Product Sales Tracking Table
CREATE TABLE IF NOT EXISTS public.product_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_revenue DECIMAL(10, 2) NOT NULL,
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Product Features Table
CREATE TABLE IF NOT EXISTS public.product_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Settings Table for Admin Configuration
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activity Logs Table for Admin Tracking
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- UTILITY FUNCTIONS (Create after tables are created)
-- =====================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to check if current user is admin (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';

-- Function to generate order receipts
CREATE OR REPLACE FUNCTION generate_order_receipt()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  receipt_id TEXT;
BEGIN
  -- Generate unique receipt ID for Razorpay
  receipt_id := 'BULKBUYSTORE_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 8);
  
  RETURN receipt_id;
END;
$$;

-- Function to make first user admin
CREATE OR REPLACE FUNCTION public.make_first_user_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is the first profile being created, make them admin
  IF (SELECT COUNT(*) FROM public.profiles) = 0 THEN
    NEW.is_admin = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to track product sales when orders are placed
CREATE OR REPLACE FUNCTION public.track_product_sales()
RETURNS TRIGGER AS $$
DECLARE
  item JSONB;
BEGIN
  -- Only track sales for paid/confirmed orders
  IF NEW.payment_status = 'paid' OR NEW.order_status = 'confirmed' THEN
    -- Loop through each item in the order
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      -- Insert sales record for each product
      INSERT INTO public.product_sales (
        product_id,
        order_id,
        quantity_sold,
        unit_price,
        total_revenue,
        sale_date
      ) VALUES (
        (item->>'id')::UUID,
        NEW.id,
        (item->>'quantity')::INTEGER,
        (item->>'price')::DECIMAL,
        (item->>'price')::DECIMAL * (item->>'quantity')::INTEGER,
        NEW.created_at
      );
      
      -- Update product stock quantity
      UPDATE public.products 
      SET stock_quantity = GREATEST(0, stock_quantity - (item->>'quantity')::INTEGER)
      WHERE id = (item->>'id')::UUID;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Profiles Policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT USING (public.is_admin());

-- Categories Policies
CREATE POLICY "categories_select_active" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "categories_all_admin" ON public.categories FOR ALL USING (public.is_admin());

-- Products Policies
CREATE POLICY "products_select_active" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "products_all_admin" ON public.products FOR ALL USING (public.is_admin());

-- Coupons Policies
CREATE POLICY "coupons_select_active" ON public.coupons FOR SELECT 
USING ((is_active = true) AND (valid_from <= now()) AND ((valid_until IS NULL) OR (valid_until >= now())));
CREATE POLICY "coupons_all_admin" ON public.coupons FOR ALL USING (public.is_admin());

-- Product Coupons Policies
CREATE POLICY "product_coupons_select_all" ON public.product_coupons FOR SELECT USING (true);
CREATE POLICY "product_coupons_all_admin" ON public.product_coupons FOR ALL USING (public.is_admin());

-- Orders Policies
CREATE POLICY "orders_select_own_or_admin" ON public.orders FOR SELECT 
USING ((auth.uid() = user_id) OR (user_id IS NULL) OR public.is_admin());
CREATE POLICY "orders_insert_anyone" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update_admin" ON public.orders FOR UPDATE USING (public.is_admin());
CREATE POLICY "orders_all_admin" ON public.orders FOR ALL USING (public.is_admin());

-- Reviews Policies
CREATE POLICY "reviews_select_all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_all_admin" ON public.reviews FOR ALL USING (public.is_admin());

-- Addresses Policies
CREATE POLICY "addresses_all_own" ON public.addresses FOR ALL USING (auth.uid() = user_id);

-- Product Sales Policies
CREATE POLICY "product_sales_select_all" ON public.product_sales FOR SELECT USING (true);
CREATE POLICY "product_sales_all_admin" ON public.product_sales FOR ALL USING (public.is_admin());

-- Product Features Policies
CREATE POLICY "product_features_select_active" ON public.product_features FOR SELECT 
USING (is_active = true);
CREATE POLICY "product_features_all_admin" ON public.product_features FOR ALL 
USING (public.is_admin());

-- Settings Policies
CREATE POLICY "settings_select_public" ON public.settings FOR SELECT 
USING (is_public = true);
CREATE POLICY "settings_all_admin" ON public.settings FOR ALL 
USING (public.is_admin());

-- Notifications Policies
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);
CREATE POLICY "notifications_all_admin" ON public.notifications FOR ALL 
USING (public.is_admin());

-- Activity Logs Policies
CREATE POLICY "activity_logs_select_admin" ON public.activity_logs FOR SELECT 
USING (public.is_admin());
CREATE POLICY "activity_logs_insert_authenticated" ON public.activity_logs FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_features_updated_at
  BEFORE UPDATE ON public.product_features
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User signup trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- First user admin trigger
CREATE TRIGGER set_first_user_admin
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.make_first_user_admin();

-- Product sales tracking trigger
CREATE TRIGGER track_sales_on_order_insert
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.track_product_sales();

CREATE TRIGGER track_sales_on_order_update
  AFTER UPDATE ON public.orders
  FOR EACH ROW 
  WHEN (OLD.payment_status != NEW.payment_status OR OLD.order_status != NEW.order_status)
  EXECUTE FUNCTION public.track_product_sales();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_bestseller ON public.products(is_bestseller) WHERE is_bestseller = true;
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON public.products(new_arrival) WHERE new_arrival = true;
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);

-- Addresses indexes
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON public.addresses(is_default) WHERE is_default = true;

-- Product sales indexes
CREATE INDEX IF NOT EXISTS idx_product_sales_product_id ON public.product_sales(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sales_order_id ON public.product_sales(order_id);
CREATE INDEX IF NOT EXISTS idx_product_sales_sale_date ON public.product_sales(sale_date DESC);

-- Product coupons indexes
CREATE INDEX IF NOT EXISTS idx_product_coupons_product_id ON public.product_coupons(product_id);
CREATE INDEX IF NOT EXISTS idx_product_coupons_coupon_id ON public.product_coupons(coupon_id);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Product features indexes
CREATE INDEX IF NOT EXISTS idx_product_features_is_active ON public.product_features(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_product_features_name ON public.product_features(name);

-- Settings indexes
CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON public.settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_is_public ON public.settings(is_public) WHERE is_public = true;

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- =====================================================
-- STORAGE BUCKETS AND POLICIES
-- =====================================================

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('product-images', 'product-images', true),
  ('category-images', 'category-images', true),
  ('coupon-images', 'coupon-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');
CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND public.is_admin());
CREATE POLICY "Admins can update product images" ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-images' AND public.is_admin());
CREATE POLICY "Admins can delete product images" ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images' AND public.is_admin());

-- Storage policies for category images
CREATE POLICY "Anyone can view category images" ON storage.objects FOR SELECT 
USING (bucket_id = 'category-images');
CREATE POLICY "Admins can upload category images" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'category-images' AND public.is_admin());
CREATE POLICY "Admins can update category images" ON storage.objects FOR UPDATE 
USING (bucket_id = 'category-images' AND public.is_admin());
CREATE POLICY "Admins can delete category images" ON storage.objects FOR DELETE 
USING (bucket_id = 'category-images' AND public.is_admin());

-- Storage policies for coupon images
CREATE POLICY "Anyone can view coupon images" ON storage.objects FOR SELECT 
USING (bucket_id = 'coupon-images');
CREATE POLICY "Admins can upload coupon images" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'coupon-images' AND public.is_admin());
CREATE POLICY "Admins can update coupon images" ON storage.objects FOR UPDATE 
USING (bucket_id = 'coupon-images' AND public.is_admin());
CREATE POLICY "Admins can delete coupon images" ON storage.objects FOR DELETE 
USING (bucket_id = 'coupon-images' AND public.is_admin());

-- =====================================================
-- INITIAL DATA FOR BULKBUYSTORE
-- =====================================================

-- Insert default categories for bulk shopping with images
INSERT INTO public.categories (id, name, description, image_url, is_active) VALUES
  (gen_random_uuid(), 'Bulk Groceries', 'Essential groceries in bulk quantities at wholesale prices', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800', true),
  (gen_random_uuid(), 'Electronics', 'Electronic items and gadgets in bulk for businesses and resellers', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800', true),
  (gen_random_uuid(), 'Home Essentials', 'Home and kitchen essentials in bulk quantities', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', true),
  (gen_random_uuid(), 'Office Supplies', 'Office and business supplies in bulk for corporate customers', 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800', true),
  (gen_random_uuid(), 'Personal Care', 'Personal care and hygiene products in bulk', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800', true),
  (gen_random_uuid(), 'Cleaning Supplies', 'Cleaning and maintenance supplies in bulk quantities', 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default features for bulk products
INSERT INTO public.product_features (name, description, is_active) VALUES
  ('Bulk Pack', 'Available in bulk quantities', true),
  ('Wholesale Price', 'Wholesale pricing available', true),
  ('Commercial Grade', 'Suitable for commercial use', true),
  ('Energy Efficient', 'Energy efficient product', true),
  ('Eco Friendly', 'Environmentally friendly', true),
  ('Premium Quality', 'Premium quality materials', true),
  ('Fast Delivery', 'Fast delivery available', true),
  ('Bulk Discount Available', 'Bulk discounts offered', true),
  ('Restaurant Grade', 'Suitable for restaurant use', true),
  ('Long Shelf Life', 'Extended shelf life', true),
  ('Temperature Controlled', 'Temperature controlled storage', true),
  ('Quality Certified', 'Quality certified product', true),
  ('Hygienically Packed', 'Hygienically packed', true),
  ('Antibiotic Free', 'Free from antibiotics', true),
  ('Organic', 'Organic certified', true),
  ('Gluten Free', 'Gluten free product', true),
  ('Vegan', 'Vegan friendly', true),
  ('Non-GMO', 'Non-GMO product', true),
  ('Recyclable Packaging', 'Recyclable packaging used', true),
  ('Made in India', 'Made in India', true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample bulk products with images and complete data
INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Bulk Rice - Premium Basmati (25kg)', 
  'Premium quality basmati rice in 25kg bulk pack. Perfect for restaurants, hotels, and large families. Sourced directly from Punjab farms.',
  2499.00,
  2999.00,
  '25kg',
  c.id,
  '["Bulk Pack", "Wholesale Price", "Restaurant Grade", "Premium Quality", "Made in India", "Organic"]'::jsonb,
  true,
  true,
  100,
  'BULK-RICE-25KG',
  '{"material": "Premium Basmati Rice", "origin": "Punjab, India", "brand": "Dare To Diet Premium", "certification": "FSSAI Approved", "weight_per_unit": "25kg", "dimensions": "45x30x15 cm"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800'],
  'Store in a cool, dry place away from direct sunlight. Keep in airtight container after opening.',
  '{"marketedBy": "Dare To Diet Premium Foods Pvt Ltd", "address": "Shop number 5, Patel Nagar, Hansi road", "city": "JIND", "state": "Haryana", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Bulk Groceries'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Bulk Cooking Oil - Refined Sunflower (15L)', 
  'High-quality refined sunflower cooking oil in 15L bulk container. Ideal for commercial kitchens, restaurants, and large families.',
  1899.00,
  2199.00,
  '15L',
  c.id,
  '["Bulk Pack", "Commercial Grade", "Long Shelf Life", "Premium Quality", "Heart Healthy", "Cholesterol Free"]'::jsonb,
  true,
  false,
  75,
  'BULK-OIL-15L',
  '{"material": "Refined Sunflower Oil", "origin": "India", "brand": "Dare To Diet Commercial", "certification": "FSSAI Approved", "weight_per_unit": "15L", "dimensions": "25x25x35 cm"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800', 'https://images.unsplash.com/photo-1615485925763-4d5b8c2b2c1e?w=800'],
  'Store in cool, dry place. Avoid direct sunlight. Use within 12 months of opening.',
  '{"marketedBy": "Dare To Diet Oils & Edibles Ltd", "address": "Shop number 5, Patel Nagar, Hansi road", "city": "JIND", "state": "Haryana", "fssaiLicense": "98765432109876"}'::jsonb
FROM public.categories c WHERE c.name = 'Bulk Groceries'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, pieces, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Bulk LED Bulbs - 9W Cool White (Pack of 50)', 
  'Energy-efficient 9W LED bulbs in bulk pack of 50. Perfect for offices, commercial spaces, and bulk lighting projects. 2-year warranty included.',
  2999.00,
  3999.00,
  '50 pieces',
  c.id,
  '["Energy Efficient", "Bulk Pack", "Bulk Discount Available", "Premium Quality", "Long Lasting", "Eco Friendly"]'::jsonb,
  false,
  true,
  50,
  'BULK-LED-50PC',
  '{"material": "LED with Aluminum Heat Sink", "dimensions": "Standard E27 Base", "warranty": "2 years", "certification": "BIS Approved", "weight_per_unit": "50g per bulb", "brand": "Dare To Diet Electronics"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800'],
  'Store in original packaging until use. Avoid moisture and extreme temperatures.',
  '{"marketedBy": "Dare To Diet Electronics Pvt Ltd", "address": "Shop number 5, Patel Nagar, Hansi road", "city": "JIND", "state": "Haryana", "fssaiLicense": null}'::jsonb
FROM public.categories c WHERE c.name = 'Electronics'
ON CONFLICT (sku) DO NOTHING;

-- Insert more sample products for better demo
INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Bulk Wheat Flour - Whole Grain (20kg)', 
  'Fresh whole grain wheat flour in 20kg bulk pack. Stone ground for maximum nutrition. Perfect for bakeries and large families.',
  1299.00,
  1599.00,
  '20kg',
  c.id,
  '["Bulk Pack", "Wholesale Price", "Organic", "Stone Ground", "Premium Quality", "Made in India"]'::jsonb,
  false,
  false,
  80,
  'BULK-FLOUR-20KG',
  '{"material": "Whole Wheat Flour", "origin": "Rajasthan, India", "brand": "Dare To Diet Naturals", "certification": "Organic Certified", "weight_per_unit": "20kg"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800'],
  'Store in airtight container in cool, dry place. Use within 6 months for best quality.',
  '{"marketedBy": "Dare To Diet Naturals Pvt Ltd", "address": "Shop number 5, Patel Nagar, Hansi road", "city": "JIND", "state": "Haryana", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Bulk Groceries'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, pieces, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Bulk Office Pens - Blue Ink (Pack of 100)', 
  'High-quality ballpoint pens with smooth blue ink. Bulk pack of 100 pieces ideal for offices, schools, and institutions.',
  899.00,
  1199.00,
  '100 pieces',
  c.id,
  '["Bulk Pack", "Commercial Grade", "Bulk Discount Available", "Premium Quality", "Smooth Writing"]'::jsonb,
  false,
  false,
  120,
  'BULK-PENS-100PC',
  '{"material": "Plastic with Metal Tip", "brand": "Dare To Diet Stationery", "warranty": "6 months", "dimensions": "14cm length"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800'],
  'Store in dry place at room temperature. Keep away from direct sunlight.',
  '{"marketedBy": "Dare To Diet Stationery Pvt Ltd", "address": "Shop number 5, Patel Nagar, Hansi road", "city": "JIND", "state": "Haryana", "fssaiLicense": null}'::jsonb
FROM public.categories c WHERE c.name = 'Office Supplies'
ON CONFLICT (sku) DO NOTHING;

-- Insert sample coupons for bulk orders
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_amount, is_active, valid_until) VALUES
  ('WEEKEND25', 'Get 25% off on all categories - Weekend Special!', 'percentage', 25.00, 1000.00, true, now() + interval '7 days'),
  ('BULK50', 'Get ₹50 off on bulk orders above ₹2000', 'fixed', 50.00, 2000.00, true, now() + interval '30 days'),
  ('WHOLESALE10', 'Get 10% off on wholesale orders above ₹5000', 'percentage', 10.00, 5000.00, true, now() + interval '60 days'),
  ('NEWBULK', 'Special 15% discount for new bulk customers', 'percentage', 15.00, 1000.00, true, now() + interval '90 days'),
  ('MEGA20', 'Mega Sale - 20% off on orders above ₹3000', 'percentage', 20.00, 3000.00, true, now() + interval '14 days'),
  ('SAVE100', 'Save ₹100 on orders above ₹2500', 'fixed', 100.00, 2500.00, true, now() + interval '21 days'),
  ('FIRSTBUY', 'First time buyer special - 30% off', 'percentage', 30.00, 500.00, true, now() + interval '45 days')
ON CONFLICT (code) DO NOTHING;

-- Insert additional new arrival products
INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Bulk Organic Quinoa - Premium Grade (10kg)', 
  'Premium organic quinoa in 10kg bulk pack. Superfood packed with protein and nutrients. Perfect for health-conscious bulk buyers.',
  3499.00,
  3999.00,
  '10kg',
  c.id,
  '["Bulk Pack", "Organic", "Premium Quality", "Superfood", "High Protein", "Gluten Free"]'::jsonb,
  false,
  true,
  45,
  'BULK-QUINOA-10KG',
  '{"material": "Organic Quinoa", "origin": "Bolivia", "brand": "Dare To Diet Organic", "certification": "Organic Certified", "weight_per_unit": "10kg"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', 'https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?w=800'],
  'Store in airtight container in cool, dry place. Use within 12 months.',
  '{"marketedBy": "Dare To Diet Organic Foods Pvt Ltd", "address": "Shop number 5, Patel Nagar, Hansi road", "city": "JIND", "state": "Haryana", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Bulk Groceries'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, pieces, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Bulk Wireless Mouse - Optical (Pack of 25)', 
  'High-precision wireless optical mouse in bulk pack of 25. Perfect for offices, computer labs, and bulk IT purchases.',
  1999.00,
  2499.00,
  '25 pieces',
  c.id,
  '["Bulk Pack", "Wireless", "High Precision", "Commercial Grade", "Bulk Discount Available"]'::jsonb,
  false,
  true,
  60,
  'BULK-MOUSE-25PC',
  '{"material": "Plastic with Optical Sensor", "brand": "Dare To Diet Tech", "warranty": "1 year", "dimensions": "11x6x3 cm", "connectivity": "2.4GHz Wireless"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'],
  'Store in original packaging. Keep away from moisture and extreme temperatures.',
  '{"marketedBy": "Dare To Diet Electronics Pvt Ltd", "address": "Shop number 5, Patel Nagar, Hansi road", "city": "JIND", "state": "Haryana", "fssaiLicense": null}'::jsonb
FROM public.categories c WHERE c.name = 'Electronics'
ON CONFLICT (sku) DO NOTHING;

-- =====================================================
-- INITIAL SETTINGS DATA
-- =====================================================

-- Insert comprehensive default settings
INSERT INTO public.settings (key, value, description, category, is_public) VALUES
  -- General Store Settings
  ('store_name', '"Dare To Diet"', 'Store name displayed to customers', 'general', true),
  ('store_description', '"Your ultimate bulk shopping destination with wholesale prices on everything you need"', 'Store description', 'general', true),
  ('store_email', '"contact@daretodiet.fit"', 'Store contact email', 'general', true),
  ('store_phone', '"+91 9996616153"', 'Store contact phone', 'general', true),
  ('store_address', '"Shop number 5, Patel Nagar, Hansi road, Patiala chowk, JIND (Haryana) 126102, Near police station"', 'Store address', 'general', true),
  ('store_logo', '"https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200"', 'Store logo URL', 'general', true),
  
  -- Business Settings
  ('currency', '"INR"', 'Default currency', 'business', true),
  ('currency_symbol', '"₹"', 'Currency symbol', 'business', true),
  ('tax_rate', '18', 'Tax rate percentage (GST)', 'business', true),
  ('delivery_charge', '50', 'Standard delivery charge in rupees', 'business', true),
  ('free_delivery_threshold', '1000', 'Minimum order amount for free delivery', 'business', true),
  ('max_delivery_distance', '25', 'Maximum delivery distance in kilometers', 'business', false),
  ('cod_charge', '25', 'Cash on Delivery charge', 'business', true),
  ('cod_threshold', '2000', 'Maximum order amount for COD', 'business', true),
  ('bulk_discount_threshold', '5000', 'Minimum order for bulk discount', 'business', true),
  ('bulk_discount_percentage', '5', 'Bulk discount percentage', 'business', true),
  ('min_order_amount', '200', 'Minimum order amount', 'business', true),
  ('max_order_amount', '50000', 'Maximum order amount', 'business', true),
  
  -- Operational Settings
  ('business_hours_start', '"09:00"', 'Business hours start time', 'operations', false),
  ('business_hours_end', '"21:00"', 'Business hours end time', 'operations', false),
  ('delivery_slots', '["09:00-12:00", "12:00-15:00", "15:00-18:00", "18:00-21:00"]', 'Available delivery time slots', 'operations', false),
  ('order_processing_time', '2', 'Order processing time in hours', 'operations', false),
  ('delivery_time_estimate', '24', 'Estimated delivery time in hours', 'operations', true),
  ('low_stock_threshold', '10', 'Low stock alert threshold', 'operations', false),
  ('auto_approve_orders', 'false', 'Automatically approve orders', 'operations', false),
  
  -- Display Settings
  ('products_per_page', '12', 'Products displayed per page', 'display', false),
  ('featured_products_count', '8', 'Number of featured products on homepage', 'display', false),
  ('bestsellers_count', '6', 'Number of bestsellers to display', 'display', false),
  ('related_products_count', '4', 'Number of related products to show', 'display', false),
  ('enable_reviews', 'true', 'Enable product reviews', 'display', true),
  ('enable_ratings', 'true', 'Enable product ratings', 'display', true),
  ('enable_wishlist', 'true', 'Enable wishlist functionality', 'display', true),
  
  -- Notification Settings
  ('email_notifications', 'true', 'Enable email notifications', 'notifications', false),
  ('sms_notifications', 'false', 'Enable SMS notifications', 'notifications', false),
  ('order_notifications', 'true', 'Enable order notifications to admin', 'notifications', false),
  ('low_stock_alerts', 'true', 'Enable low stock alerts', 'notifications', false),
  ('customer_notifications', 'true', 'Enable customer notifications', 'notifications', false),
  ('payment_notifications', 'true', 'Enable payment notifications', 'notifications', false),
  ('delivery_notifications', 'true', 'Enable delivery notifications', 'notifications', false),
  
  -- Security Settings
  ('session_timeout', '30', 'Session timeout in minutes', 'security', false),
  ('max_login_attempts', '5', 'Maximum login attempts before lockout', 'security', false),
  ('password_min_length', '8', 'Minimum password length', 'security', false),
  ('require_email_verification', 'true', 'Require email verification for new accounts', 'security', false),
  ('enable_two_factor', 'false', 'Enable two-factor authentication', 'security', false),
  
  -- Payment Settings
  ('razorpay_enabled', 'true', 'Enable Razorpay payments', 'payment', false),
  ('cod_enabled', 'true', 'Enable Cash on Delivery', 'payment', true),
  ('wallet_enabled', 'false', 'Enable wallet payments', 'payment', false),
  ('upi_enabled', 'true', 'Enable UPI payments', 'payment', true),
  ('card_enabled', 'true', 'Enable card payments', 'payment', true),
  ('netbanking_enabled', 'true', 'Enable net banking', 'payment', true),
  
  -- SEO Settings
  ('site_title', '"Dare To Diet - Fitness Supplements & Health Products"', 'Site title for SEO', 'seo', true),
  ('site_description', '"Shop fitness supplements and health products. Premium quality products for your wellness journey."', 'Site meta description', 'seo', true),
  ('site_keywords', '"bulk shopping, wholesale prices, bulk groceries, bulk electronics, business supplies"', 'Site meta keywords', 'seo', true),
  
  -- Social Media
  ('facebook_url', '""', 'Facebook page URL', 'social', true),
  ('instagram_url', '""', 'Instagram profile URL', 'social', true),
  ('twitter_url', '""', 'Twitter profile URL', 'social', true),
  ('linkedin_url', '""', 'LinkedIn profile URL', 'social', true),
  ('whatsapp_number', '"+91 9996616153"', 'WhatsApp business number', 'social', true)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- DATA MIGRATION AND CLEANUP
-- =====================================================

-- Update existing products to convert old features format to new format
-- This will convert the old boolean-based features to the new array format
UPDATE public.products 
SET features = (
  SELECT jsonb_agg(feature_name)
  FROM (
    SELECT 
      CASE 
        WHEN key = 'humanlyRaised' AND value::boolean = true THEN 'Humanly Raised'
        WHEN key = 'handSelected' AND value::boolean = true THEN 'Hand Selected'
        WHEN key = 'temperatureControlled' AND value::boolean = true THEN 'Temperature Controlled'
        WHEN key = 'artisanalCut' AND value::boolean = true THEN 'Artisanal Cut'
        WHEN key = 'hygienicallyVacuumPacked' AND value::boolean = true THEN 'Hygienically Packed'
        WHEN key = 'netWeightOfPreppedMeat' AND value::boolean = true THEN 'Net Weight Prepped'
        WHEN key = 'qualityAndFoodsafetyChecks' AND value::boolean = true THEN 'Quality Certified'
        WHEN key = 'mixOfOffalOrgans' AND value::boolean = true THEN 'Mixed Organs'
        WHEN key = 'antibioticResidueFree' AND value::boolean = true THEN 'Antibiotic Free'
        WHEN key = 'bulk_pack' AND value::boolean = true THEN 'Bulk Pack'
        WHEN key = 'wholesale_price' AND value::boolean = true THEN 'Wholesale Price'
        WHEN key = 'restaurant_grade' AND value::boolean = true THEN 'Restaurant Grade'
        WHEN key = 'commercial_grade' AND value::boolean = true THEN 'Commercial Grade'
        WHEN key = 'long_shelf_life' AND value::boolean = true THEN 'Long Shelf Life'
        WHEN key = 'energy_efficient' AND value::boolean = true THEN 'Energy Efficient'
        WHEN key = 'long_lasting' AND value::boolean = true THEN 'Long Lasting'
        WHEN key = 'bulk_discount' AND value::boolean = true THEN 'Bulk Discount Available'
        ELSE NULL
      END as feature_name
    FROM jsonb_each(products.features)
    WHERE jsonb_typeof(products.features) = 'object'
  ) converted_features
  WHERE feature_name IS NOT NULL
)
WHERE jsonb_typeof(features) = 'object' AND features != 'null'::jsonb;

-- Set empty array for products with null or empty features
UPDATE public.products 
SET features = '[]'::jsonb
WHERE features IS NULL OR features = 'null'::jsonb OR features = '{}'::jsonb;

-- =====================================================
-- INVOICE GENERATION FUNCTIONS
-- =====================================================

-- Function to generate invoice data for orders
CREATE OR REPLACE FUNCTION public.generate_invoice_data(order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_record RECORD;
  invoice_data JSONB;
  store_settings JSONB;
  item_details JSONB;
BEGIN
  -- Get order details
  SELECT * INTO order_record FROM public.orders WHERE id = order_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  -- Get store settings for invoice
  SELECT jsonb_object_agg(key, value) INTO store_settings
  FROM public.settings 
  WHERE key IN ('store_name', 'store_address', 'store_phone', 'store_email', 'currency_symbol');
  
  -- Build invoice data
  invoice_data := jsonb_build_object(
    'invoice_number', 'INV-' || order_record.order_number,
    'order_number', order_record.order_number,
    'invoice_date', to_char(order_record.created_at, 'DD/MM/YYYY'),
    'due_date', to_char(order_record.created_at + interval '30 days', 'DD/MM/YYYY'),
    'order_date', to_char(order_record.created_at, 'DD/MM/YYYY HH24:MI'),
    'store_info', store_settings,
    'customer_info', order_record.customer_info,
    'delivery_address', order_record.address_details,
    'items', order_record.items,
    'pricing', jsonb_build_object(
      'subtotal', order_record.subtotal,
      'tax', order_record.tax,
      'delivery_fee', order_record.delivery_fee,
      'cod_fee', order_record.cod_fee,
      'discount', order_record.discount,
      'total', order_record.total
    ),
    'payment_info', jsonb_build_object(
      'method', order_record.payment_method,
      'status', order_record.payment_status,
      'razorpay_payment_id', order_record.razorpay_payment_id
    ),
    'order_status', order_record.order_status,
    'coupon_code', order_record.coupon_code,
    'special_instructions', order_record.special_instructions
  );
  
  RETURN invoice_data;
END;
$$;

-- Function to get invoice template settings
CREATE OR REPLACE FUNCTION public.get_invoice_template_settings()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  template_settings JSONB;
BEGIN
  SELECT jsonb_object_agg(key, value) INTO template_settings
  FROM public.settings 
  WHERE key IN (
    'store_name', 'store_address', 'store_phone', 'store_email', 'store_logo',
    'currency_symbol', 'tax_rate', 'invoice_terms', 'invoice_footer'
  );
  
  -- Add default values if not set
  template_settings := template_settings || jsonb_build_object(
    'invoice_terms', COALESCE(template_settings->>'invoice_terms', 'Payment is due within 30 days of invoice date.'),
    'invoice_footer', COALESCE(template_settings->>'invoice_footer', 'Thank you for your business!')
  );
  
  RETURN template_settings;
END;
$$;

-- Function to get app settings for frontend
CREATE OR REPLACE FUNCTION public.get_app_settings()
RETURNS TABLE(key TEXT, value JSONB)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.key, s.value 
  FROM public.settings s
  WHERE s.key IN (
    'tax_rate',
    'delivery_charge',
    'free_delivery_threshold',
    'cod_charge',
    'cod_threshold',
    'min_order_amount',
    'max_order_amount',
    'bulk_discount_threshold',
    'bulk_discount_percentage',
    'currency_symbol',
    'cod_enabled',
    'razorpay_enabled',
    'upi_enabled',
    'card_enabled',
    'netbanking_enabled',
    'store_name',
    'store_phone',
    'store_email',
    'store_address'
  );
$$;

-- =====================================================
-- ADDITIONAL SETTINGS FOR INVOICE
-- =====================================================

-- Insert invoice-related settings
INSERT INTO public.settings (key, value, description, category, is_public) VALUES
  ('invoice_terms', '"Payment is due within 30 days of invoice date. Late payments may incur additional charges."', 'Invoice payment terms', 'invoice', false),
  ('invoice_footer', '"Thank you for choosing Dare To Diet! For any queries, contact us at contact@daretodiet.fit"', 'Invoice footer text', 'invoice', false),
  ('invoice_logo', '"https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200"', 'Invoice logo URL', 'invoice', false),
  ('company_registration', '"CIN: U12345MH2024PTC123456"', 'Company registration details', 'invoice', false),
  ('gst_number', '"27ABCDE1234F1Z5"', 'GST registration number', 'invoice', false),
  ('bank_details', '{"bank_name": "State Bank of India", "account_number": "1234567890", "ifsc": "SBIN0001234", "branch": "Mumbai Main Branch"}'::jsonb, 'Bank account details for invoice', 'invoice', false)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- ADDITIONAL INDEXES AND OPTIMIZATIONS
-- =====================================================

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON public.orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON public.orders(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON public.orders(coupon_code) WHERE coupon_code IS NOT NULL;

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON public.orders(user_id, order_status);
CREATE INDEX IF NOT EXISTS idx_orders_date_status ON public.orders(created_at DESC, order_status);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON public.products(category_id, is_active) WHERE is_active = true;

-- =====================================================
-- ADDITIONAL TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update order status history
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes in activity_logs
  IF OLD.order_status != NEW.order_status OR OLD.payment_status != NEW.payment_status THEN
    INSERT INTO public.activity_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      old_values,
      new_values
    ) VALUES (
      auth.uid(),
      'status_update',
      'order',
      NEW.id,
      jsonb_build_object(
        'order_status', OLD.order_status,
        'payment_status', OLD.payment_status
      ),
      jsonb_build_object(
        'order_status', NEW.order_status,
        'payment_status', NEW.payment_status
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for order status logging
CREATE TRIGGER log_order_status_changes
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.log_order_status_change();

-- Function to validate order data
CREATE OR REPLACE FUNCTION public.validate_order_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate required fields
  IF NEW.customer_info IS NULL OR NEW.customer_info = '{}'::jsonb THEN
    RAISE EXCEPTION 'Customer information is required';
  END IF;
  
  IF NEW.items IS NULL OR jsonb_array_length(NEW.items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;
  
  IF NEW.total <= 0 THEN
    RAISE EXCEPTION 'Order total must be greater than zero';
  END IF;
  
  -- Validate payment method
  IF NEW.payment_method NOT IN ('cod', 'online', 'wallet', 'bank_transfer') THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;
  
  -- Validate order status
  IF NEW.order_status NOT IN ('placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') THEN
    RAISE EXCEPTION 'Invalid order status';
  END IF;
  
  -- Validate payment status
  IF NEW.payment_status NOT IN ('pending', 'paid', 'failed', 'refunded', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid payment status';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for order validation
CREATE TRIGGER validate_order_before_insert
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_data();

CREATE TRIGGER validate_order_before_update
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_data();

-- =====================================================
-- ADDITIONAL RLS POLICIES
-- =====================================================

-- Policy for invoice generation (admin only)
CREATE POLICY "invoice_generation_admin_only" ON public.orders FOR SELECT
USING (public.is_admin() AND id IS NOT NULL);

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Create view for order analytics
CREATE OR REPLACE VIEW public.order_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as order_date,
  COUNT(*) as total_orders,
  SUM(total) as total_revenue,
  AVG(total) as average_order_value,
  COUNT(CASE WHEN payment_method = 'cod' THEN 1 END) as cod_orders,
  COUNT(CASE WHEN payment_method = 'online' THEN 1 END) as online_orders,
  COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as delivered_orders,
  COUNT(CASE WHEN order_status = 'cancelled' THEN 1 END) as cancelled_orders
FROM public.orders
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY order_date DESC;

-- Create view for product performance
CREATE OR REPLACE VIEW public.product_performance AS
SELECT 
  p.id,
  p.name,
  p.category_id,
  c.name as category_name,
  COALESCE(SUM(ps.quantity_sold), 0) as total_sold,
  COALESCE(SUM(ps.total_revenue), 0) as total_revenue,
  p.stock_quantity,
  p.is_bestseller,
  p.is_active
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.product_sales ps ON p.id = ps.product_id
GROUP BY p.id, p.name, p.category_id, c.name, p.stock_quantity, p.is_bestseller, p.is_active
ORDER BY total_revenue DESC;

-- =====================================================
-- FINAL PERMISSIONS AND CLEANUP
-- =====================================================

-- Grant permissions on new functions
GRANT EXECUTE ON FUNCTION public.generate_invoice_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_invoice_template_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO anon, authenticated;

-- Grant permissions on views
GRANT SELECT ON public.order_analytics TO authenticated;
GRANT SELECT ON public.product_performance TO authenticated;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Dare To Diet database schema has been successfully created
-- with all necessary tables, policies, functions, initial data,
-- invoice generation capabilities, and comprehensive analytics
-- =====================================================