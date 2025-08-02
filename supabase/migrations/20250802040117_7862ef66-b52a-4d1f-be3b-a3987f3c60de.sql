-- Update the "Friends can view retrospectives" policy to respect privacy settings
-- First, drop the existing policy
DROP POLICY IF EXISTS "Friends can view retrospectives" ON public.retrospectives;

-- Create new policy that only allows friends to view public (non-private) retrospectives
CREATE POLICY "Friends can view public retrospectives" 
ON public.retrospectives 
FOR SELECT 
USING (
  is_private = false 
  AND EXISTS (
    SELECT 1
    FROM friendships
    WHERE (
      ((friendships.user_id = auth.uid() AND friendships.friend_id = retrospectives.user_id) 
       OR (friendships.friend_id = auth.uid() AND friendships.user_id = retrospectives.user_id)) 
      AND friendships.status = 'accepted'
    )
  )
);