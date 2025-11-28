-- ============================================
-- DIAGNOSTIC: Check what's actually in the database
-- ============================================

-- 1. Show ALL monitoring records
SELECT 
  monitoring_id,
  farmer_name,
  date_of_visit,
  status,
  next_monitoring_date,
  created_at
FROM public.monitoring_records
ORDER BY farmer_name, date_of_visit DESC;

-- 2. Count records per farmer
SELECT 
  farmer_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE status = 'Ongoing') as ongoing_count,
  COUNT(*) FILTER (WHERE status = 'Done Monitor') as done_monitor_count,
  COUNT(*) FILTER (WHERE status = 'Completed') as completed_count
FROM public.monitoring_records
GROUP BY farmer_name
ORDER BY farmer_name;

-- 3. Show records for specific farmers
SELECT 
  farmer_name,
  monitoring_id,
  date_of_visit,
  status,
  next_monitoring_date
FROM public.monitoring_records
WHERE farmer_name IN ('test', 'cusafa', 'reyn')
ORDER BY farmer_name, date_of_visit DESC;

-- 4. Check if old records exist
SELECT 
  'Old records (before Nov 28)' as check_type,
  COUNT(*) as count
FROM public.monitoring_records
WHERE date_of_visit < '2025-11-28';

-- 5. Check farmer_id for 'test' and 'cusafa'
SELECT DISTINCT
  farmer_name,
  farmer_id
FROM public.monitoring_records
WHERE farmer_name IN ('test', 'cusafa')
ORDER BY farmer_name;
