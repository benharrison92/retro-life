-- Fix the notify_catalogue_invitation function to have proper search path
CREATE OR REPLACE FUNCTION public.notify_catalogue_invitation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only create notification for new invitations
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_user_id
    )
    SELECT 
      NEW.user_id,
      'catalogue_invitation',
      'You were invited to join the "' || c.name || '" catalogue',
      'Click to accept or decline this invitation',
      NEW.invited_by_user_id
    FROM public.catalogues c
    WHERE c.id = NEW.catalogue_id;
  END IF;
  
  RETURN NEW;
END;
$function$;