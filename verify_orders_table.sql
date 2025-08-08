-- Verify Orders Table Structure
-- Run this in Supabase SQL Editor to check if orders table is properly set up

-- Check if orders table exists and show its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if cod_fee column exists specifically
SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name = 'cod_fee' 
    AND table_schema = 'public'
) AS cod_fee_exists;

-- Test inserting a sample order to verify all columns work
INSERT INTO public.orders (
    order_number,
    customer_info,
    delivery_location,
    address_details,
    items,
    subtotal,
    tax,
    delivery_fee,
    cod_fee,
    discount,
    total,
    payment_method,
    payment_status,
    order_status,
    razorpay_payment_id,
    coupon_code
) VALUES (
    'TEST_ORDER_' || extract(epoch from now())::bigint,
    '{"name": "Test Customer", "email": "test@example.com", "phone": "9999999999"}',
    '{"address": "Test Address", "lat": 19.0760, "lng": 72.8777}',
    '{"plotNumber": "123", "street": "Test Street", "pincode": "400001"}',
    '[{"id": "test-product", "name": "Test Product", "price": 100, "quantity": 1}]',
    100.00,
    18.00,
    50.00,
    25.00,
    0.00,
    193.00,
    'cod',
    'pending',
    'placed',
    'pay_test123456789',
    'TESTCOUPON'
);

-- Verify the test order was inserted
SELECT 
    order_number,
    subtotal,
    tax,
    delivery_fee,
    cod_fee,
    total,
    payment_method,
    created_at
FROM public.orders 
WHERE order_number LIKE 'TEST_ORDER_%'
ORDER BY created_at DESC 
LIMIT 1;

-- Clean up test order
DELETE FROM public.orders WHERE order_number LIKE 'TEST_ORDER_%';