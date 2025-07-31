-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('retro_tagged', 'comment_added', 'friend_request')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  related_retro_id uuid,
  related_user_id uuid,
  related_item_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Add foreign key constraints
ALTER TABLE public.notifications 
ADD CONSTRAINT fk_notifications_user_id 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.notifications 
ADD CONSTRAINT fk_notifications_related_retro_id 
FOREIGN KEY (related_retro_id) REFERENCES retrospectives(id) ON DELETE CASCADE;

ALTER TABLE public.notifications 
ADD CONSTRAINT fk_notifications_related_user_id 
FOREIGN KEY (related_user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Create trigger for updated_at
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create notification for retro tagging
CREATE OR REPLACE FUNCTION public.notify_retro_tagged()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Get retro details
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    related_retro_id,
    related_user_id
  )
  SELECT 
    NEW.user_id,
    'retro_tagged',
    'Tagged in Retrospective',
    'You were tagged in "' || r.title || '"',
    NEW.retro_id,
    r.user_id
  FROM retrospectives r
  WHERE r.id = NEW.retro_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for retro tagging notifications
CREATE TRIGGER trigger_notify_retro_tagged
AFTER INSERT ON public.retro_attendees
FOR EACH ROW
EXECUTE FUNCTION public.notify_retro_tagged();

-- Enable realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;