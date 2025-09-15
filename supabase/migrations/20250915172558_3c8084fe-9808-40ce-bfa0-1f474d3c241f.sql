-- Create activities table for tracking user actions
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  target_id UUID,
  target_type TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policies for activities
CREATE POLICY "Users can create their own activities"
ON public.activities
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their friends' activities"
ON public.activities
FOR SELECT
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM friendships
    WHERE (
      (user_id = auth.uid() AND friend_id = activities.user_id)
      OR (friend_id = auth.uid() AND user_id = activities.user_id)
    )
    AND status = 'accepted'
  )
);

-- Create function to create activity
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

-- Create triggers to automatically create activities
CREATE OR REPLACE FUNCTION public.create_retro_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create activity for new retro
  IF TG_OP = 'INSERT' THEN
    PERFORM public.create_activity(
      NEW.user_id,
      'retro_created',
      NEW.id,
      'retrospective',
      jsonb_build_object('title', NEW.title, 'event_type', NEW.event_type)
    );
  END IF;
  
  -- Create activity for retro updates (roses, buds, thorns)
  IF TG_OP = 'UPDATE' THEN
    -- Check if roses were added
    IF jsonb_array_length(COALESCE(NEW.roses, '[]'::jsonb)) > jsonb_array_length(COALESCE(OLD.roses, '[]'::jsonb)) THEN
      PERFORM public.create_activity(
        NEW.user_id,
        'rose_added',
        NEW.id,
        'retrospective',
        jsonb_build_object('title', NEW.title, 'count', jsonb_array_length(NEW.roses))
      );
    END IF;
    
    -- Check if buds were added
    IF jsonb_array_length(COALESCE(NEW.buds, '[]'::jsonb)) > jsonb_array_length(COALESCE(OLD.buds, '[]'::jsonb)) THEN
      PERFORM public.create_activity(
        NEW.user_id,
        'bud_added',
        NEW.id,
        'retrospective',
        jsonb_build_object('title', NEW.title, 'count', jsonb_array_length(NEW.buds))
      );
    END IF;
    
    -- Check if thorns were added
    IF jsonb_array_length(COALESCE(NEW.thorns, '[]'::jsonb)) > jsonb_array_length(COALESCE(OLD.thorns, '[]'::jsonb)) THEN
      PERFORM public.create_activity(
        NEW.user_id,
        'thorn_added',
        NEW.id,
        'retrospective',
        jsonb_build_object('title', NEW.title, 'count', jsonb_array_length(NEW.thorns))
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER retro_activity_trigger
  AFTER INSERT OR UPDATE ON public.retrospectives
  FOR EACH ROW
  EXECUTE FUNCTION public.create_retro_activity();