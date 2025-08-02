-- Allow attendees to add other attendees to retros they're part of
CREATE POLICY "Attendees can add other attendees to retros they're part of"
ON public.retro_attendees
FOR INSERT
WITH CHECK (
  -- Check if the user adding attendees is either the retro owner OR an existing attendee
  (EXISTS ( 
    SELECT 1 FROM public.retrospectives 
    WHERE ((retrospectives.id = retro_attendees.retro_id) AND (retrospectives.user_id = auth.uid()))
  )) OR
  (EXISTS (
    SELECT 1 FROM public.retro_attendees existing_attendee
    WHERE existing_attendee.retro_id = retro_attendees.retro_id 
    AND existing_attendee.user_id = auth.uid()
  )) OR
  -- Also allow if the user can edit the retro (attendee permission)
  is_retro_attendee(retro_attendees.retro_id, auth.uid())
);