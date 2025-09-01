-- Drop and recreate the is_retro_attendee function to fix the SELECT issue
DROP FUNCTION IF EXISTS public.is_retro_attendee(uuid, uuid);

CREATE OR REPLACE FUNCTION public.is_retro_attendee(retro_uuid uuid, user_uuid uuid)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is the retro owner
  IF EXISTS (
    SELECT 1 FROM retrospectives 
    WHERE id = retro_uuid AND user_id = user_uuid
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is in attendees array
  IF EXISTS (
    SELECT 1 FROM retrospectives 
    WHERE id = retro_uuid AND user_uuid::text = ANY(attendees)
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is a tagged attendee
  IF EXISTS (
    SELECT 1 FROM retro_attendees ra
    WHERE ra.retro_id = retro_uuid AND ra.user_id = user_uuid
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Also fix the are_users_friends function
DROP FUNCTION IF EXISTS public.are_users_friends(uuid, uuid);

CREATE OR REPLACE FUNCTION public.are_users_friends(user1_uuid uuid, user2_uuid uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM friendships
    WHERE ((user_id = user1_uuid AND friend_id = user2_uuid) 
           OR (user_id = user2_uuid AND friend_id = user1_uuid))
    AND status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;