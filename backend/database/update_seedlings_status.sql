-- Update seedlings table status values to align with new two-tier distribution system

-- Update any records with old 'distributed' status to new standard
UPDATE public.seedlings 
SET status = 'distributed_to_farmer'
WHERE status = 'distributed';

-- Update any records with NULL status to default value
UPDATE public.seedlings 
SET status = 'distributed_to_farmer'
WHERE status IS NULL;

-- Verify the update
SELECT DISTINCT status FROM public.seedlings ORDER BY status;