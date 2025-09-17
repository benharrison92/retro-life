-- Fix RLS policy to allow friends to comment on retrospectives
-- and update notification types constraint

-- Drop the existing policy that's too restrictive
DROP POLICY IF EXISTS "Attendees can update retros they're part of" ON retrospectives;

-- Create a new policy that allows friends to update retros for commenting
CREATE POLICY "Friends and attendees can update retros for commenting" 
ON retrospectives 
FOR UPDATE 
USING (
  -- Owner can always update
  (auth.uid() = user_id) OR
  -- Attendees can update
  is_retro_attendee(id, auth.uid()) OR
  -- Friends can update for commenting (but only if retro is not private)
  (
    (is_private = false) AND 
    (EXISTS (
      SELECT 1 FROM friendships f
      WHERE (
        ((f.user_id = auth.uid() AND f.friend_id = retrospectives.user_id) OR 
         (f.friend_id = auth.uid() AND f.user_id = retrospectives.user_id)) AND 
        f.status = 'accepted'
      )
    ))
  )
);

-- Check current constraint on notifications table
DO $$
BEGIN
  -- Drop existing check constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'notifications_type_check' 
    AND table_name = 'notifications'
  ) THEN
    ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
  END IF;
  
  -- Create new constraint with comment_tagged type
  ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN (
    'friend_request',
    'catalogue_invitation', 
    'trip_planner_invitation',
    'retro_tagged',
    'comment_tagged'
  ));
END $$;