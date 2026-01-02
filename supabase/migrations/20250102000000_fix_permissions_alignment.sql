-- ============================================================================
-- FIX: Align permissions with existing system standard (profiles.role)
-- ============================================================================
-- This migration corrects the RLS policies for clients and strategic_plans
-- to use profiles.role instead of user_roles (which doesn't exist)
-- ============================================================================

-- 1. FIX CLIENTS TABLE POLICY
DROP POLICY IF EXISTS "Admins can manage all clients" ON public.clients;

CREATE POLICY "Admins can manage all clients"
  ON public.clients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- 2. FIX STRATEGIC_PLANS TABLE POLICY
DROP POLICY IF EXISTS "Admins can manage all strategic plans" ON strategic_plans;

CREATE POLICY "Admins can manage all strategic plans"
  ON strategic_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Comments
COMMENT ON POLICY "Admins can manage all clients" ON public.clients IS 'Allows admin and super_admin users to perform all operations on clients table';
COMMENT ON POLICY "Admins can manage all strategic plans" ON strategic_plans IS 'Allows admin and super_admin users to perform all operations on strategic_plans table';
