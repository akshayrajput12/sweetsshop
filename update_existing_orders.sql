-- Update existing orders to link them with users based on email
-- This script should be run in Supabase SQL Editor

-- Update orders that have customer_info with email but no user_id
UPDATE orders 
SET user_id = profiles.id
FROM profiles
WHERE orders.user_id IS NULL 
  AND orders.customer_info->>'email' = profiles.email;

-- Verify the update
SELECT 
  o.order_number,
  o.customer_info->>'email' as customer_email,
  o.user_id,
  p.email as profile_email
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC
LIMIT 10;