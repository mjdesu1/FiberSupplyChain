-- ============================================
-- Check farmer_id for all records
-- ============================================

-- Show all records with farmer_id
SELECT 
  farmer_name,
  farmer_id,
  monitoring_id,
  date_of_visit,
  status,
  monitored_by
FROM public.monitoring_records
ORDER BY farmer_name, date_of_visit DESC;

-- Count records per farmer_id
SELECT 
  farmer_name,
  farmer_id,
  COUNT(*) as total_records
FROM public.monitoring_records
GROUP BY farmer_name, farmer_id
ORDER BY farmer_name;

-- Check if there are records with NULL farmer_id
SELECT 
  'Records with NULL farmer_id' as check_type,
  COUNT(*) as count
FROM public.monitoring_records
WHERE farmer_id IS NULL;

-- Show records where farmer_name is 'test' or 'cusafa'
SELECT 
  farmer_name,
  farmer_id,
  monitoring_id,
  date_of_visit,
  status
FROM public.monitoring_records
WHERE farmer_name IN ('test', 'cusafa')
ORDER BY farmer_name, date_of_visit DESC;
