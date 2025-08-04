-- Create trigger function to notify when friend requests are created
CREATE OR REPLACE FUNCTION public.notify_friend_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only create notification for new friend requests
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_user_id
    )
    SELECT 
      NEW.friend_id,
      'friend_request',
      'New Friend Request',
      'You have a new friend request from ' || up.display_name,
      NEW.user_id
    FROM public.user_profiles up
    WHERE up.id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on friendships table
CREATE TRIGGER on_friend_request_created
  AFTER INSERT ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_friend_request();