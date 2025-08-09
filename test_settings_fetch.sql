-- Test query to check settings values in database
SELECT key, value, pg_typeof(value) as value_type 
FROM public.settings 
WHERE key IN (
  'tax_rate',
  'delivery_charge', 
  'free_delivery_threshold',
  'cod_charge',
  'cod_threshold',
  'min_order_amount',
  'currency_symbol'
)
ORDER BY key;

-- Also check if there are any settings at all
SELECT COUNT(*) as total_settings FROM public.settings;