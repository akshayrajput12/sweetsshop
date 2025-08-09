-- Test Order Creation in Database
-- This script tests if orders can be created successfully with all required fields

-- Test 1: Create a COD order
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
    order_status
) VALUES (
    'BULKBOXS_' || extract(epoch from now())::bigint || '_COD',
    '{"name": "John Doe", "email": "john@example.com", "phone": "+91 9876543210"}',
    '{"address": "Mumbai, Maharashtra, India", "lat": 19.0760, "lng": 72.8777}',
    '{"plotNumber": "123", "street": "MG Road", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001", "landmark": "Near Metro Station"}',
    '[{"id": "prod1", "name": "Bulk Rice 25kg", "price": 2499, "quantity": 2, "weight": "25kg", "image": "rice.jpg"}]',
    4998.00,
    899.64,
    0.00,
    25.00,
    0.00,
    5922.64,
    'cod',
    'pending',
    'placed'
);

-- Test 2: Create an online payment order
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
    razorpay_order_id
) VALUES (
    'BULKBOXS_' || extract(epoch from now())::bigint || '_ONLINE',
    '{"name": "Jane Smith", "email": "jane@example.com", "phone": "+91 9876543211"}',
    '{"address": "Delhi, India", "lat": 28.6139, "lng": 77.2090}',
    '{"plotNumber": "456", "street": "CP", "city": "Delhi", "state": "Delhi", "pincode": "110001"}',
    '[{"id": "prod2", "name": "Bulk Oil 15L", "price": 1899, "quantity": 1, "weight": "15L", "image": "oil.jpg"}]',
    1899.00,
    341.82,
    50.00,
    0.00,
    100.00,
    2190.82,
    'online',
    'paid',
    'confirmed',
    'pay_test123456789',
    'BULKBOXS_test_order_123'
);

-- Verify both orders were created
SELECT 
    order_number,
    (customer_info->>'name') as customer_name,
    subtotal,
    tax,
    delivery_fee,
    cod_fee,
    total,
    payment_method,
    payment_status,
    order_status,
    created_at
FROM public.orders 
WHERE order_number LIKE 'BULKBOXS_%'
ORDER BY created_at DESC 
LIMIT 2;

-- Check if triggers are working (product_sales should be created for paid orders)
SELECT 
    ps.product_id,
    ps.quantity_sold,
    ps.unit_price,
    ps.total_revenue,
    o.order_number
FROM public.product_sales ps
JOIN public.orders o ON ps.order_id = o.id
WHERE o.order_number LIKE 'BULKBOXS_%'
ORDER BY ps.created_at DESC;

-- Clean up test orders (uncomment to remove test data)
-- DELETE FROM public.orders WHERE order_number LIKE 'BULKBOXS_%';