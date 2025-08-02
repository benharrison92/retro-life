-- Drop the problematic policy that's causing infinite recursion
DROP POLICY IF EXISTS "Members can view shared catalogues" ON public.catalogues;

-- Create a security definer function to check if user is a catalogue member
CREATE OR REPLACE FUNCTION public.is_catalogue_member(catalogue_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is in catalogue_members table as accepted member
  IF EXISTS (
    SELECT 1 FROM public.catalogue_members 
    WHERE catalogue_id = catalogue_uuid 
    AND user_id = user_uuid 
    AND status = 'accepted'
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Create new policy using the security definer function
CREATE POLICY "Members can view shared catalogues" 
ON public.catalogues 
FOR SELECT 
USING (public.is_catalogue_member(id, auth.uid()));