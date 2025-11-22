-- QUICK FIX: Stop status from changing to cancelled
-- Run this in Supabase SQL Editor

-- 1. Fix all cancelled statuses back to correct status
UPDATE association_seedling_distributions asd
SET status = (
  CASE 
    WHEN (
      SELECT COALESCE(SUM(quantity_distributed), 0)
      FROM farmer_seedling_distributions
      WHERE association_distribution_id = asd.distribution_id
    ) >= asd.quantity_distributed THEN 'fully_distributed_to_farmers'
    WHEN (
      SELECT COALESCE(SUM(quantity_distributed), 0)
      FROM farmer_seedling_distributions
      WHERE association_distribution_id = asd.distribution_id
    ) > 0 THEN 'partially_distributed_to_farmers'
    ELSE 'distributed_to_association'
  END
),
updated_at = NOW()
WHERE status = 'cancelled';

-- 2. Recreate trigger function (simplified)
CREATE OR REPLACE FUNCTION update_association_distribution_status()
RETURNS TRIGGER AS $$
DECLARE
  total_distributed INTEGER;
  assoc_quantity INTEGER;
  new_status VARCHAR;
BEGIN
  -- Get association quantity
  SELECT quantity_distributed INTO assoc_quantity
  FROM association_seedling_distributions
  WHERE distribution_id = COALESCE(NEW.association_distribution_id, OLD.association_distribution_id);
  
  -- Calculate total distributed to farmers
  SELECT COALESCE(SUM(quantity_distributed), 0) INTO total_distributed
  FROM farmer_seedling_distributions
  WHERE association_distribution_id = COALESCE(NEW.association_distribution_id, OLD.association_distribution_id);
  
  -- Determine status
  IF total_distributed = 0 THEN
    new_status := 'distributed_to_association';
  ELSIF total_distributed >= assoc_quantity THEN
    new_status := 'fully_distributed_to_farmers';
  ELSE
    new_status := 'partially_distributed_to_farmers';
  END IF;
  
  -- Update
  UPDATE association_seedling_distributions
  SET status = new_status, updated_at = NOW()
  WHERE distribution_id = COALESCE(NEW.association_distribution_id, OLD.association_distribution_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 3. Verify
SELECT 
  recipient_association_name,
  quantity_distributed,
  status
FROM association_seedling_distributions
ORDER BY date_distributed DESC
LIMIT 5;
