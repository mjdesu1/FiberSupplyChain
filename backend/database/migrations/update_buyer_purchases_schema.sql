-- Migration: Update buyer_purchases table schema
-- Date: 2024-11-21
-- Description: Updates buyer_purchases table to match new form fields

-- Step 1: Add new columns if they don't exist
ALTER TABLE buyer_purchases 
ADD COLUMN IF NOT EXISTS farmer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS variety VARCHAR(100),
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2);

-- Step 2: Drop old columns that are no longer needed
ALTER TABLE buyer_purchases 
DROP COLUMN IF EXISTS requirements,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS location,
DROP COLUMN IF EXISTS delivery_date,
DROP COLUMN IF EXISTS gross_profit,
DROP COLUMN IF EXISTS net_profit;

-- Step 3: Update fiber_quality constraint to only allow Class A, B, C
ALTER TABLE buyer_purchases 
DROP CONSTRAINT IF EXISTS buyer_purchases_fiber_quality_check;

ALTER TABLE buyer_purchases 
ADD CONSTRAINT buyer_purchases_fiber_quality_check 
CHECK (fiber_quality IN ('Class A', 'Class B', 'Class C'));

-- Step 4: Update status constraint
ALTER TABLE buyer_purchases 
DROP CONSTRAINT IF EXISTS buyer_purchases_status_check;

ALTER TABLE buyer_purchases 
ADD CONSTRAINT buyer_purchases_status_check 
CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'));

-- Step 5: Make new columns NOT NULL (after ensuring data exists)
-- Note: Run this only after populating farmer_name, variety, and total_price for existing records
-- ALTER TABLE buyer_purchases ALTER COLUMN farmer_name SET NOT NULL;
-- ALTER TABLE buyer_purchases ALTER COLUMN variety SET NOT NULL;
-- ALTER TABLE buyer_purchases ALTER COLUMN total_price SET NOT NULL;

-- Step 6: Create new indexes
CREATE INDEX IF NOT EXISTS idx_buyer_purchases_fiber_quality ON buyer_purchases(fiber_quality);
CREATE INDEX IF NOT EXISTS idx_buyer_purchases_farmer_name ON buyer_purchases(farmer_name);

-- Step 7: Update comments
COMMENT ON TABLE buyer_purchases IS 'Stores buyer purchase requests for abaca fiber from farmers';
COMMENT ON COLUMN buyer_purchases.price IS 'Price per kilogram in Philippine Pesos';
COMMENT ON COLUMN buyer_purchases.farmer_name IS 'Name of the farmer supplying the abaca fiber';
COMMENT ON COLUMN buyer_purchases.fiber_quality IS 'Quality grade: Class A (Premium), Class B (Standard), Class C (Basic)';
COMMENT ON COLUMN buyer_purchases.quantity IS 'Quantity of abaca fiber in kilograms';
COMMENT ON COLUMN buyer_purchases.variety IS 'Abaca variety name (e.g., Inosa, Laylay, Musa Textilis)';
COMMENT ON COLUMN buyer_purchases.total_price IS 'Total purchase price calculated as price × quantity';
COMMENT ON COLUMN buyer_purchases.status IS 'Purchase status: pending, processing, completed, or cancelled';

-- Verify changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'buyer_purchases' 
ORDER BY ordinal_position;
