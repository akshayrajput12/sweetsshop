-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('product-images', 'product-images', true),
  ('category-images', 'category-images', true),
  ('coupon-images', 'coupon-images', true);

-- Create policies for product images
CREATE POLICY "Anyone can view product images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "Admins can update product images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "Admins can delete product images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images' AND is_admin());

-- Create policies for category images
CREATE POLICY "Anyone can view category images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'category-images');

CREATE POLICY "Admins can upload category images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'category-images' AND is_admin());

CREATE POLICY "Admins can update category images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'category-images' AND is_admin());

CREATE POLICY "Admins can delete category images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'category-images' AND is_admin());

-- Create policies for coupon images
CREATE POLICY "Anyone can view coupon images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'coupon-images');

CREATE POLICY "Admins can upload coupon images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'coupon-images' AND is_admin());

CREATE POLICY "Admins can update coupon images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'coupon-images' AND is_admin());

CREATE POLICY "Admins can delete coupon images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'coupon-images' AND is_admin());