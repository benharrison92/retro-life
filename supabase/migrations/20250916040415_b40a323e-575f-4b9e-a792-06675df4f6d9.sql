-- Update trip planner invitation notification to include related_item_id
CREATE OR REPLACE FUNCTION public.notify_trip_planner_invitation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only create notification for new invitations
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_user_id,
      related_item_id
    )
    SELECT 
      NEW.user_id,
      'trip_planner_invitation',
      'You were invited to join the "' || tp.title || '" trip planner',
      'Click to accept or decline this invitation',
      NEW.invited_by_user_id,
      NEW.trip_planner_id::text
    FROM public.trip_planners tp
    WHERE tp.id = NEW.trip_planner_id;
  END IF;
  
  RETURN NEW;
END;
$function$;