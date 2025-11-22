-- URGENT FIX: Run this in Supabase SQL Editor to fix the "Failed to mark as planted" error
-- This updates the database constraint to accept the new planted statuses

-- Drop existing constraint
ALTER TABLE public.association_seedling_distributions 
DROP CONSTRAINT IF EXISTS association_seedling_distributions_status_check;

-- Add new constraint with planted statuses
ALTER TABLE public.association_seedling_distributions 
ADD CONSTRAINT association_seedling_distributions_status_check 
CHECK (
  (status)::text = ANY (
    (ARRAY[
      'distributed_to_association'::character varying,
      'partially_distributed_to_farmers'::character varying,
      'fully_distributed_to_farmers'::character varying,
      'partially_planted'::character varying,
      'fully_planted'::character varying,
      'cancelled'::character varying
    ])::text[]
  )
);

-- Create trigger function
CREATE OR REPLACE FUNCTION update_association_distribution_status()
RETURNS TRIGGER AS $$
DECLARE
  total_distributed INTEGER;
  total_planted INTEGER;
  assoc_quantity INTEGER;
  new_status VARCHAR;
BEGIN
  -- Get the association distribution quantity
  SELECT quantity_distributed INTO assoc_quantity
  FROM association_seedling_distributions
  WHERE distribution_id = COALESCE(NEW.association_distribution_id, OLD.association_distribution_id);

  -- Calculate total distributed to farmers
  SELECT COALESCE(SUM(quantity_distributed), 0) INTO total_distributed
  FROM farmer_seedling_distributions
  WHERE association_distribution_id = COALESCE(NEW.association_distribution_id, OLD.association_distribution_id);

  -- Calculate total planted by farmers
  SELECT COALESCE(SUM(quantity_distributed), 0) INTO total_planted
  FROM farmer_seedling_distributions
  WHERE association_distribution_id = COALESCE(NEW.association_distribution_id, OLD.association_distribution_id)
    AND status = 'planted';

  -- Determine new status based on distribution and planting progress
  IF total_distributed = 0 THEN
    new_status := 'distributed_to_association';
  ELSIF total_distributed >= assoc_quantity THEN
    IF total_planted >= assoc_quantity THEN
      new_status := 'fully_planted';
    ELSIF total_planted > 0 THEN
      new_status := 'partially_planted';
    ELSE
      new_status := 'fully_distributed_to_farmers';
    END IF;
  ELSE
    IF total_planted > 0 THEN
      new_status := 'partially_planted';
    ELSE
      new_status := 'partially_distributed_to_farmers';
    END IF;
  END IF;

  -- Update the association distribution
  UPDATE association_seedling_distributions
  SET 
    status = new_status,
    updated_at = NOW()
  WHERE distribution_id = COALESCE(NEW.association_distribution_id, OLD.association_distribution_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_assoc_status_on_insert ON farmer_seedling_distributions;
CREATE TRIGGER trigger_update_assoc_status_on_insert
AFTER INSERT ON farmer_seedling_distributions
FOR EACH ROW
EXECUTE FUNCTION update_association_distribution_status();

DROP TRIGGER IF EXISTS trigger_update_assoc_status_on_update ON farmer_seedling_distributions;
CREATE TRIGGER trigger_update_assoc_status_on_update
AFTER UPDATE ON farmer_seedling_distributions
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.quantity_distributed IS DISTINCT FROM NEW.quantity_distributed)
EXECUTE FUNCTION update_association_distribution_status();

DROP TRIGGER IF EXISTS trigger_update_assoc_status_on_delete ON farmer_seedling_distributions;
CREATE TRIGGER trigger_update_assoc_status_on_delete
AFTER DELETE ON farmer_seedling_distributions
FOR EACH ROW
EXECUTE FUNCTION update_association_distribution_status();

-- Verify
SELECT 'Migration completed successfully!' as status;
