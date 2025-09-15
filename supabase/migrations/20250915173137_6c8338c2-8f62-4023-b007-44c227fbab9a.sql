-- Fix search path for security definer function
CREATE OR REPLACE FUNCTION public.create_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_target_id UUID DEFAULT NULL,
  p_target_type TEXT DEFAULT NULL,
  p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.activities (user_id, activity_type, target_id, target_type, data)
  VALUES (p_user_id, p_activity_type, p_target_id, p_target_type, p_data)
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;