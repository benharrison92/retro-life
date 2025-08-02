-- Drop the old restrictive policy
DROP POLICY "Users can add attendees to their own retros" ON public.retro_attendees;