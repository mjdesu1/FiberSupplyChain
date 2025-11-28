-- ============================================
-- RUN THIS ENTIRE SCRIPT IN SUPABASE SQL EDITOR
-- This will fix everything in one go
-- ============================================

-- STEP 1: Add "Done Monitor" status
-- ============================================
ALTER TABLE public.monitoring_records 
DROP CONSTRAINT IF EXISTS monitoring_records_status_check;

ALTER TABLE public.monitoring_records 
ADD CONSTRAINT monitoring_records_status_check 
CHECK (
  status::text = ANY (
    ARRAY[
      'Ongoing'::character varying,
      'Completed'::character varying,
      'Done Monitor'::character varying
    ]::text[]
  )
);

-- STEP 2: Update constraint for Completed status
-- ============================================
ALTER TABLE public.monitoring_records 
DROP CONSTRAINT IF EXISTS check_completed_no_next_date;

ALTER TABLE public.monitoring_records 
ADD CONSTRAINT check_completed_no_next_date 
CHECK (
  (
    (status::text <> 'Completed')
    OR (next_monitoring_date IS NULL)
  )
);

-- STEP 3: Create automatic trigger function
-- ============================================
CREATE OR REPLACE FUNCTION mark_old_monitoring_as_done()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new monitoring record is inserted for a farmer
  -- Mark all previous "Ongoing" records for that SAME farmer as "Done Monitor"
  UPDATE public.monitoring_records
  SET 
    status = 'Done Monitor',
    updated_at = NOW()
  WHERE 
    farmer_name = NEW.farmer_name
    AND status = 'Ongoing'
    AND monitoring_id != NEW.monitoring_id
    AND date_of_visit < NEW.date_of_visit;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 4: Create trigger
-- ============================================
DROP TRIGGER IF EXISTS auto_mark_old_monitoring_done ON public.monitoring_records;

CREATE TRIGGER auto_mark_old_monitoring_done
AFTER INSERT ON public.monitoring_records
FOR EACH ROW
EXECUTE FUNCTION mark_old_monitoring_as_done();

-- STEP 5: Fix existing old records NOW
-- ============================================
WITH latest_records_per_farmer AS (
  SELECT DISTINCT ON (farmer_name)
    monitoring_id,
    farmer_name,
    date_of_visit
  FROM public.monitoring_records
  WHERE status = 'Ongoing'
  ORDER BY farmer_name, date_of_visit DESC
)
UPDATE public.monitoring_records
SET 
  status = 'Done Monitor',
  updated_at = NOW()
WHERE 
  status = 'Ongoing'
  AND monitoring_id NOT IN (SELECT monitoring_id FROM latest_records_per_farmer);

-- STEP 6: Verify results
-- ============================================
SELECT 
  farmer_name,
  monitoring_id,
  date_of_visit,
  status,
  next_monitoring_date,
  CASE 
    WHEN status = 'Done Monitor' THEN '✓ OLD - Done Monitor'
    WHEN status = 'Ongoing' THEN '✓ LATEST - Ongoing'
    WHEN status = 'Completed' THEN '✓ FINAL - Completed'
    ELSE '❌ ERROR'
  END as validation
FROM public.monitoring_records
ORDER BY farmer_name, date_of_visit DESC;

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- Each farmer should have:
-- - Only 1 "Ongoing" record (the latest date)
-- - All older records should be "Done Monitor"
--
-- Example:
-- test/cusafa: Nov 28 = Ongoing ✓
-- test/cusafa: Nov 27 = Done Monitor ✓
-- test/cusafa: Nov 7 = Done Monitor ✓
-- ============================================
