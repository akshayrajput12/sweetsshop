-- Fix Product Filtering and Customer Data Issues in BulkBox Database
-- Run this script in Supabase SQL Editor to fix existing data problems

-- 1. Ensure all products have proper category relationships
UPDATE products 
SET category_id = (
  SELECT id FROM categories WHERE name = 'Bulk Groceries' LIMIT 1
)
WHERE category_id IS NULL;

-- 2. Update customer_info in orders where name is missing but user_id exists
UPDATE orders 
SET customer_info = jsonb_set(
  COALESCE(customer_info, '{}'),
  '{name}',
  to_jsonb(profiles.full_name)
)
FROM profiles
WHERE orders.user_id = profiles.id 
  AND (orders.customer_info->>'name' IS NULL OR orders.customer_info->>'name' = '')
  AND profiles.full_name IS NOT NULL;

-- 3. Update customer_info email where missing but user_id exists
UPDATE orders 
SET customer_info = jsonb_set(
  COALESCE(customer_info, '{}'),
  '{email}',
  to_jsonb(profiles.email)
)
FROM profiles
WHERE orders.user_id = profiles.id 
  AND (orders.customer_info->>'email' IS NULL OR orders.customer_info->>'email' = '')
  AND profiles.email IS NOT NULL;

-- 4. Update customer_info phone where missing but user_id exists
UPDATE orders 
SET customer_info = jsonb_set(
  COALESCE(customer_info, '{}'),
  '{phone}',
  to_jsonb(profiles.phone)
)
FROM profiles
WHERE orders.user_id = profiles.id 
  AND (orders.customer_info->>'phone' IS NULL OR orders.customer_info->>'phone' = '')
  AND profiles.phone IS NOT NULL;

-- 5. Update product categories in order items from old to new categories
UPDATE orders
SET items = (
  SELECT jsonb_agg(
    CASE 
      WHEN item->>'category' = 'meat' OR item->>'category' = 'bulk' 
      THEN jsonb_set(item, '{category}', '"Bulk Groceries"')
      WHEN item->>'category' IS NULL OR item->>'category' = '' OR item->>'category' = 'Uncategorized'
      THEN jsonb_set(item, '{category}', '"General Items"')
      ELSE item
    END
  )
  FROM jsonb_array_elements(orders.items) AS item
)
WHERE items IS NOT NULL;

-- 6. Ensure all profiles have proper full_names
UPDATE profiles 
SET full_name = COALESCE(full_name, 'User ' || SUBSTRING(id::text, 1, 8))
WHERE full_name IS NULL OR full_name = '';

-- 7. Update address_details to include complete_address field for better display
UPDATE orders
SET address_details = jsonb_set(
  COALESCE(address_details, '{}'),
  '{complete_address}',
  to_jsonb(
    TRIM(
      COALESCE(address_details->>'plotNumber', '') || ' ' ||
      COALESCE(address_details->>'street', '') || ', ' ||
      COALESCE(address_details->>'city', '') || ' ' ||
      COALESCE(address_details->>'state', '') || ' ' ||
      COALESCE(address_details->>'pincode', '')
    )
  )
)
WHERE address_details IS NOT NULL 
  AND (address_details->>'complete_address' IS NULL OR address_details->>'complete_address' = '');

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 9. Verification queries to check the fixes
SELECT 
  'Orders with customer names' as check_type,
  COUNT(*) as total_orders,
  COUNT(CASE WHEN customer_info->>'name' IS NOT NULL AND customer_info->>'name' != '' THEN 1 END) as orders_with_names,
  COUNT(CASE WHEN customer_info->>'name' IS NULL OR customer_info->>'name' = '' THEN 1 END) as orders_without_names
FROM orders

UNION ALL

SELECT 
  'Products with categories' as check_type,
  COUNT(*) as total_products,
  COUNT(CASE WHEN category_id IS NOT NULL THEN 1 END) as products_with_category,
  COUNT(CASE WHEN category_id IS NULL THEN 1 END) as products_without_category
FROM products

UNION ALL

SELECT 
  'Profiles with names' as check_type,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN full_name IS NOT NULL AND full_name != '' THEN 1 END) as profiles_with_names,
  COUNT(CASE WHEN full_name IS NULL OR full_name = '' THEN 1 END) as profiles_without_names
FROM profiles;

-- 10. Show sample of fixed data
SELECT 
  o.order_number,
  o.customer_info->>'name' as customer_name,
  o.customer_info->>'email' as customer_email,
  p.full_name as profile_name,
  p.email as profile_email,
  o.address_details->>'complete_address' as complete_address
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC
LIMIT 10;

-- 11. Show product-category relationships
SELECT 
  p.name as product_name,
  p.category_id,
  c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true
ORDER BY c.name, p.name
LIMIT 20;