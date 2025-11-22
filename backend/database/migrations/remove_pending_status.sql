-- Migration: Remove "Pending" status and replace with "Unpaid"
-- Date: 2024-11-21
-- Description: Updates fiber_deliveries table to remove "Pending" payment status and replace with "Unpaid"

-- Step 1: Update existing records with "Pending" to "Unpaid"
UPDATE fiber_deliveries 
SET payment_status = 'Unpaid' 
WHERE payment_status = 'Pending';

-- Step 2: Drop the old constraint
ALTER TABLE fiber_deliveries 
DROP CONSTRAINT IF EXISTS fiber_deliveries_payment_status_check;

-- Step 3: Add new constraint without "Pending"
ALTER TABLE fiber_deliveries 
ADD CONSTRAINT fiber_deliveries_payment_status_check 
CHECK (payment_status IN ('Unpaid', 'Partial', 'Paid'));

-- Step 4: Update default value
ALTER TABLE fiber_deliveries 
ALTER COLUMN payment_status SET DEFAULT 'Unpaid';

-- Step 5: Update comment
COMMENT ON COLUMN fiber_deliveries.payment_status IS 'Payment status: Unpaid (not paid), Partial (partially paid), Paid (fully paid)';

-- Verify the changes
SELECT DISTINCT payment_status FROM fiber_deliveries;
