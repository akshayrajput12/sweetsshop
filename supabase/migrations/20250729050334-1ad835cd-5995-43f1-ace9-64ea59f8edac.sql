-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION create_real_razorpay_order(
  order_data JSONB
) RETURNS TABLE (
  order_id TEXT,
  amount INTEGER,
  currency TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  generated_order_id TEXT;
  razorpay_amount INTEGER;
BEGIN
  -- Generate unique order ID
  generated_order_id := 'order_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 8);
  
  -- Convert amount to paise (multiply by 100)
  razorpay_amount := (order_data->>'amount')::numeric * 100;
  
  -- Return the order details
  RETURN QUERY SELECT 
    generated_order_id,
    razorpay_amount,
    COALESCE(order_data->>'currency', 'INR');
END;
$$;