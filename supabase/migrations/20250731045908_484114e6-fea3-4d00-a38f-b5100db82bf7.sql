-- Create feedback_spaces table for events that can collect retros
CREATE TABLE public.feedback_spaces (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  location_name text,
  city text,
  state text,
  country text DEFAULT 'US',
  latitude numeric,
  longitude numeric,
  unique_code text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback_spaces ENABLE ROW LEVEL SECURITY;

-- Create policies for feedback_spaces
CREATE POLICY "Anyone can view active feedback spaces"
ON public.feedback_spaces
FOR SELECT
USING (is_active = true);

CREATE POLICY "Owners can create feedback spaces"
ON public.feedback_spaces
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their feedback spaces"
ON public.feedback_spaces
FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their feedback spaces"
ON public.feedback_spaces
FOR DELETE
USING (auth.uid() = owner_id);

-- Add feedback_space_id to retrospectives table
ALTER TABLE public.retrospectives 
ADD COLUMN feedback_space_id uuid REFERENCES public.feedback_spaces(id);

-- Update retrospectives RLS to allow viewing retros in feedback spaces
CREATE POLICY "Anyone can view retros in feedback spaces"
ON public.retrospectives
FOR SELECT
USING (
  feedback_space_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.feedback_spaces 
    WHERE id = retrospectives.feedback_space_id 
    AND is_active = true
  )
);

-- Create trigger for feedback_spaces updated_at
CREATE TRIGGER update_feedback_spaces_updated_at
BEFORE UPDATE ON public.feedback_spaces
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique codes
CREATE OR REPLACE FUNCTION generate_unique_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
  code_exists boolean := true;
BEGIN
  WHILE code_exists LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    SELECT EXISTS(SELECT 1 FROM public.feedback_spaces WHERE unique_code = result) INTO code_exists;
  END LOOP;
  
  RETURN result;
END;
$$;