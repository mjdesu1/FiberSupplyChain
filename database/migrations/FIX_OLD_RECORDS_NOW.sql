-- ============================================
-- DIRECT FIX: Update old records to "Done Monitor"
-- Run this if the previous script didn't update old records
-- ============================================

-- First, let's see what we have
SELECT 
  farmer_name,
  monitoring_id,
  date_of_visit,
  status,
  next_monitoring_date
FROM public.monitoring_records
ORDER BY farmer_name, date_of_visit DESC;

-- ============================================
-- METHOD 1: Update by date (simpler)
-- ============================================
-- For each farmer, find the latest date and mark older ones as "Done Monitor"

-- Update for farmer "test"
UPDATE public.monitoring_records
SET status = 'Done Monitor', updated_at = NOW()
WHERE farmer_name = 'test'
  AND status = 'Ongoing'
  AND date_of_visit < (
    SELECT MAX(date_of_visit) 
    FROM public.monitoring_records 
    WHERE farmer_name = 'test' AND status = 'Ongoing'
  );

-- Update for farmer "cusafa"
UPDATE public.monitoring_records
SET status = 'Done Monitor', updated_at = NOW()
WHERE farmer_name = 'cusafa'
  AND status = 'Ongoing'
  AND date_of_visit < (
    SELECT MAX(date_of_visit) 
    FROM public.monitoring_records 
    WHERE farmer_name = 'cusafa' AND status = 'Ongoing'
  );

-- Update for farmer "reyn"
UPDATE public.monitoring_records
SET status = 'Done Monitor', updated_at = NOW()
WHERE farmer_name = 'reyn'
  AND status = 'Ongoing'
  AND date_of_visit < (
    SELECT MAX(date_of_visit) 
    FROM public.monitoring_records 
    WHERE farmer_name = 'reyn' AND status = 'Ongoing'
  );

-- Update for farmer "michael joshua b paloa"
UPDATE public.monitoring_records
SET status = 'Done Monitor', updated_at = NOW()
WHERE farmer_name = 'michael joshua b paloa'
  AND status = 'Ongoing'
  AND date_of_visit < (
    SELECT MAX(date_of_visit) 
    FROM public.monitoring_records 
    WHERE farmer_name = 'michael joshua b paloa' AND status = 'Ongoing'
  );

-- ============================================
-- METHOD 2: Update ALL farmers at once
-- ============================================
-- This will work for any farmer in the system

UPDATE public.monitoring_records mr1
SET status = 'Done Monitor', updated_at = NOW()
WHERE status = 'Ongoing'
  AND date_of_visit < (
    SELECT MAX(date_of_visit)
    FROM public.monitoring_records mr2
    WHERE mr2.farmer_name = mr1.farmer_name
      AND mr2.status = 'Ongoing'
  );

-- ============================================
-- Verify the changes
-- ============================================
SELECT 
  farmer_name,
  monitoring_id,
  date_of_visit,
  status,
  next_monitoring_date,
  CASE 
    WHEN status = 'Done Monitor' AND date_of_visit < (
      SELECT MAX(date_of_visit) 
      FROM public.monitoring_records mr2 
      WHERE mr2.farmer_name = monitoring_records.farmer_name
    ) THEN '✓ CORRECT - Old record is Done Monitor'
    WHEN status = 'Ongoing' AND date_of_visit = (
      SELECT MAX(date_of_visit) 
      FROM public.monitoring_records mr2 
      WHERE mr2.farmer_name = monitoring_records.farmer_name 
        AND mr2.status = 'Ongoing'
    ) THEN '✓ CORRECT - Latest record is Ongoing'
    ELSE '❌ NEEDS FIX'
  END as validation
FROM public.monitoring_records
ORDER BY farmer_name, date_of_visit DESC;

-- ============================================
-- EXPECTED RESULT:
-- ============================================
-- farmer_name | date_of_visit | status        | validation
-- ------------|---------------|---------------|---------------------------
-- cusafa      | 2025-11-28    | Ongoing       | ✓ CORRECT - Latest
-- cusafa      | 2025-11-27    | Done Monitor  | ✓ CORRECT - Old record
-- cusafa      | 2025-11-07    | Done Monitor  | ✓ CORRECT - Old record
-- test        | 2025-11-28    | Ongoing       | ✓ CORRECT - Latest
-- test        | 2025-11-27    | Done Monitor  | ✓ CORRECT - Old record
-- test        | 2025-11-07    | Done Monitor  | ✓ CORRECT - Old record
-- ============================================
