-- Fix security issue with function search path
ALTER FUNCTION public.is_admin() SET search_path = '';