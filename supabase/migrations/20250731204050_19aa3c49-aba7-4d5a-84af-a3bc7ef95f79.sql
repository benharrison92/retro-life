-- Add author tracking to R/B/T items
-- We'll need to modify the jsonb structure to include author information
-- First, let's add a helper function to check if user is attendee of a retro

CREATE OR REPLACE FUNCTION public.is_retro_attendee(retro_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is the retro owner
  IF EXISTS (
    SELECT 1 FROM public.retrospectives 
    WHERE id = retro_uuid AND user_id = user_uuid
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is in retro_attendees table
  IF EXISTS (
    SELECT 1 FROM public.retro_attendees 
    WHERE retro_id = retro_uuid AND user_id = user_uuid
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Add policy for attendees to update retros (for adding their own R/B/T items)
CREATE POLICY "Attendees can update retros they're part of" 
ON public.retrospectives 
FOR UPDATE 
USING (public.is_retro_attendee(id, auth.uid()));

-- Note: R/B/T items will now include author_id and author_name fields in the jsonb structure