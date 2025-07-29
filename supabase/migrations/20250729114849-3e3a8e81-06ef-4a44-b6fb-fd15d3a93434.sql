-- Comprehensive fix for infinite recursion in RLS policies
-- Drop ALL existing policies to avoid conflicts

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Drop all existing policies on categories
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

-- Drop all existing policies on products
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

-- Drop all existing policies on coupons
DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;

-- Drop all existing policies on reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews for their orders" ON public.reviews;
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;

-- Drop all existing policies on orders
DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Create security definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Recreate all policies correctly

-- Profiles table policies (non-recursive)
CREATE POLICY "profiles_select_own" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin());

-- Categories table policies
CREATE POLICY "categories_select_active" 
ON public.categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "categories_all_admin" 
ON public.categories 
FOR ALL 
USING (public.is_admin());

-- Products table policies
CREATE POLICY "products_select_active" 
ON public.products 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "products_all_admin" 
ON public.products 
FOR ALL 
USING (public.is_admin());

-- Coupons table policies
CREATE POLICY "coupons_select_active" 
ON public.coupons 
FOR SELECT 
USING ((is_active = true) AND (valid_from <= now()) AND ((valid_until IS NULL) OR (valid_until >= now())));

CREATE POLICY "coupons_all_admin" 
ON public.coupons 
FOR ALL 
USING (public.is_admin());

-- Reviews table policies
CREATE POLICY "reviews_select_all" 
ON public.reviews 
FOR SELECT 
USING (true);

CREATE POLICY "reviews_insert_own" 
ON public.reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_all_admin" 
ON public.reviews 
FOR ALL 
USING (public.is_admin());

-- Orders table policies
CREATE POLICY "orders_select_own_or_admin" 
ON public.orders 
FOR SELECT 
USING ((auth.uid() = user_id) OR (user_id IS NULL) OR public.is_admin());

CREATE POLICY "orders_insert_anyone" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "orders_update_admin" 
ON public.orders 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "orders_all_admin" 
ON public.orders 
FOR ALL 
USING (public.is_admin());

-- Ensure the existing user gets admin access
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'akshay@gmail.com';

-- Also make sure any user with this specific ID is admin
UPDATE public.profiles 
SET is_admin = true 
WHERE id = '45e9521c-5036-48db-a312-9dc1a039a417';