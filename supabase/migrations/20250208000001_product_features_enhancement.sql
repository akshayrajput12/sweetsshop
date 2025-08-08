-- =====================================================
-- PRODUCT FEATURES ENHANCEMENT MIGRATION
-- =====================================================
-- This migration enhances the product features system
-- to support dynamic feature management
-- =====================================================

-- Create product_features table for managing available features
CREATE TABLE IF NOT EXISTS public.product_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for product_features
ALTER TABLE public.product_features ENABLE ROW LEVEL SECURITY;

-- Create policies for product_features
CREATE POLICY "product_features_select_active" ON public.product_features FOR SELECT 
USING (is_active = true);
CREATE POLICY "product_features_all_admin" ON public.product_features FOR ALL 
USING (public.is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_product_features_updated_at
  BEFORE UPDATE ON public.product_features
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_product_features_is_active ON public.product_features(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_product_features_name ON public.product_features(name);

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

-- Grant permissions
GRANT ALL ON public.product_features TO anon, authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Product features system has been enhanced with:
-- 1. Dynamic feature management table
-- 2. Converted existing features to new format
-- 3. Added comprehensive default features
-- 4. Proper RLS policies and indexes
-- =====================================================