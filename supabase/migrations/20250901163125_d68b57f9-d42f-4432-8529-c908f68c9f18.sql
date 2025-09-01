-- Fix the is_retro_attendee function with proper SELECT handling
CREATE OR REPLACE FUNCTION public.is_retro_attendee(retro_uuid uuid, user_uuid uuid)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN := FALSE;
BEGIN
  -- Check if user is the retro owner
  SELECT EXISTS (
    SELECT 1 FROM retrospectives 
    WHERE id = retro_uuid AND user_id = user_uuid
  ) INTO result;
  
  IF result THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is in attendees array
  SELECT EXISTS (
    SELECT 1 FROM retrospectives 
    WHERE id = retro_uuid AND user_uuid::text = ANY(attendees)
  ) INTO result;
  
  IF result THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is a tagged attendee
  SELECT EXISTS (
    SELECT 1 FROM retro_attendees ra
    WHERE ra.retro_id = retro_uuid AND ra.user_id = user_uuid
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Fix the are_users_friends function with correct parameter names
CREATE OR REPLACE FUNCTION public.are_users_friends(_user1 uuid, _user2 uuid)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN := FALSE;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM friendships
    WHERE ((user_id = _user1 AND friend_id = _user2) 
           OR (user_id = _user2 AND friend_id = _user1))
    AND status = 'accepted'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Fix the is_catalogue_member function
CREATE OR REPLACE FUNCTION public.is_catalogue_member(catalogue_uuid uuid, user_uuid uuid)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN := FALSE;
BEGIN
  -- Check if user is the catalogue owner
  SELECT EXISTS (
    SELECT 1 FROM catalogues 
    WHERE id = catalogue_uuid AND user_id = user_uuid
  ) INTO result;
  
  IF result THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is an accepted member
  SELECT EXISTS (
    SELECT 1 FROM catalogue_members
    WHERE catalogue_id = catalogue_uuid 
    AND catalogue_members.user_id = user_uuid 
    AND status = 'accepted'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;