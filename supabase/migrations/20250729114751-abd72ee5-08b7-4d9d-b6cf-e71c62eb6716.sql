-- Fix infinite recursion in RLS policies by creating security definer functions

-- First, drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;

-- Create security definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to get current user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_admin_status()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Recreate policies using security definer functions to avoid recursion

-- Profiles table policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin() = true);

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.is_admin() = true);

-- Categories table policies
CREATE POLICY "Anyone can view active categories" 
ON public.categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
USING (public.is_admin() = true);

-- Products table policies
CREATE POLICY "Anyone can view active products" 
ON public.products 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage products" 
ON public.products 
FOR ALL 
USING (public.is_admin() = true);

-- Coupons table policies
CREATE POLICY "Anyone can view active coupons" 
ON public.coupons 
FOR SELECT 
USING ((is_active = true) AND (valid_from <= now()) AND ((valid_until IS NULL) OR (valid_until >= now())));

CREATE POLICY "Admins can manage coupons" 
ON public.coupons 
FOR ALL 
USING (public.is_admin() = true);

-- Reviews table policies
CREATE POLICY "Anyone can view reviews" 
ON public.reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create reviews for their orders" 
ON public.reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage reviews" 
ON public.reviews 
FOR ALL 
USING (public.is_admin() = true);

-- Orders table policies (fix admin access)
DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
CREATE POLICY "Admins can manage orders" 
ON public.orders 
FOR ALL 
USING (public.is_admin() = true);

-- Ensure the user who signed up gets admin access
-- Update the existing user to be admin (replace with actual user ID if needed)
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'akshay@gmail.com';

-- Create a trigger to ensure first user becomes admin
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

-- Add the trigger to profiles table
DROP TRIGGER IF EXISTS set_first_user_admin ON public.profiles;
CREATE TRIGGER set_first_user_admin
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.make_first_user_admin();