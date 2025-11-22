-- ============================================
-- TEMPORARY FIX: DISABLE RLS ON CUSAFA INVENTORY
-- Use this if RLS policies are causing issues
-- ============================================

-- Option 1: Disable RLS completely (TEMPORARY - for testing)
ALTER TABLE public.cusafa_inventory DISABLE ROW LEVEL SECURITY;

SELECT '✅ RLS disabled on cusafa_inventory - farmers can now add!' as status;

-- ============================================
-- IMPORTANT: This is a temporary fix for testing!
-- After confirming it works, re-enable RLS with proper policies
-- ============================================
