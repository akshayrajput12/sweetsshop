-- Add function to fetch settings safely for frontend
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
  )
  ORDER BY s.key;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO anon, authenticated;