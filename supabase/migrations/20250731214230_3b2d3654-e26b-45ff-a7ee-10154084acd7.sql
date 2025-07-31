-- Remove ALL policies on catalogues table to eliminate recursion
DROP POLICY IF EXISTS "Users can view their own catalogues" ON public.catalogues;
DROP POLICY IF EXISTS "Users can create their own catalogues" ON public.catalogues;
DROP POLICY IF EXISTS "Users can update their own catalogues" ON public.catalogues;
DROP POLICY IF EXISTS "Users can delete their own catalogues" ON public.catalogues;
DROP POLICY IF EXISTS "Members can view shared catalogues" ON public.catalogues;

-- Recreate basic policies for catalogues table without any cross-references
CREATE POLICY "Users can view their own catalogues" 
ON public.catalogues 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own catalogues" 
ON public.catalogues 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own catalogues" 
ON public.catalogues 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own catalogues" 
ON public.catalogues 
FOR DELETE 
USING (auth.uid() = user_id);

-- For now, we'll skip the shared catalogues policy to get basic functionality working
-- We can add it back later with a proper security definer function approach