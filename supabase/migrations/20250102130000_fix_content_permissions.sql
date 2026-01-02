-- ============================================================================
-- FIX: Align content permissions (materials, cases, blog_posts) with profiles.role
-- ============================================================================
-- The previous migration restricted access to 'super_admin' only. 
-- This fix broadens it to 'admin' as well, ensuring you can edit content.
-- ============================================================================

-- 1. FIX MATERIALS
DROP POLICY IF EXISTS "Super admin can insert materials" ON public.materials;
DROP POLICY IF EXISTS "Super admin can update materials" ON public.materials;
DROP POLICY IF EXISTS "Super admin can delete materials" ON public.materials;
DROP POLICY IF EXISTS "Admins can manage all materials" ON public.materials;

CREATE POLICY "Admins can manage all materials"
  ON public.materials
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- 2. FIX CASES
DROP POLICY IF EXISTS "Super admin can insert cases" ON public.cases;
DROP POLICY IF EXISTS "Super admin can update cases" ON public.cases;
DROP POLICY IF EXISTS "Super admin can delete cases" ON public.cases;
DROP POLICY IF EXISTS "Admins can manage all cases" ON public.cases;

CREATE POLICY "Admins can manage all cases"
  ON public.cases
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- 3. FIX BLOG POSTS
DROP POLICY IF EXISTS "Super admin can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Super admin can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Super admin can delete blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON public.blog_posts;

CREATE POLICY "Admins can manage all blog posts"
  ON public.blog_posts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
