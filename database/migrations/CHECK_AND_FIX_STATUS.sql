-- ============================================
-- Check current status and fix if needed
-- ============================================

-- 1. Show all records with their status
SELECT 
  farmer_name,
  monitoring_id,
  date_of_visit,
  status,
  next_monitoring_date,
  created_at,
  CASE 
    WHEN status = 'Done Monitor' AND next_monitoring_date IS NOT NULL 
      THEN '⚠️ WARNING: Done Monitor should not have next_monitoring_date'
    WHEN status = 'Ongoing' AND next_monitoring_date IS NULL 
      THEN '⚠️ WARNING: Ongoing should have next_monitoring_date'
    ELSE '✓ OK'
  END as validation
FROM public.monitoring_records
ORDER BY farmer_name, created_at DESC;

-- 2. Count records per farmer by status
SELECT 
  farmer_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'Ongoing') as ongoing,
  COUNT(*) FILTER (WHERE status = 'Done Monitor') as done_monitor,
  COUNT(*) FILTER (WHERE status = 'Completed') as completed
FROM public.monitoring_records
GROUP BY farmer_name
ORDER BY farmer_name;

-- 3. Show which record should be "Ongoing" (the latest per farmer)
WITH latest_per_farmer AS (
  SELECT DISTINCT ON (farmer_id)
    farmer_id,
    farmer_name,
    monitoring_id,
    date_of_visit,
    created_at,
    status
  FROM public.monitoring_records
  WHERE farmer_id IS NOT NULL
  ORDER BY farmer_id, created_at DESC
)
SELECT 
  farmer_name,
  monitoring_id,
  date_of_visit,
  status,
  CASE 
    WHEN status = 'Ongoing' THEN '✓ CORRECT - Latest is Ongoing'
    ELSE '❌ ERROR - Latest should be Ongoing'
  END as validation
FROM latest_per_farmer
ORDER BY farmer_name;

-- 4. FIX: Reset ALL to Ongoing first, then mark old ones as Done Monitor
-- This ensures we start fresh

-- Step 4a: Set ALL records to Ongoing
UPDATE public.monitoring_records
SET status = 'Ongoing', updated_at = NOW()
WHERE status IN ('Done Monitor', 'Ongoing');

-- Step 4b: Mark old records as Done Monitor (keep only latest as Ongoing)
UPDATE public.monitoring_records mr1
SET status = 'Done Monitor', updated_at = NOW()
WHERE status = 'Ongoing'
  AND farmer_id IS NOT NULL
  AND created_at < (
    SELECT MAX(created_at)
    FROM public.monitoring_records mr2
    WHERE mr2.farmer_id = mr1.farmer_id
      AND mr2.status = 'Ongoing'
  );

-- 5. Verify the fix
SELECT 
  farmer_name,
  monitoring_id,
  date_of_visit,
  status,
  next_monitoring_date,
  created_at,
  CASE 
    WHEN status = 'Ongoing' THEN '✓ Latest - Ongoing'
    WHEN status = 'Done Monitor' THEN '✓ Old - Done Monitor'
    WHEN status = 'Completed' THEN '✓ Final - Completed'
  END as validation
FROM public.monitoring_records
ORDER BY farmer_name, created_at DESC;

-- 6. Final count
SELECT 
  farmer_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'Ongoing') as ongoing,
  COUNT(*) FILTER (WHERE status = 'Done Monitor') as done_monitor
FROM public.monitoring_records
GROUP BY farmer_name
ORDER BY farmer_name;
