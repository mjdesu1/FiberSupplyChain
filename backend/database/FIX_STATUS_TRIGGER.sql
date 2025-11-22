-- ============================================
-- FIX: Association Status Not Updating Correctly
-- Issue: Status becomes "cancelled" instead of staying "fully_distributed_to_farmers"
-- ============================================

-- Drop existing triggers
DROP TRIGGER IF EXISTS trigger_update_assoc_status_on_insert ON farmer_seedling_distributions;
DROP TRIGGER IF EXISTS trigger_update_assoc_status_on_update ON farmer_seedling_distributions;
DROP TRIGGER IF EXISTS trigger_update_assoc_status_on_delete ON farmer_seedling_distributions;

-- Recreate the function with better logic
CREATE OR REPLACE FUNCTION update_association_distribution_status()
RETURNS TRIGGER AS $$
DECLARE
  total_distributed INTEGER;
  total_planted INTEGER;
  assoc_quantity INTEGER;
  current_status VARCHAR;
  new_status VARCHAR;
BEGIN
  -- Get the association distribution ID
  DECLARE
    assoc_dist_id UUID;
  BEGIN
    assoc_dist_id := COALESCE(NEW.association_distribution_id, OLD.association_distribution_id);
    
    -- Get current status and quantity
    SELECT status, quantity_distributed 
    INTO current_status, assoc_quantity
    FROM association_seedling_distributions
    WHERE distribution_id = assoc_dist_id;
    
    -- Don't update if status is already 'cancelled'
    IF current_status = 'cancelled' THEN
      RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Calculate total distributed to farmers
    SELECT COALESCE(SUM(quantity_distributed), 0) INTO total_distributed
    FROM farmer_seedling_distributions
    WHERE association_distribution_id = assoc_dist_id
      AND status NOT IN ('cancelled', 'lost');
    
    -- Calculate total planted by farmers
    SELECT COALESCE(SUM(quantity_distributed), 0) INTO total_planted
    FROM farmer_seedling_distributions
    WHERE association_distribution_id = assoc_dist_id
      AND status = 'planted';
    
    -- Determine new status based on distribution and planting progress
    IF total_distributed = 0 THEN
      -- No seedlings distributed to farmers yet
      new_status := 'distributed_to_association';
      
    ELSIF total_distributed >= assoc_quantity THEN
      -- All seedlings distributed to farmers
      IF total_planted >= assoc_quantity THEN
        -- All seedlings planted
        new_status := 'fully_planted';
      ELSIF total_planted > 0 THEN
        -- Some seedlings planted
        new_status := 'partially_planted';
      ELSE
        -- All distributed but none planted yet
        new_status := 'fully_distributed_to_farmers';
      END IF;
      
    ELSE
      -- Partially distributed to farmers
      IF total_planted > 0 THEN
        -- Some seedlings planted
        new_status := 'partially_planted';
      ELSE
        -- Some distributed but none planted yet
        new_status := 'partially_distributed_to_farmers';
      END IF;
    END IF;
    
    -- Only update if status actually changed
    IF new_status IS DISTINCT FROM current_status THEN
      UPDATE association_seedling_distributions
      SET 
        status = new_status,
        updated_at = NOW()
      WHERE distribution_id = assoc_dist_id;
      
      RAISE NOTICE 'Updated association % status from % to %', assoc_dist_id, current_status, new_status;
    END IF;
    
  END;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers
CREATE TRIGGER trigger_update_assoc_status_on_insert
AFTER INSERT ON farmer_seedling_distributions
FOR EACH ROW
EXECUTE FUNCTION update_association_distribution_status();

CREATE TRIGGER trigger_update_assoc_status_on_update
AFTER UPDATE ON farmer_seedling_distributions
FOR EACH ROW
WHEN (
  OLD.status IS DISTINCT FROM NEW.status 
  OR OLD.quantity_distributed IS DISTINCT FROM NEW.quantity_distributed
)
EXECUTE FUNCTION update_association_distribution_status();

CREATE TRIGGER trigger_update_assoc_status_on_delete
AFTER DELETE ON farmer_seedling_distributions
FOR EACH ROW
EXECUTE FUNCTION update_association_distribution_status();

-- ============================================
-- Fix any existing incorrect statuses
-- ============================================

-- Update all association distributions to correct status
DO $$
DECLARE
  assoc_record RECORD;
  total_distributed INTEGER;
  total_planted INTEGER;
  new_status VARCHAR;
BEGIN
  FOR assoc_record IN 
    SELECT distribution_id, quantity_distributed, status
    FROM association_seedling_distributions
    WHERE status != 'cancelled'
  LOOP
    -- Calculate totals for this association distribution
    SELECT COALESCE(SUM(quantity_distributed), 0) INTO total_distributed
    FROM farmer_seedling_distributions
    WHERE association_distribution_id = assoc_record.distribution_id
      AND status NOT IN ('cancelled', 'lost');
    
    SELECT COALESCE(SUM(quantity_distributed), 0) INTO total_planted
    FROM farmer_seedling_distributions
    WHERE association_distribution_id = assoc_record.distribution_id
      AND status = 'planted';
    
    -- Determine correct status
    IF total_distributed = 0 THEN
      new_status := 'distributed_to_association';
    ELSIF total_distributed >= assoc_record.quantity_distributed THEN
      IF total_planted >= assoc_record.quantity_distributed THEN
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
    
    -- Update if different
    IF new_status IS DISTINCT FROM assoc_record.status THEN
      UPDATE association_seedling_distributions
      SET status = new_status, updated_at = NOW()
      WHERE distribution_id = assoc_record.distribution_id;
      
      RAISE NOTICE 'Fixed distribution %: % -> %', 
        assoc_record.distribution_id, assoc_record.status, new_status;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- Verify the fix
-- ============================================

SELECT 
  'Trigger function recreated and existing statuses fixed!' as status;

-- Show current distribution statuses
SELECT 
  asd.distribution_id,
  asd.recipient_association_name,
  asd.quantity_distributed as assoc_qty,
  COALESCE(SUM(fsd.quantity_distributed), 0) as farmer_qty,
  COALESCE(SUM(CASE WHEN fsd.status = 'planted' THEN fsd.quantity_distributed ELSE 0 END), 0) as planted_qty,
  asd.status as current_status
FROM association_seedling_distributions asd
LEFT JOIN farmer_seedling_distributions fsd 
  ON fsd.association_distribution_id = asd.distribution_id
  AND fsd.status NOT IN ('cancelled', 'lost')
GROUP BY asd.distribution_id, asd.recipient_association_name, asd.quantity_distributed, asd.status
ORDER BY asd.date_distributed DESC
LIMIT 10;
