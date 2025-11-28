-- ============================================
-- Show EXACT dates and times for farmer "test"
-- ============================================

SELECT 
  farmer_name,
  monitoring_id,
  date_of_visit,
  created_at,
  status,
  next_monitoring_date
FROM public.monitoring_records
WHERE farmer_id = 'e17496c1-41bf-4cf0-91c7-ca982d7a7154'
ORDER BY date_of_visit DESC, created_at DESC;

-- If both records have the SAME date_of_visit, we need to use created_at instead
-- Let's update based on created_at (older created_at = older record)
UPDATE public.monitoring_records
SET status = 'Done Monitor', updated_at = NOW()
WHERE farmer_id = 'e17496c1-41bf-4cf0-91c7-ca982d7a7154'
  AND status = 'Ongoing'
  AND created_at < (
    SELECT MAX(created_at)
    FROM public.monitoring_records
    WHERE farmer_id = 'e17496c1-41bf-4cf0-91c7-ca982d7a7154'
      AND status = 'Ongoing'
  );

-- Verify
SELECT 
  farmer_name,
  monitoring_id,
  date_of_visit,
  created_at,
  status,
  CASE 
    WHEN status = 'Done Monitor' THEN '✓ OLD - Done Monitor'
    WHEN status = 'Ongoing' THEN '✓ LATEST - Ongoing'
  END as validation
FROM public.monitoring_records
WHERE farmer_id = 'e17496c1-41bf-4cf0-91c7-ca982d7a7154'
ORDER BY created_at DESC;

-- Universal fix for ALL farmers using created_at
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

-- Final check
SELECT 
  farmer_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'Ongoing') as ongoing,
  COUNT(*) FILTER (WHERE status = 'Done Monitor') as done_monitor
FROM public.monitoring_records
WHERE farmer_id = 'e17496c1-41bf-4cf0-91c7-ca982d7a7154'
GROUP BY farmer_name;
