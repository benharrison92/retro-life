-- Update RLS policy to allow attendees to view retros they're part of, even if private
DROP POLICY IF EXISTS "Friends can view public retrospectives" ON public.retrospectives;

-- Create new policy that allows friends to view public retros AND attendees to view any retro they're part of
CREATE POLICY "Friends can view public retros and attendees can view assigned retros" 
ON public.retrospectives 
FOR SELECT 
USING (
  -- Allow viewing if retro is public and user is a friend
  (
    (is_private = false) AND 
    (EXISTS (
      SELECT 1 FROM friendships 
      WHERE (
        ((friendships.user_id = auth.uid() AND friendships.friend_id = retrospectives.user_id) OR 
         (friendships.friend_id = auth.uid() AND friendships.user_id = retrospectives.user_id)) AND 
        friendships.status = 'accepted'
      )
    ))
  ) 
  OR 
  -- Allow viewing if user is an attendee (regardless of privacy setting)
  is_retro_attendee(id, auth.uid())
);