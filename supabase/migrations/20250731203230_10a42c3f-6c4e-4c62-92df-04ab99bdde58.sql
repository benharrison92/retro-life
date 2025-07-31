-- Create retro_attendees table for user tagging
CREATE TABLE public.retro_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  retro_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(retro_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.retro_attendees ENABLE ROW LEVEL SECURITY;

-- Create policies for retro_attendees
CREATE POLICY "Users can view attendees of their own retros or retros they're attending" 
ON public.retro_attendees 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.retrospectives 
    WHERE retrospectives.id = retro_attendees.retro_id 
    AND retrospectives.user_id = auth.uid()
  ) 
  OR retro_attendees.user_id = auth.uid()
);

CREATE POLICY "Users can add attendees to their own retros" 
ON public.retro_attendees 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.retrospectives 
    WHERE retrospectives.id = retro_attendees.retro_id 
    AND retrospectives.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove attendees from their own retros" 
ON public.retro_attendees 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.retrospectives 
    WHERE retrospectives.id = retro_attendees.retro_id 
    AND retrospectives.user_id = auth.uid()
  )
);

-- Add index for better performance
CREATE INDEX idx_retro_attendees_retro_id ON public.retro_attendees(retro_id);
CREATE INDEX idx_retro_attendees_user_id ON public.retro_attendees(user_id);

-- Note: We'll keep the existing attendees column for backward compatibility
-- but will migrate to using the new retro_attendees table