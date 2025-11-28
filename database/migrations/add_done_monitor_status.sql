-- Add "Done Monitor" status to monitoring_records
-- This migration adds the "Done Monitor" status option to the status check constraint

-- Drop the existing constraint
ALTER TABLE public.monitoring_records 
DROP CONSTRAINT IF EXISTS monitoring_records_status_check;

-- Add the new constraint with "Done Monitor" status
ALTER TABLE public.monitoring_records 
ADD CONSTRAINT monitoring_records_status_check 
CHECK (
  status::text = ANY (
    ARRAY[
      'Ongoing'::character varying,
      'Completed'::character varying,
      'Done Monitor'::character varying
    ]::text[]
  )
);

-- Update the check constraint - only Completed status should have no next_monitoring_date
-- Done Monitor can keep its next_monitoring_date (it's old data with a new monitoring record)
ALTER TABLE public.monitoring_records 
DROP CONSTRAINT IF EXISTS check_completed_no_next_date;

ALTER TABLE public.monitoring_records 
ADD CONSTRAINT check_completed_no_next_date 
CHECK (
  (
    (status::text <> 'Completed')
    OR (next_monitoring_date IS NULL)
  )
);

-- Create a function to automatically mark old records as "Done Monitor"
-- This works PER FARMER basis - each farmer has their own monitoring history
CREATE OR REPLACE FUNCTION mark_old_monitoring_as_done()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new monitoring record is inserted for a farmer
  -- Mark all previous "Ongoing" records for that SAME farmer as "Done Monitor"
  -- Uses farmer_name to match records (works even if farmer_id is NULL)
  UPDATE public.monitoring_records
  SET 
    status = 'Done Monitor',
    updated_at = NOW()
  WHERE 
    farmer_name = NEW.farmer_name
    AND status = 'Ongoing'
    AND monitoring_id != NEW.monitoring_id
    AND date_of_visit < NEW.date_of_visit;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_old_monitoring_as_done() IS 
'Automatically marks previous Ongoing monitoring records as Done Monitor when a new record is created for the same farmer. Works per farmer basis using farmer_name.';

-- Create trigger to automatically mark old records as done
DROP TRIGGER IF EXISTS auto_mark_old_monitoring_done ON public.monitoring_records;

CREATE TRIGGER auto_mark_old_monitoring_done
AFTER INSERT ON public.monitoring_records
FOR EACH ROW
EXECUTE FUNCTION mark_old_monitoring_as_done();

COMMENT ON FUNCTION mark_old_monitoring_as_done() IS 'Automatically marks previous monitoring records as Done Monitor when a new record is created for the same farmer';
