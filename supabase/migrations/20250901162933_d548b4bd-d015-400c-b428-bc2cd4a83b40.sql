-- Fix the is_retro_attendee function to handle SELECT properly
CREATE OR REPLACE FUNCTION public.is_retro_attendee(retro_id uuid, user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is the retro owner
  IF EXISTS (
    SELECT 1 FROM retrospectives 
    WHERE id = retro_id AND retrospectives.user_id = user_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is in attendees array
  IF EXISTS (
    SELECT 1 FROM retrospectives 
    WHERE id = retro_id AND user_id::text = ANY(attendees)
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is a tagged attendee
  IF EXISTS (
    SELECT 1 FROM retro_attendees ra
    WHERE ra.retro_id = retro_id AND ra.user_id = user_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Also fix the are_users_friends function if it exists and has similar issues
CREATE OR REPLACE FUNCTION public.are_users_friends(user1_id uuid, user2_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM friendships
    WHERE ((user_id = user1_id AND friend_id = user2_id) 
           OR (user_id = user2_id AND friend_id = user1_id))
    AND status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Fix the is_catalogue_member function if it exists
CREATE OR REPLACE FUNCTION public.is_catalogue_member(catalogue_id uuid, user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is the catalogue owner
  IF EXISTS (
    SELECT 1 FROM catalogues 
    WHERE id = catalogue_id AND catalogues.user_id = user_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is an accepted member
  IF EXISTS (
    SELECT 1 FROM catalogue_members
    WHERE catalogue_members.catalogue_id = catalogue_id 
    AND catalogue_members.user_id = user_id 
    AND status = 'accepted'
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;