-- Quick fix for orders table - Add missing cod_fee column
-- Run this in Supabase SQL Editor if you're getting the "cod_fee column not found" error

-- Add cod_fee column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cod_fee DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- Update existing orders to set cod_fee based on payment method
UPDATE public.orders 
SET cod_fee = CASE 
    WHEN payment_method = 'cod' THEN 25.00  -- Default COD fee
    ELSE 0.00
END
WHERE cod_fee = 0;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'cod_fee';