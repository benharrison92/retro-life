-- Add RLS policy to allow catalogue members to view shared catalogues
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