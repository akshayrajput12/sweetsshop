-- =====================================================
-- ADD COD FEE COLUMN TO ORDERS TABLE
-- =====================================================
-- This migration adds the missing cod_fee column to the orders table
-- for existing databases that were created before this column was added
-- =====================================================

-- Add cod_fee column to orders table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'cod_fee'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN cod_fee DECIMAL(10, 2) NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Update existing orders to set cod_fee based on payment method
UPDATE public.orders 
SET cod_fee = CASE 
    WHEN payment_method = 'cod' THEN 25.00  -- Default COD fee
    ELSE 0.00
END
WHERE cod_fee IS NULL OR cod_fee = 0;

-- Add comment to the column
COMMENT ON COLUMN public.orders.cod_fee IS 'Cash on Delivery fee charged for COD orders';