-- ============================================
-- CUSAFA INVENTORY SYSTEM
-- Stores verified abaca fiber harvests from farmers
-- ============================================

-- Create CUSAFA inventory table
CREATE TABLE IF NOT EXISTS public.cusafa_inventory (
  inventory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  harvest_id UUID NOT NULL REFERENCES public.harvests(harvest_id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.farmers(farmer_id) ON DELETE CASCADE,
  
  -- Harvest details (copied from harvest record)
  variety VARCHAR NOT NULL,
  quantity_kg DECIMAL(10, 2) NOT NULL,
  harvest_date DATE NOT NULL,
  grade VARCHAR,
  
  -- Inventory tracking
  status VARCHAR DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'sold', 'processed', 'damaged')),
  location VARCHAR DEFAULT 'CUSAFA Warehouse',
  shelf_number VARCHAR,
  
  -- Added by
  added_by UUID REFERENCES public.association_officers(officer_id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate entries
  CONSTRAINT unique_harvest_inventory UNIQUE(harvest_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cusafa_inventory_farmer ON public.cusafa_inventory(farmer_id);
CREATE INDEX IF NOT EXISTS idx_cusafa_inventory_harvest ON public.cusafa_inventory(harvest_id);
CREATE INDEX IF NOT EXISTS idx_cusafa_inventory_status ON public.cusafa_inventory(status);
CREATE INDEX IF NOT EXISTS idx_cusafa_inventory_variety ON public.cusafa_inventory(variety);
CREATE INDEX IF NOT EXISTS idx_cusafa_inventory_date ON public.cusafa_inventory(harvest_date);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_cusafa_inventory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cusafa_inventory_updated ON public.cusafa_inventory;
CREATE TRIGGER trigger_cusafa_inventory_updated
BEFORE UPDATE ON public.cusafa_inventory
FOR EACH ROW
EXECUTE FUNCTION update_cusafa_inventory_timestamp();

-- Enable RLS
ALTER TABLE public.cusafa_inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "MAO officers can view all inventory" ON public.cusafa_inventory;
CREATE POLICY "MAO officers can view all inventory"
ON public.cusafa_inventory FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.association_officers
    WHERE officer_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "MAO officers can insert inventory" ON public.cusafa_inventory;
CREATE POLICY "MAO officers can insert inventory"
ON public.cusafa_inventory FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.association_officers
    WHERE officer_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "MAO officers can update inventory" ON public.cusafa_inventory;
CREATE POLICY "MAO officers can update inventory"
ON public.cusafa_inventory FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.association_officers
    WHERE officer_id = auth.uid()
  )
);

-- Verify
SELECT 'CUSAFA inventory table created successfully!' as status;

-- Show structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'cusafa_inventory'
ORDER BY ordinal_position;
