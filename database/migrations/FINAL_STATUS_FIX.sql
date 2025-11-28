-- ============================================
-- FINAL STATUS FIX - Run this to fix everything
-- ============================================

-- Step 1: Show current state
SELECT 
  'BEFORE FIX' as step,
  farmer_name,
  monitoring_id,
  date_of_visit,
  status,
  next_monitoring_date,
  created_at
FROM public.monitoring_records
ORDER BY farmer_name, created_at DESC;

-- Step 2: Reset ALL to Ongoing (fresh start)
UPDATE public.monitoring_records
SET status = 'Ongoing', updated_at = NOW()
WHERE status IN ('Done Monitor', 'Ongoing');

-- Step 3: Mark old records as Done Monitor
-- Keep only the LATEST record per farmer as Ongoing
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

-- Step 4: Verify the fix
SELECT 
  'AFTER FIX' as step,
  farmer_name,
  monitoring_id,
  date_of_visit,
  status,
  next_monitoring_date,
  created_at,
  CASE 
    WHEN status = 'Ongoing' THEN '✅ Latest - Ongoing'
    WHEN status = 'Done Monitor' THEN '✅ Old - Done Monitor'
    ELSE '❌ ERROR'
  END as validation
FROM public.monitoring_records
ORDER BY farmer_name, created_at DESC;

-- Step 5: Count per farmer
SELECT 
  farmer_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'Ongoing') as ongoing,
  COUNT(*) FILTER (WHERE status = 'Done Monitor') as done_monitor,
  CASE 
    WHEN COUNT(*) FILTER (WHERE status = 'Ongoing') = 1 THEN '✅ CORRECT'
    ELSE '❌ ERROR - Should have exactly 1 Ongoing'
  END as validation
FROM public.monitoring_records
GROUP BY farmer_name
ORDER BY farmer_name;

-- ============================================
-- EXPECTED RESULT:
-- Each farmer should have exactly 1 "Ongoing" record
-- ============================================
