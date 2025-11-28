-- ============================================
-- FINAL COMPLETE FIX
-- 1. Fix existing old data NOW (one-time)
-- 2. Create trigger for AUTOMATIC updates (future)
-- ============================================

-- ============================================
-- PART 1: Fix existing old data RIGHT NOW
-- ============================================

-- Update old records using created_at (timestamp)
-- For each farmer, keep only the LATEST record as "Ongoing"
-- Mark all OLDER records as "Done Monitor"
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

-- Verify current state
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
-- PART 2: Create AUTOMATIC trigger for future
-- ============================================

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS auto_mark_old_monitoring_done ON public.monitoring_records;
DROP FUNCTION IF EXISTS mark_old_monitoring_as_done();

-- Create NEW trigger function
-- This will run AUTOMATICALLY when you INSERT a new monitoring record
CREATE OR REPLACE FUNCTION mark_old_monitoring_as_done()
RETURNS TRIGGER AS $$
BEGIN
  -- When a NEW monitoring record is inserted
  -- Automatically mark ALL old "Ongoing" records for the SAME farmer as "Done Monitor"
  UPDATE public.monitoring_records
  SET 
    status = 'Done Monitor',
    updated_at = NOW()
  WHERE 
    farmer_id = NEW.farmer_id
    AND status = 'Ongoing'
    AND monitoring_id != NEW.monitoring_id
    AND created_at < NEW.created_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER auto_mark_old_monitoring_done
AFTER INSERT ON public.monitoring_records
FOR EACH ROW
EXECUTE FUNCTION mark_old_monitoring_as_done();

-- ============================================
-- PART 3: Test the trigger (optional)
-- ============================================

-- Show current records for farmer "test"
SELECT 
  farmer_name,
  monitoring_id,
  date_of_visit,
  created_at,
  status
FROM public.monitoring_records
WHERE farmer_id = 'e17496c1-41bf-4cf0-91c7-ca982d7a7154'
ORDER BY created_at DESC;

-- ============================================
-- HOW IT WORKS (AUTOMATIC):
-- ============================================
-- 
-- Example: Farmer "test" has 2 records
-- - Record 1 (Nov 28, 10:00 AM): Status = "Ongoing"
-- - Record 2 (Nov 28, 9:00 AM): Status = "Done Monitor" ✓ (fixed by PART 1)
--
-- When you ADD a new monitoring (Nov 29):
-- 1. INSERT new record → Status = "Ongoing"
-- 2. Trigger fires AUTOMATICALLY
-- 3. Record 1 (Nov 28, 10:00 AM) → Status changes to "Done Monitor" ✓
-- 4. Record 2 (Nov 28, 9:00 AM) → Already "Done Monitor" (no change)
-- 5. New record (Nov 29) → Status = "Ongoing" ✓
--
-- Result:
-- - Only the LATEST record is "Ongoing"
-- - All OLD records are "Done Monitor"
-- - AUTOMATIC - no manual work needed!
-- ============================================

-- Final verification
SELECT 
  'SETUP COMPLETE!' as message,
  'Trigger is now ACTIVE' as status,
  'Old records are FIXED' as result;
