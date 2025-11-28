-- Manual update script to mark existing old records as "Done Monitor"
-- Run this AFTER running add_done_monitor_status.sql
-- This is a one-time script to fix existing data

-- Step 1: First, run the main migration if you haven't already
-- (See add_done_monitor_status.sql)

-- Step 2: Update old "Ongoing" records to "Done Monitor"
-- For EACH FARMER, mark all "Ongoing" records except the latest one as "Done Monitor"
-- This is done PER FARMER basis, so each farmer has their own latest record

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

-- Alternative: If you have farmer_id, use this instead:
-- WITH latest_records_per_farmer AS (
--   SELECT DISTINCT ON (farmer_id)
--     monitoring_id,
--     farmer_id,
--     date_of_visit
--   FROM public.monitoring_records
--   WHERE status = 'Ongoing'
--     AND farmer_id IS NOT NULL
--   ORDER BY farmer_id, date_of_visit DESC
-- )
-- UPDATE public.monitoring_records
-- SET 
--   status = 'Done Monitor',
--   updated_at = NOW()
-- WHERE 
--   status = 'Ongoing'
--   AND farmer_id IS NOT NULL
--   AND monitoring_id NOT IN (SELECT monitoring_id FROM latest_records_per_farmer);

-- Show results
SELECT 
  farmer_name,
  monitoring_id,
  date_of_visit,
  status,
  next_monitoring_date
FROM public.monitoring_records
WHERE farmer_id IS NOT NULL
ORDER BY farmer_name, date_of_visit DESC;

-- Summary
SELECT 
  status,
  COUNT(*) as count
FROM public.monitoring_records
GROUP BY status
ORDER BY status;
