-- Drop the problematic policy that's causing infinite recursion
DROP POLICY IF EXISTS "Members can view shared catalogues" ON public.catalogues;

-- Drop the catalogue_items policy that may also be problematic
DROP POLICY IF EXISTS "Members can view shared catalogue items" ON public.catalogue_items;
DROP POLICY IF EXISTS "Members can add items to shared catalogues" ON public.catalogue_items;

-- Recreate a simpler, non-recursive policy for shared catalogues
-- This approach avoids recursion by using a direct join instead of EXISTS subquery
CREATE POLICY "Members can view shared catalogues" 
ON public.catalogues 
FOR SELECT 
USING (
  id IN (
    SELECT catalogue_id 
    FROM public.catalogue_members 
    WHERE user_id = auth.uid() 
    AND status = 'accepted'
  )
);

-- Recreate catalogue_items policies with simpler approach
CREATE POLICY "Members can view shared catalogue items" 
ON public.catalogue_items 
FOR SELECT 
USING (
  catalogue_id IN (
    SELECT catalogue_id 
    FROM public.catalogue_members 
    WHERE user_id = auth.uid() 
    AND status = 'accepted'
  )
);

CREATE POLICY "Members can add items to shared catalogues" 
ON public.catalogue_items 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND (
    -- User owns the catalogue
    catalogue_id IN (
      SELECT id FROM public.catalogues WHERE user_id = auth.uid()
    ) OR
    -- User is an accepted member
    catalogue_id IN (
      SELECT catalogue_id 
      FROM public.catalogue_members 
      WHERE user_id = auth.uid() 
      AND status = 'accepted'
    )
  )
);