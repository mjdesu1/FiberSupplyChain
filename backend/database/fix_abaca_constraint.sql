-- =====================================================
-- SIMPLE FIX: Remove abaca_type CHECK constraint
-- =====================================================
-- Run this in Supabase SQL Editor to fix the 500 error

-- Remove the main CHECK constraint that's causing the 500 error
ALTER TABLE public.sales_reports 
DROP CONSTRAINT IF EXISTS sales_reports_abaca_type_check;

-- Verify the constraint is removed
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'public.sales_reports'::regclass 
AND conname LIKE '%abaca_type%';
