-- Add missing product fields that are used in ProductDetail page but not in admin form
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS pieces TEXT,
ADD COLUMN IF NOT EXISTS serves INTEGER,
ADD COLUMN IF NOT EXISTS storage_instructions TEXT,
ADD COLUMN IF NOT EXISTS marketing_info JSONB;

-- Create table for coupon assignments to products
CREATE TABLE IF NOT EXISTS product_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, coupon_id)
);

-- Enable RLS on product_coupons
ALTER TABLE product_coupons ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_coupons
CREATE POLICY "product_coupons_select_all" ON product_coupons FOR SELECT USING (true);
CREATE POLICY "product_coupons_all_admin" ON product_coupons FOR ALL USING (is_admin());

-- Fix stock quantity display issue by adding a proper check for inStock
-- This will be handled in the frontend code

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_coupons_product_id ON product_coupons(product_id);
CREATE INDEX IF NOT EXISTS idx_product_coupons_coupon_id ON product_coupons(coupon_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON addresses(is_default) WHERE is_default = true;