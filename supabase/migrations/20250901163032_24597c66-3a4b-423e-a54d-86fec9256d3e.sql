-- Replace the function content to fix the SELECT issue while keeping the same signature
CREATE OR REPLACE FUNCTION public.is_retro_attendee(retro_uuid uuid, user_uuid uuid)
RETURNS BOOLEAN AS $$
DECLARE
  is_owner BOOLEAN := FALSE;
  is_attendee BOOLEAN := FALSE;
  is_tagged BOOLEAN := FALSE;
BEGIN
  -- Check if user is the retro owner
  SELECT EXISTS (
    SELECT 1 FROM retrospectives 
    WHERE id = retro_uuid AND user_id = user_uuid
  ) INTO is_owner;
  
  IF is_owner THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is in attendees array
  SELECT EXISTS (
    SELECT 1 FROM retrospectives 
    WHERE id = retro_uuid AND user_uuid::text = ANY(attendees)
  ) INTO is_attendee;
  
  IF is_attendee THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is a tagged attendee
  SELECT EXISTS (
    SELECT 1 FROM retro_attendees ra
    WHERE ra.retro_id = retro_uuid AND ra.user_id = user_uuid
  ) INTO is_tagged;
  
  IF is_tagged THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Also fix the are_users_friends function
CREATE OR REPLACE FUNCTION public.are_users_friends(user1_uuid uuid, user2_uuid uuid)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN := FALSE;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM friendships
    WHERE ((user_id = user1_uuid AND friend_id = user2_uuid) 
           OR (user_id = user2_uuid AND friend_id = user1_uuid))
    AND status = 'accepted'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;