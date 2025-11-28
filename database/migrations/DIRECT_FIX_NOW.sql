-- ============================================
-- DIRECT FIX: Update old records for farmer "test"
-- ============================================

-- First, let's see what we have
SELECT 
  farmer_name,
  farmer_id,
  monitoring_id,
  date_of_visit,
  status
FROM public.monitoring_records
WHERE farmer_name = 'test'
ORDER BY date_of_visit DESC;

-- Now, update the OLD record (not the latest)
-- For farmer "test" with farmer_id = 'e17496c1-41bf-4cf0-91c7-ca982d7a7154'
UPDATE public.monitoring_records
SET status = 'Done Monitor', updated_at = NOW()
WHERE farmer_id = 'e17496c1-41bf-4cf0-91c7-ca982d7a7154'
  AND status = 'Ongoing'
  AND date_of_visit < (
    SELECT MAX(date_of_visit)
    FROM public.monitoring_records
    WHERE farmer_id = 'e17496c1-41bf-4cf0-91c7-ca982d7a7154'
      AND status = 'Ongoing'
  );

-- Verify the change
SELECT 
  farmer_name,
  farmer_id,
  monitoring_id,
  date_of_visit,
  status,
  CASE 
    WHEN status = 'Done Monitor' THEN '✓ FIXED - Old record'
    WHEN status = 'Ongoing' THEN '✓ CORRECT - Latest record'
    ELSE '❌ ERROR'
  END as validation
FROM public.monitoring_records
WHERE farmer_name = 'test'
ORDER BY date_of_visit DESC;

-- Also update for ALL farmers at once (universal fix)
UPDATE public.monitoring_records mr1
SET status = 'Done Monitor', updated_at = NOW()
WHERE status = 'Ongoing'
  AND farmer_id IS NOT NULL
  AND date_of_visit < (
    SELECT MAX(date_of_visit)
    FROM public.monitoring_records mr2
    WHERE mr2.farmer_id = mr1.farmer_id
      AND mr2.status = 'Ongoing'
  );

-- Final verification for all farmers
SELECT 
  farmer_name,
  farmer_id,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE status = 'Ongoing') as ongoing_count,
  COUNT(*) FILTER (WHERE status = 'Done Monitor') as done_monitor_count
FROM public.monitoring_records
GROUP BY farmer_name, farmer_id
ORDER BY farmer_name;

-- ============================================
-- EXPECTED RESULT:
-- farmer_name | total_records | ongoing_count | done_monitor_count
-- test        | 2             | 1             | 1
-- ============================================
