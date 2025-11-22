-- ============================================
-- FIX CUSAFA INVENTORY RLS POLICIES
-- Allow farmers to add their own verified harvests
-- ============================================

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "MAO officers can insert inventory" ON public.cusafa_inventory;
DROP POLICY IF EXISTS "Allow farmers and MAO to insert inventory" ON public.cusafa_inventory;

-- Simple policy: Allow authenticated users to insert if they are the farmer
CREATE POLICY "cusafa_inventory_insert_policy"
ON public.cusafa_inventory FOR INSERT
TO authenticated
WITH CHECK (
  -- Check if user is the farmer who owns this harvest
  farmer_id = auth.uid()
  OR
  -- OR if user is a MAO officer
  EXISTS (
    SELECT 1 FROM public.association_officers
    WHERE officer_id = auth.uid()
  )
);

-- Drop ALL existing SELECT policies
DROP POLICY IF EXISTS "MAO officers can view all inventory" ON public.cusafa_inventory;
DROP POLICY IF EXISTS "Farmers can view their own inventory" ON public.cusafa_inventory;

-- Simple SELECT policy
CREATE POLICY "cusafa_inventory_select_policy"
ON public.cusafa_inventory FOR SELECT
TO authenticated
USING (
  -- Farmers can see their own inventory
  farmer_id = auth.uid()
  OR
  -- MAO officers can see all
  EXISTS (
    SELECT 1 FROM public.association_officers
    WHERE officer_id = auth.uid()
  )
);

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'cusafa_inventory'
ORDER BY policyname;

SELECT '✅ CUSAFA inventory RLS policies updated successfully!' as status;
