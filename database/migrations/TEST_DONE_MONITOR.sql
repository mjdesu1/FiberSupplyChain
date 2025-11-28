-- Test Script for Done Monitor Feature
-- This script tests if the automatic "Done Monitor" feature works correctly

-- ============================================
-- STEP 1: Check current status
-- ============================================
SELECT 
  farmer_name,
  monitoring_id,
  date_of_visit,
  status,
  next_monitoring_date
FROM public.monitoring_records
ORDER BY farmer_name, date_of_visit DESC;

-- ============================================
-- STEP 2: Test the trigger
-- ============================================
-- Example: Insert a new monitoring record for an existing farmer
-- This should automatically mark their old "Ongoing" records as "Done Monitor"

-- IMPORTANT: Replace these values with actual data from your database
/*
INSERT INTO public.monitoring_records (
  monitoring_id,
  date_of_visit,
  monitored_by,
  farmer_name,
  farm_condition,
  growth_stage,
  actions_taken,
  recommendations,
  next_monitoring_date,
  status
) VALUES (
  'MON-TEST-' || EXTRACT(EPOCH FROM NOW())::bigint || '-999',
  CURRENT_DATE,
  'Test Officer',
  'reyn',  -- Replace with actual farmer name
  'Healthy',
  'Vegetative',
  'Regular monitoring conducted',
  'Continue current practices',
  CURRENT_DATE + INTERVAL '30 days',
  'Ongoing'
);
*/

-- ============================================
-- STEP 3: Verify the trigger worked
-- ============================================
-- Check if old records for the same farmer are now "Done Monitor"
SELECT 
  farmer_name,
  monitoring_id,
  date_of_visit,
  status,
  next_monitoring_date,
  CASE 
    WHEN status = 'Done Monitor' THEN '✓ Correctly marked as Done Monitor'
    WHEN status = 'Ongoing' AND date_of_visit = (
      SELECT MAX(date_of_visit) 
      FROM public.monitoring_records mr2 
      WHERE mr2.farmer_name = monitoring_records.farmer_name 
        AND mr2.status = 'Ongoing'
    ) THEN '✓ Latest record, should be Ongoing'
    ELSE '❌ ERROR: Should be Done Monitor'
  END as validation
FROM public.monitoring_records
WHERE farmer_name IN (
  SELECT DISTINCT farmer_name 
  FROM public.monitoring_records 
  GROUP BY farmer_name 
  HAVING COUNT(*) > 1
)
ORDER BY farmer_name, date_of_visit DESC;

-- ============================================
-- STEP 4: Summary by farmer
-- ============================================
SELECT 
  farmer_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE status = 'Ongoing') as ongoing_count,
  COUNT(*) FILTER (WHERE status = 'Done Monitor') as done_monitor_count,
  COUNT(*) FILTER (WHERE status = 'Completed') as completed_count,
  MAX(date_of_visit) FILTER (WHERE status = 'Ongoing') as latest_ongoing_date
FROM public.monitoring_records
GROUP BY farmer_name
ORDER BY farmer_name;

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- For each farmer:
-- - Only 1 record should have status = 'Ongoing' (the latest one)
-- - All older records should have status = 'Done Monitor'
-- - Example for farmer "reyn":
--   * Nov 18, 2025: Ongoing ✓ (latest)
--   * Nov 5, 2025: Done Monitor ✓ (old)
--
-- For each farmer:
-- - Only 1 record should have status = 'Ongoing' (the latest one)
-- - All older records should have status = 'Done Monitor'
-- - Example for farmer "test":
--   * Nov 27, 2025: Ongoing ✓ (latest)
--   * Nov 7, 2025: Done Monitor ✓ (old)
