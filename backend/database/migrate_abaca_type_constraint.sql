-- =====================================================
-- MIGRATION: Remove abaca_type CHECK constraint
-- =====================================================
-- This migration removes the CHECK constraint on abaca_type column
-- to allow farmers to input custom abaca types/grades

-- Remove the existing CHECK constraint on abaca_type
ALTER TABLE public.sales_reports 
DROP CONSTRAINT IF EXISTS sales_reports_abaca_type_check;

-- Update the column comment to reflect the change
COMMENT ON COLUMN public.sales_reports.abaca_type IS 'Type/grade of abaca - farmers can input any custom type (e.g., Tuxy, Superior, Medium, Low Grade, Custom grades)';

-- Optional: Add a simple length constraint to prevent extremely long inputs (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'abaca_type_length_check' 
        AND conrelid = 'public.sales_reports'::regclass
    ) THEN
        ALTER TABLE public.sales_reports 
        ADD CONSTRAINT abaca_type_length_check CHECK (char_length(abaca_type) <= 100);
        
        COMMENT ON CONSTRAINT abaca_type_length_check ON public.sales_reports IS 'Ensures abaca_type is not longer than 100 characters';
    END IF;
END $$;
