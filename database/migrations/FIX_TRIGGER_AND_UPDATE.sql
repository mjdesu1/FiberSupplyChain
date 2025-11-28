-- ============================================
-- COMPLETE FIX: Update trigger and fix all old records
-- This handles cases where farmer_id might be NULL or different
-- ============================================

-- STEP 1: Drop old trigger
DROP TRIGGER IF EXISTS auto_mark_old_monitoring_done ON public.monitoring_records;

-- STEP 2: Create improved trigger function
-- This uses COALESCE to handle NULL farmer_id
CREATE OR REPLACE FUNCTION mark_old_monitoring_as_done()
RETURNS TRIGGER AS $$
BEGIN
  -- Update old records for the same farmer
  -- Match by farmer_name AND farmer_id (if both exist)
  UPDATE public.monitoring_records
  SET 
    status = 'Done Monitor',
    updated_at = NOW()
  WHERE 
    farmer_name = NEW.farmer_name
    AND (
      -- If both have farmer_id, match by farmer_id
      (NEW.farmer_id IS NOT NULL AND farmer_id = NEW.farmer_id)
      OR
      -- If farmer_id is NULL, match by farmer_name only
      (NEW.farmer_id IS NULL AND farmer_id IS NULL)
    )
    AND status = 'Ongoing'
    AND monitoring_id != NEW.monitoring_id
    AND date_of_visit < NEW.date_of_visit;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 3: Recreate trigger
CREATE TRIGGER auto_mark_old_monitoring_done
AFTER INSERT ON public.monitoring_records
FOR EACH ROW
EXECUTE FUNCTION mark_old_monitoring_as_done();

-- STEP 4: Fix ALL existing old records NOW
-- This will work for all farmers regardless of farmer_id
UPDATE public.monitoring_records mr1
SET status = 'Done Monitor', updated_at = NOW()
WHERE status = 'Ongoing'
  AND EXISTS (
    SELECT 1
    FROM public.monitoring_records mr2
    WHERE mr2.farmer_name = mr1.farmer_name
      AND (
        -- Match by farmer_id if both have it
        (mr1.farmer_id IS NOT NULL AND mr2.farmer_id = mr1.farmer_id)
        OR
        -- Match by farmer_name only if farmer_id is NULL
        (mr1.farmer_id IS NULL AND mr2.farmer_id IS NULL)
      )
      AND mr2.status = 'Ongoing'
      AND mr2.date_of_visit > mr1.date_of_visit
  );

-- STEP 5: Verify results
SELECT 
  farmer_name,
  farmer_id,
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

-- STEP 6: Summary per farmer
SELECT 
  farmer_name,
  farmer_id,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE status = 'Ongoing') as ongoing_count,
  COUNT(*) FILTER (WHERE status = 'Done Monitor') as done_monitor_count,
  COUNT(*) FILTER (WHERE status = 'Completed') as completed_count
FROM public.monitoring_records
GROUP BY farmer_name, farmer_id
ORDER BY farmer_name;
