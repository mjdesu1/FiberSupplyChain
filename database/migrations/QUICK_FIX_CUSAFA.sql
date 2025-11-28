-- Quick fix for farmer "cusafa" monitoring records
-- This will mark the old Nov 7 record as "Done Monitor"
-- and keep the Nov 27 records as "Ongoing"

-- First, check current status
SELECT 
  farmer_name,
  monitoring_id,
  date_of_visit,
  status,
  next_monitoring_date
FROM public.monitoring_records
WHERE farmer_name = 'cusafa'
ORDER BY date_of_visit DESC;

-- Update: Mark Nov 7 record as "Done Monitor"
-- Keep Nov 27 records as "Ongoing" (they are the latest)
WITH latest_record AS (
  SELECT monitoring_id
  FROM public.monitoring_records
  WHERE farmer_name = 'cusafa'
    AND status = 'Ongoing'
  ORDER BY date_of_visit DESC
  LIMIT 1
)
UPDATE public.monitoring_records
SET 
  status = 'Done Monitor',
  updated_at = NOW()
WHERE 
  farmer_name = 'cusafa'
  AND status = 'Ongoing'
  AND monitoring_id NOT IN (SELECT monitoring_id FROM latest_record);

-- Verify the update
SELECT 
  farmer_name,
  monitoring_id,
  date_of_visit,
  status,
  next_monitoring_date,
  CASE 
    WHEN status = 'Done Monitor' AND date_of_visit < (SELECT MAX(date_of_visit) FROM public.monitoring_records WHERE farmer_name = 'cusafa') 
      THEN '✓ Correct - Old record marked as Done Monitor'
    WHEN status = 'Ongoing' AND date_of_visit = (SELECT MAX(date_of_visit) FROM public.monitoring_records WHERE farmer_name = 'cusafa' AND status = 'Ongoing')
      THEN '✓ Correct - Latest record is Ongoing'
    ELSE '❌ Check this record'
  END as validation
FROM public.monitoring_records
WHERE farmer_name = 'cusafa'
ORDER BY date_of_visit DESC;

-- Expected result:
-- Nov 27, 2025: Ongoing ✓ (latest)
-- Nov 7, 2025: Done Monitor ✓ (old)
