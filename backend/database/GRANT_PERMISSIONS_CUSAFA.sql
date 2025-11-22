-- ============================================
-- GRANT PERMISSIONS ON CUSAFA INVENTORY
-- Allow authenticated users to insert/select
-- ============================================

-- Make sure RLS is disabled
ALTER TABLE public.cusafa_inventory DISABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated role
GRANT ALL ON public.cusafa_inventory TO authenticated;
GRANT ALL ON public.cusafa_inventory TO anon;

-- Grant usage on sequence (for UUID generation)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Verify
SELECT 
  tablename,
  rowsecurity,
  tableowner
FROM pg_tables 
WHERE tablename = 'cusafa_inventory';

SELECT '✅ Permissions granted on cusafa_inventory!' as status;
